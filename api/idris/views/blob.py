import logging
import hashlib

import colander
from pyramid.httpexceptions import HTTPNotFound, HTTPPreconditionFailed

from cornice.resource import resource, view
from cornice.validators import colander_validator
from cornice import Service

from idris.models import Blob
from idris.resources import ResourceFactory, BlobResource

from idris.exceptions import StorageError
from idris.utils import (ErrorResponseSchema,
                           StatusResponseSchema,
                           OKStatus,
                           JsonMappingSchemaSerializerMixin,
                           colander_bound_repository_body_validator)


class BlobSchema(colander.MappingSchema, JsonMappingSchemaSerializerMixin):

    id = colander.SchemaNode(colander.Int())
    name = colander.SchemaNode(colander.String())
    bytes = colander.SchemaNode(colander.Int())

    format = colander.SchemaNode(colander.String(), missing=colander.drop)
    checksum = colander.SchemaNode(colander.String(), missing=colander.drop)
    upload_url = colander.SchemaNode(colander.String(), missing=colander.drop)


class BlobPostSchema(BlobSchema):
    # similar to blob schema, but key is optional
    id = colander.SchemaNode(colander.Int(), missing=colander.drop)


class BlobResponseSchema(colander.MappingSchema):
    body = BlobSchema()


class BlobListingResponseSchema(colander.MappingSchema):
    @colander.instantiate()
    class body(colander.MappingSchema):
        status = OKStatus
        total = colander.SchemaNode(colander.Int())
        offset = colander.SchemaNode(colander.Int())
        limit = colander.SchemaNode(colander.Int())

        @colander.instantiate()
        class records(colander.SequenceSchema):
            blob = BlobSchema()


class BlobListingRequestSchema(colander.MappingSchema):
    @colander.instantiate()
    class querystring(colander.MappingSchema):
        offset = colander.SchemaNode(colander.Int(),
                                   default=0,
                                   validator=colander.Range(min=0),
                                   missing=0)
        limit = colander.SchemaNode(colander.Int(),
                                    default=20,
                                    validator=colander.Range(0, 100),
                                    missing=20)


@resource(name='Blob',
          collection_path='/api/v1/blob/records',
          path='/api/v1/blob/records/{id}',
          tags=['blob'],
          cors_origins=('*', ),
          api_security=[{'jwt': []}],
          factory=ResourceFactory(BlobResource))
class BlobRecordAPI(object):
    def __init__(self, request, context):
        self.request = request
        self.response = request.response
        self.context = context

    @view(permission='add',
          schema=BlobPostSchema(),
          validators=(colander_bound_repository_body_validator,),
          cors_origins=('*', ),
          response_schemas={
              '201': BlobResponseSchema(description='Created'),
              '400': ErrorResponseSchema(description='Bad Request'),
              '401': ErrorResponseSchema(description='Unauthorized'),
              '403': ErrorResponseSchema(description='Forbidden'),
          })
    def collection_post(self):
        "Create a new Blob"
        blob = Blob.from_dict(self.request.validated)
        try:
            self.context.put(blob)
        except StorageError as err:
            self.request.errors.status = 400
            self.request.errors.add('body', err.location, str(err))
            return

        self.request.response.status = 201
        result = BlobSchema().to_json(blob.to_dict())
        result['upload_url'] = self.request.repository.blob.upload_url(
            result['id'])
        return result

    @view(
        permission='download')
    def get(self):
        "Download a Blob"
        blobstore = self.request.repository.blob
        if not self.context.model.finalized:
            self.request.errors.status = 412
            self.request.errors.add(
                'body', '', 'blob has not been finalized')
            return
        self.response.content_type = self.context.model.format
        self.content_length = self.context.model.bytes
        blobstore.serve_blob(self.request,
                             self.response,
                             self.context)
        return self.response

    @view(
        permission='finalize',
        cors_origins=('*', ),
        response_schemas={
            '200': BlobResponseSchema(description='Ok'),
            '401': ErrorResponseSchema(description='Unauthorized'),
            '403': ErrorResponseSchema(description='Forbidden'),
            '404': ErrorResponseSchema(description='Not Found'),
        })
    def put(self):
        "Finalize a blob"
        if self.request.content_length != 0:
            self.request.errors.add('body', '', 'expected empty body')
            return
        blobstore = self.request.repository.blob
        if not blobstore.blob_exists(self.context.model.id):
            self.request.errors.status = 412
            self.request.errors.add(
                'body', '', 'file is missing (not uploaded yet?)')
            return
        self.context.model.finalized = True
        blobstore.transform_blob(self.context)
        return self.context.model.to_dict()


blob_upload = Service(name='BlobUpload',
                      path='/api/v1/blob/upload/{id}',
                      factory=ResourceFactory(BlobResource),
                      api_security=[{'jwt': []}],
                      tags=['blob'],
                      cors_origins=('*', ))


@blob_upload.put(permission='upload')
def blob_upload_local_view(request):
    blobstore = request.repository.blob
    if blobstore.blob_exists(request.context.model.id):
        raise HTTPPreconditionFailed()

    blobstore.receive_blob(request, request.context)
    return BlobSchema().to_json(request.context.model.to_dict())


blob_transform = Service(name='BlobTransform',
                         path='/api/v1/blob/transform/{id}',
                         factory=ResourceFactory(BlobResource),
                         api_security=[{'jwt': []}],
                         tags=['blob'],
                         cors_origins=('*', ))


@blob_transform.post(permission='transform')
def blob_transform_view(request):
    blobstore = request.repository.blob
    if not blobstore.blob_exists(request.context.model.id):
        raise HTTPPreconditionFailed('File is missing')

    blobstore.transform_blob(request.context)
    return request.context.model.to_dict()


blob_download = Service(name='BlobDownload',
                        path='/api/v1/blob/download/{id}',
                        factory=ResourceFactory(BlobResource),
                        api_security=[{'jwt': []}],
                        tags=['blob'],
                        cors_origins=('*', ))


@blob_download.get(permission='download')
def blob_download_local_view(request):
    blobstore = request.repository.blob
    if not blobstore.blob_exists(request.context.model.id):
        raise HTTPPreconditionFailed('File is missing')
    response = request.response
    response.content_type = request.context.model.format
    response.content_length = request.context.model.bytes
    request.repository.blob.serve_blob(request,
                                       response,
                                       request.context)
    return response
