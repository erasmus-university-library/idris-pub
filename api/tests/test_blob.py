import os
import json
import codecs
from core import BaseTest, no_google_credentials


class BlobStorageTest(BaseTest):

    def test_blob_upload_as_admin(self):
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
        upload_headers = headers.copy()
        upload_headers['Content-Length'] = str(len(content))
        upload_headers['Content-Type'] = 'text/plain'
        out = self.api.put(upload_url,
                           content,
                           headers=upload_headers,
                           status=200)
        # finalize the blob by issueing a PUT on the blob record
        out = self.api.put_json('/api/v1/blob/records/%s' % blob_id,
                                headers=headers,
                                status=200)
        assert out.json['checksum'] == '702edca0b2181c15d457eacac39de39b'

    @no_google_credentials
    def test_pdf_transforms(self):
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
        upload_headers = headers.copy()
        upload_headers['Content-Length'] = str(len(content))
        upload_headers['Content-Type'] = 'application/pdf'
        out = self.api.put(upload_url,
                           content,
                           headers=upload_headers,
                           status=200)
        out = self.api.put('/api/v1/blob/records/%s' % blob_id,
                           headers=headers,
                           status=200)

        assert out.json['checksum'] == '3d0c5a07a69b6a9b3615a44881be654c'
        assert out.json.get('info').get('pages') == 1
        assert out.json.get('info').get('words') == 4
        assert out.json.get('text') == 'This is a test!'

    def test_bulk_blob_upload(self):
        # instead of uploading blob files, it is also possible
        # to import metadata only in bulk, if the file is there

        headers = dict(Authorization='Bearer %s' % self.admin_token())
        out = self.api.post_json(
            '/api/v1/blob/bulk',
            {'records': [{'id': 1,
                          'name': 'test.pdf',
                          'bytes': 1234,
                          'finalized': True,
                          'info': json.dumps({'foo': None}),
                          'text': 'hello',
                          'thumbnail': codecs.encode(
                              b'hello', 'base64').decode('utf8'),
                          'format': 'application/pdf'}]},
                                 headers=headers,
                                 status=201)
        assert out.json['status'] == 'ok'
        # we can't download the blob, since it is not connected to a
        # work yet
        out = self.api.post_json(
            '/api/v1/work/records',
            {'title': 'A test article.',
             'issued': '2018-02-26',
             'type': 'article',
             'expressions': [{'type': 'publication',
                              'format': 'manuscript',
                              'access': 'public',
                              'name': 'test.txt',
                              'blob_id': 1}]},
            headers=headers)
        assert out.status_code == 201
        # now we can download the blob through the work
        # we add a header specifying we want the metadata
        # instead of the blob
        headers['Accept'] = 'application/json'
        out = self.api.get('/api/v1/blob/records/1',
                           headers=headers,
                           status=200)
        assert out.json['name'] == 'test.pdf'
        assert out.json['finalized'] == True
        assert out.json['info'] == '{"foo": null}'
        assert out.json['text'] == 'hello'
        assert out.json['thumbnail'] == 'aGVsbG8=\n'


    def test_work_expression(self):
        content = 'This is a test!'.encode('utf8')
        headers = dict(Authorization='Bearer %s' % self.admin_token())
        out = self.api.post_json('/api/v1/blob/records',
                                 {'name': 'test.txt',
                                  'bytes': str(len(content)),
                                  'format': 'text/plain'},
                                 headers=headers,
                                 status=201)
        blob_id = out.json['id']
        upload_headers = headers.copy()
        upload_headers['Content-Length'] = str(len(content))
        upload_headers['Content-Type'] = 'text/plain'
        self.api.put(out.json['upload_url'],
                     content,
                     headers=upload_headers,
                     status=200)
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
                           status=200)
        assert out.content_type == 'text/plain'
        assert out.body == b'This is a test!'
