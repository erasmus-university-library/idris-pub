import os
import re
import codecs
import datetime
import hashlib
import subprocess
import tempfile
import base64

from pyramid.httpexceptions import HTTPFound

from zope.interface import implementer
from google.cloud import storage
from google.auth import app_engine

from idris.interfaces import IBlobStoreBackend, IBlobTransform


class BlobStore(object):
    def __init__(self, backend):
        self.backend = backend
        self.registry = self.backend.repository.registry

    def blob_exists(self, blob_id):
        return self.backend.blob_exists(blob_id)

    def upload_url(self, blob, origin=None):
        return self.backend.upload_url(blob, origin)

    def receive_blob(self, request, blob):
        return self.backend.receive_blob(request, blob)

    def serve_blob(self, request, response, blob):
        if not blob.model.finalized:
            self.finalize_blob(blob)
        return self.backend.serve_blob(request, response, blob)

    def finalize_blob(self, blob):
        if not self.backend.blob_exists(blob.model.id):
            return False
        if not blob.model.checksum:
            blob.model.checksum = self.backend.blob_checksum(
                blob.model.id)
        self.backend.finalize_blob_headers(blob)
        if not blob.model.finalized:
            blob.model.finalized = True
        blob.put()
        return True

    def transform_blob(self, blob):
        transformer = self.registry.queryUtility(IBlobTransform,
                                                 blob.model.format)
        output = {'status': 'ok'}

        if transformer is None:
            output['transformer'] = None
            return output
        output['transformer'] = transformer.name
        local_blob_path = self.backend.local_path(blob.model.id)
        transformer(blob, self.backend).execute(local_blob_path)
        if self.backend.remote_storage is True:
            os.remove(local_blob_path)

        blob.model.transform_name = transformer.name


@implementer(IBlobStoreBackend)
class LocalBlobStore(object):
    remote_storage = False

    def __init__(self, repo_config):
        self.repository = repo_config
        self._path = self.root_path(
            repo_config.registry.settings['idris.blob_root_prefix'],
            self.repository.namespace)

    @classmethod
    def root_path(cls, path, namespace):
        if path.startswith('/'):
            root = path
        else:
            root = os.path.dirname(__file__)
            root = os.path.dirname(root)
            root = os.path.join(root,
                                path,
                                namespace)
        return root

    def _blob_path(self, blob_id, kind='primary', makedirs=False):
        directory = os.path.join(
            self._path,
            kind,
            '%0.3d' % int(str(blob_id)[-3:]))
        if makedirs and not os.path.isdir(directory):
            os.makedirs(directory)
        return os.path.join(directory, str(blob_id))

    def blob_exists(self, blob_id):
        "Determine if a blob exists in the filesystem"
        return os.path.isfile(self._blob_path(blob_id))

    def upload_url(self, blob, origin=None):
        "Create an upload url that can be used to POST bytes"
        return '%s/api/v1/blob/upload/%s' % (self.repository.api_host_url,
                                             blob.id)

    def finalize_blob_headers(self, blob):
        pass

    def public_preview_url(self, blob_id, kind):
        return '%s/api/v1/blob/preview/%s' % (self.repository.api_host_url,
                                              blob_id)

    def local_path(self, blob_id):
        return self._blob_path(blob_id)

    def serve_preview_blob(self, request, response, blob):
        "Modify the response to servce bytes from blob_key"
        response.content_type = 'image/jpeg'
        preview_kind =  blob.model.info.get('preview_blob')
        path = self._blob_path(blob.model.id, preview_kind)
        with open(path, 'rb') as fp:
            response.body = fp.read()
        return response

    def serve_blob(self, request, response, blob):
        "Modify the response to servce bytes from blob_key"
        response.content_type = blob.model.format
        response.content_disposition = (
            'attachment; filename=%s' % blob.model.name)
        path = self._blob_path(blob.model.id)
        with open(path, 'rb') as fp:
            response.body = fp.read()
        return response

    def receive_blob(self, request, blob):
        path = self._blob_path(str(blob.model.id),
                               makedirs=True)
        with open(path, 'wb') as fp:
            fp.write(request.body)
        blob.model.checksum = hashlib.md5(request.body).hexdigest()

    def has_transform_data(self, blob_key, transform_id):
        path = self._blob_path(str(blob_key),
                               makedirs=True,
                               kind=transform_id)
        return os.path.isfile(path)

    def write_transform_data(self, blob_key, transform_id, data, content_type):
        path = self._blob_path(str(blob_key),
                               makedirs=True,
                               kind=transform_id)
        with open(path, 'wb') as fp:
            fp.write(data)

    def read_transform_data(self, blob_key, transform_id):
        path = self._blob_path(str(blob_key),
                               makedirs=True,
                               kind=transform_id)
        with open(path, 'rb') as fp:
            return fp.read()


