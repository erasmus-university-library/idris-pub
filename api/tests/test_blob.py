import os
from core import BaseTest


class BlobStorageTest(BaseTest):

    def test_blob_upload_as_admin(self):
        content = 'This is a test!'.encode('utf8')
        headers = dict(Authorization='Bearer %s' % self.admin_token())
        out = self.api.post_json('/api/v1/blob/records',
                                 {'name': 'test.txt',
                                  'bytes': str(len(content)),
                                  'format': 'text/plain'},
                                 headers=headers,
                                 status=201)
        blob_id = out.json['id']
        # note that the id returned is pseudo randomized
        assert blob_id > 1
        upload_url = out.json['upload_url']
        upload_headers = headers.copy()
        upload_headers['Content-Length'] = str(len(content))
        upload_headers['Content-Type'] = 'text/plain'
        out = self.api.post(upload_url,
                            content,
                            headers=upload_headers,
                            status=200)
        # there is no way to download a blob, it has to be connected
        # to a work first.
        out = self.api.get('/api/v1/blob/records/%s' % blob_id,
                           headers=headers,
                           status=200)
        assert out.json['checksum'] == '702edca0b2181c15d457eacac39de39b'

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
        out = self.api.post(upload_url,
                            content,
                            headers=upload_headers,
                            status=200)
        out = self.api.get('/api/v1/blob/records/%s' % blob_id,
                           headers=headers,
                           status=200)
        assert out.json['checksum'] == '3d0c5a07a69b6a9b3615a44881be654c'
        # now run the transforms
        out = self.api.post('/api/v1/blob/transform/%s' % blob_id,
                            headers=headers,
                            status=200)

        assert out.json.get('info').get('pages') == 1
        assert out.json.get('info').get('words') == 4
        assert out.json.get('text') == 'This is a test!'

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
        self.api.post(out.json['upload_url'],
                      content,
                      headers=upload_headers,
                      status=200)
        out = self.api.post_json(
            '/api/v1/work/records',
            {'title': 'A test article.',
             'issued': '2018-02-26',
             'type': 'article',
             'expressions': [{'type': 'publication',
                              'format': 'manuscript',
                              'rights': 'openAccess',
                              'description': 'Just a test file..',
                              'blob_id': blob_id}]},
            headers=headers)
        assert out.status_code == 201
        # now we can download the blob through the work
        pub_id = out.json['id']
        out = self.api.get('/api/v1/blob/download/%s' % blob_id,
                           headers=headers,
                           status=200)
