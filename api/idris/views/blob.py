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
                         OKStatusResponseSchema,
                         OKStatus,
                         JsonString,
                         Base64String,
                         JsonMappingSchemaSerializerMixin,
                         colander_bound_repository_body_validator)
from idris.views.id_mint import BaseIdMinterAPI


class BlobSchema(colander.MappingSchema, JsonMappingSchemaSerializerMixin):

    def schema_type(self, **kw):
        return colander.Mapping(unknown="raise")

    id = colander.SchemaNode(colander.Int())
    name = colander.SchemaNode(colander.String())
    bytes = colander.SchemaNode(colander.Int())

    format = colander.SchemaNode(colander.String(), missing=colander.drop)
    checksum = colander.SchemaNode(colander.String(), missing=colander.drop)
    upload_url = colander.SchemaNode(colander.String(), missing=colander.drop)

class BlobFinalizedSchema(BlobSchema):
    transform_name = colander.SchemaNode(colander.String(),
                                         missing=colander.drop)
    info = colander.SchemaNode(JsonString(), missing=colander.drop)
    text = colander.SchemaNode(colander.String(),
                               missing=colander.drop)
    thumbnail = colander.SchemaNode(Base64String(),
                                    missing=colander.drop)
    finalized = colander.SchemaNode(colander.Boolean(),  missing=colander.drop)

class BlobBulkRequestSchema(colander.MappingSchema,
                            JsonMappingSchemaSerializerMixin):
    @colander.instantiate()
    class records(colander.SequenceSchema):
        blob = BlobFinalizedSchema()


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
            blob, self.request.headers.get('Origin'))
        return result

    @view(
        permission='download')
    def get(self):
        "Download a Blob"
        # XXX maybe this call shoud always return the blob metadata
        if self.request.headers.get('Accept') == 'application/json':
            result = BlobFinalizedSchema().to_json(
                self.context.model.to_dict())
            return result

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
        blobstore.finalize_blob(self.context)
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


blob_bulk = Service(
    name='BlobBulk',
    path='/api/v1/blob/bulk',
    factory=ResourceFactory(BlobResource),
    api_security=[{'jwt': []}],
    tags=['blob'],
    cors_origins=('*', ),
    schema=BlobBulkRequestSchema(),
    validators=(colander_bound_repository_body_validator,),
    response_schemas={
        '200': OKStatusResponseSchema(description='Ok'),
        '400': ErrorResponseSchema(description='Bad Request'),
        '401': ErrorResponseSchema(description='Unauthorized')})


@blob_bulk.post(permission='import')
def blob_bulk_import_view(request):
    # get existing resources from submitted bulk
    keys = [r['id'] for r in request.validated['records'] if r.get('id')]
    existing_records = {
        r.id: r for r in request.context.get_many(keys) if r}
    models = []
    for record in request.validated['records']:
        if record['id'] in existing_records:
            model = existing_records[record['id']]
            model.update_dict(record)
        else:
            model = request.context.orm_class.from_dict(record)
        models.append(model)
    models = request.context.put_many(models)
    request.response.status = 201
    return {'status': 'ok'}

@resource(
    name='BlobIds',
    collection_path='/api/v1/blob/ids',
    path='/api/v1/blob/ids/{id}',
    tags=['blob'],
    cors_origins=('*', ),
    api_security=[{'jwt': []}],
    factory=ResourceFactory(BlobResource))
class BlobIdMinter(BaseIdMinterAPI):
    pass