@implementer(IBlobStoreBackend)
class GCSBlobStore(object):
    remote_storage = True

    def __init__(self, repo_config):
        self.repository = repo_config
        self.bucket_name = '%s-%s' % (
            repo_config.registry.settings['idris.blob_root_prefix'],
            self.repository.namespace)
        self.client = storage.Client().from_service_account_json(
            repo_config.registry.settings[
                'idris.google_application_credentials'])
        self.bucket = self.client.get_bucket(self.bucket_name)
        self.blob_path = 'blobs'

    def _blob_path(self, blob_id, kind='primary'):
        return os.path.join(self.blob_path,
                            kind,
                            '%0.3d' % int(str(blob_id)[-3:]),
                            str(blob_id))

    def blob_exists(self, blob_id):
        "Determine if a blob exists in the filesystem"
        return self.bucket.get_blob(self._blob_path(blob_id)) is not None

    def blob_checksum(self, blob_id):
        hash = self.bucket.get_blob(
            self._blob_path(blob_id)).md5_hash.encode('utf8')
        return codecs.encode(
            codecs.decode(hash, 'base64'), 'hex').decode('utf8')

    def upload_url(self, blob, origin=None):
        "Create an upload url that can be used to POST bytes"
        path = self._blob_path(blob.id)
        gcs_blob = storage.Blob(name=path, bucket=self.bucket)
        return gcs_blob.create_resumable_upload_session(
            content_type=blob.format.encode('utf8'),
            size=blob.bytes,
            origin=origin)

    def finalize_blob_headers(self, blob):
        gcs_blob = self.bucket.get_blob(self._blob_path(blob.model.id))
        if gcs_blob.size and gcs_blob.content_type != blob.model.format:
            # make sure the blob in GCS has correct content_type header
            # this will be missing if upload was in bulk through gsutil
            gcs_blob.content_type = blob.model.format
            gcs_blob.update()
        for transform_blob in (blob.model.info or {}).get('transform_blobs', []):
            content_type = {'pdftext': 'text/plain',
                            'thumb': 'image/jpeg',
                            'pdfcover': 'image/jpeg'}.get(transform_blob)
            tf_blob = self.bucket.get_blob(
                self._blob_path(blob.model.id, transform_blob))
            if tf_blob.size and tf_blob.content_type != content_type:
                tf_blob.content_type = blob.model.format
                tf_blob.update()
            if transform_blob == blob.model.info.get('preview_blob'):
                # make sure the preview_blob is publically accessible
                tf_blob.make_public()

    def public_preview_url(self, blob_id, kind):
        return self.bucket.get_blob(
            self._blob_path(blob_id, kind)).media_link

    def local_path(self, blob_id):
        target = tempfile.mktemp(prefix='gcs-%s-%s-' % (
            self.repository.namespace, blob_id))
        blob = self.bucket.get_blob(self._blob_path(blob_id))
        blob.download_to_filename(target)
        return target

    def serve_blob(self, request, response, blob):
        gcs_blob = self.bucket.get_blob(self._blob_path(blob.model.id))
        signed_url = gcs_blob.generate_signed_url(
            expiration=datetime.timedelta(minutes=15),
            method='GET',
            response_disposition= 'attachment; filename="%s"' % blob.model.name)
        raise HTTPFound(location=signed_url)

    def has_transform_data(self, blob_key, transform_id):
        path = self._blob_path(str(blob_key),
                               kind=transform_id)
        gcs_blob = storage.Blob(name=path, bucket=self.bucket)
        return gcs_blob.exists()

    def write_transform_data(self, blob_key, transform_id, data, content_type):
        path = self._blob_path(str(blob_key),
                               kind=transform_id)
        gcs_blob = storage.Blob(name=path, bucket=self.bucket)
        gcs_blob.upload_from_string(data, content_type=content_type)

    def read_transform_data(self, blob_key, transform_id):
        path = self._blob_path(str(blob_key),
                               kind=transform_id)
        gcs_blob = storage.Blob(name=path, bucket=self.bucket)
        return gcs_blob.download_as_string()

