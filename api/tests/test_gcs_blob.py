import os
from core import BaseTest, no_google_credentials
import requests

import pytest


@pytest.mark.skipif(os.environ.get('TESTENV') == 'travis',
                    reason='No GCP support when running in Travis')
@no_google_credentials
class GCSBlobStorageTest(BaseTest):

    def app_settings(self):
        settings = super(GCSBlobStorageTest, self).app_settings()
        settings['idris.blob_backend'] = 'gcs'
        settings['idris.blob_root_prefix'] = settings[
            'idris.google_cloud_project']
        return settings

    def test_blob_gcs_upload_as_admin(self):
        content = 'This is a test!'.encode('utf8')
        headers = dict(Authorization='Bearer %s' % self.admin_token())
        # first retrieve the upload url by creating a new blob
        out = self.api.post_json('/api/v1/blob/records',
                                 {'name': 'test.txt',
                                  'bytes': str(len(content)),
                                  'format': 'text/plain'},
                                 headers=headers,
                                 status=201)
        blob_id = out.json['id']
        upload_url = out.json['upload_url']

        # upload the raw data using PUT to the upload url
        response = requests.put(upload_url, content)
        assert response.status_code == 200

        # finalize the blob by issueing a PUT on the blob record
        out = self.api.put_json('/api/v1/blob/records/%s' % blob_id,
                                headers=headers,
                                status=200)
        assert out.json['checksum'] == '702edca0b2181c15d457eacac39de39b'

    def test_gcs_pdf_transforms(self):
        content = open(os.path.join(os.path.dirname(__file__),
                                    'blobs',
                                    'test.pdf'), 'rb').read()

        headers = dict(Authorization='Bearer %s' % self.admin_token())
        out = self.api.post_json('/api/v1/blob/records',
                                 {'name': 'test.pdf',
                                  'bytes': len(content),
                                  'format': 'application/pdf'},
                                 headers=headers,
                                 status=201)
        blob_id = out.json['id']
        upload_url = out.json['upload_url']
        response = requests.put(upload_url, content)
        assert response.status_code == 200

        out = self.api.put('/api/v1/blob/records/%s' % blob_id,
                           headers=headers,
                           status=200)
        assert out.json['checksum'] == '3d0c5a07a69b6a9b3615a44881be654c'
        info = out.json.get('info', {})

        assert info.get('pages') == 1
        assert info.get('words') == 4
        assert out.json.get('text') == 'This is a test!'

        # there is a cover and thumbnail, the thumbnail
        # is used as a preview_url
        assert 'pdftext' in info.get('transform_blobs', [])
        assert 'pdfcover' in info.get('transform_blobs', [])
        assert 'thumb' in info.get('transform_blobs', [])
        assert info['preview_blob'] == 'thumb'
        # since there is a preview_blob, we can get a public preview url
        preview_url = info['preview_url']
        out = requests.get(preview_url)
        assert out.headers['content-type'] == 'image/jpeg'
        assert out.content[:10].endswith(b'JFIF')


    def test_gcs_work_expression(self):
        content = 'This is a test!'.encode('utf8')
        headers = dict(Authorization='Bearer %s' % self.admin_token())
        out = self.api.post_json('/api/v1/blob/records',
                                 {'name': 'test.txt',
                                  'bytes': str(len(content)),
                                  'format': 'text/plain'},
                                 headers=headers,
                                 status=201)
        blob_id = out.json['id']
        upload_url = out.json['upload_url']

        response = requests.put(upload_url, content)
        assert response.status_code == 200

        out = self.api.put('/api/v1/blob/records/%s' % blob_id,
                           headers=headers,
                           status=200)
        # we can't download the blob, since it is not connected to a
        # work yet
        out = self.api.get('/api/v1/blob/records/%s' % blob_id,
                           headers=headers,
                           status=403)
        # add the blob to a work
        out = self.api.post_json(
            '/api/v1/work/records',
            {'title': 'A test article.',
             'issued': '2018-02-26',
             'type': 'article',
             'expressions': [{'type': 'publication',
                              'format': 'manuscript',
                              'access': 'public',
                              'name': 'test.txt',
                              'description': 'Just a test file..',
                              'blob_id': blob_id}]},
            headers=headers)
        assert out.status_code == 201
        # now we can download the blob through the work
        out = self.api.get('/api/v1/blob/records/%s' % blob_id,
                           headers=headers,
                           status=302)
        download_url = out.location
        response = requests.get(download_url)
        assert response.headers['Content-Disposition'] == (
            'attachment; filename=test.txt')
        assert response.headers['Content-Type'] == 'text/plain'
        assert response.content == b'This is a test!'