@implementer(IBlobTransform)
class PDFTransform(object):
    name = 'PDFTransform 1.0'

    def __init__(self, blob, backend):
        self.blob = blob
        self.backend = backend

    def execute(self, path):
        info = self.pdf_info(path)
        text = self.pdf_text(path)
        info['words'] = len(text.split())
        info['dois'] = re.compile('[\/|:|\s](10\.[\S]+)').findall(text)
        info['preview_blob'] = None
        info['transform_blobs'] = ['pdftext']
        self.blob.model.text = text
        created_cover_and_thumb = self.pdf_cover(path)
        if created_cover_and_thumb:
            info['transform_blobs'].append('pdfcover')
            info['transform_blobs'].append('thumb')
            info['preview_blob'] = 'thumb'
            info['preview_url'] = self.backend.public_preview_url(
                self.blob.model.id, 'thumb')
        self.blob.model.info = info

    def pdf_cover(self, path, thumbnail_height=200):
        """This command uses imageMagick.
        By default form version 6, you will have to change the line:
        <policy domain="coder" rights="none" pattern="PDF" />
        into:
        <policy domain="coder" rights="read" pattern="PDF" />
        So ImageMagick will read the PDF files
        For more information on policy.xml see:
        https://imagemagick.org/script/security-policy.php
        """

        jpg_file = tempfile.mktemp(prefix='pdfjson-', suffix='.jpg')
        self._call_with_timeout('convert', [path+'[0]', jpg_file])
        # write cover image to the blob backend
        with open(jpg_file, 'rb') as fp:
            self.backend.write_transform_data(
                self.blob.model.id,
                'pdfcover',
                fp.read(),
                'image/jpeg')

        thumb_file = tempfile.mktemp(prefix='pdfjson-thumb-', suffix='.jpg')
        self._call_with_timeout('convert',
                                ['-thumbnail', 'x%s' % thumbnail_height,
                                 jpg_file, thumb_file])

        with open(thumb_file, 'rb') as fp:
            self.backend.write_transform_data(
                self.blob.model.id,
                'thumb',
                fp.read(),
                'image/jpeg')

        os.remove(jpg_file)
        os.remove(thumb_file)
        return True

    def pdf_text(self, path):
        output = self._call_with_timeout(
            'pdftotext', [path, '-']).decode('utf8')
        # write cover image to the blob backend
        self.backend.write_transform_data(
            self.blob.model.id,
            'pdftext',
            output.encode('utf8'),
            'text/plain')
        return output.strip()

    def pdf_info(self, path):
        result = {}
        output = self._call_with_timeout('pdfinfo', [path]).decode('utf8')
        for line in output.splitlines():
            if ':' not in line:
                continue
            key, value = line.split(':', 1)
            key = key.strip()
            value = value.strip()
            result[key] = value

        info = {'version': result.get('PDF version'),
                'creator': result.get('Creator'),
                'rotation': result.get('Page rot', '0')}
        if 'Pages' in result and result['Pages'].isdigit():
            info['pages'] = int(result['Pages'])
        return info

    def _call_with_timeout(self, command, args, timeout=10):
        p = subprocess.Popen(['timeout', str(timeout), command] + args,
                             stdout=subprocess.PIPE,
                             stderr=subprocess.PIPE)
        output = p.stdout.read()
        retval = p.wait()
        if retval != 0:
            raise ValueError('Running "%s" returned status %s: %s' % (
                command, retval, p.stderr.read()))
        return output


def includeme(config):
    config.registry.registerUtility(LocalBlobStore,
                                    IBlobStoreBackend,
                                    'local')
    config.registry.registerUtility(GCSBlobStore,
                                    IBlobStoreBackend,
                                    'gcs')
    config.registry.registerUtility(PDFTransform,
                                    IBlobTransform,
                                    'application/pdf')
