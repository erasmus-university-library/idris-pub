import colander
from idris.utils import (ErrorResponseSchema,
                         JsonMappingSchemaSerializerMixin)
from cornice.resource import view
from cornice.validators import colander_validator


class IdMintRequestSchema(colander.MappingSchema, JsonMappingSchemaSerializerMixin):
    @colander.instantiate()
    class body(colander.MappingSchema):
        next_id = colander.SchemaNode(colander.Integer())

class IdMintResponseSchema(colander.MappingSchema, JsonMappingSchemaSerializerMixin):
    @colander.instantiate()
    class body(colander.MappingSchema):
        current_id = colander.SchemaNode(colander.Integer())
        highest_observed_id = colander.SchemaNode(colander.Integer())


class BaseIdMinterAPI(object):

    def __init__(self, request, context):
        self.request = request
        self.context = context

    @view(
        permission='mint',
        response_schemas={
            '200': IdMintResponseSchema(description='Ok'),
            '401': ErrorResponseSchema(description='Unauthorized'),
        })
    def collection_get(self):
        return {
            'current_id': self.context.get_current_id(),
            'highest_observed_id': self.context.get_highest_observed_id()}

    @view(
        permission='mint',
        response_schemas={
            '200': IdMintResponseSchema(description='Ok'),
            '401': ErrorResponseSchema(description='Unauthorized'),
        })
    def collection_post(self):
        next_id = self.context.generate_next_id()
        return {'current_id': next_id,
                'highest_observed_id':  self.context.get_highest_observed_id()}

    @view(
        permission='mint',
        schema=IdMintRequestSchema(),
        validators=(colander_validator,),
        response_schemas={
            '200': IdMintResponseSchema(description='Ok'),
            '400': ErrorResponseSchema(description='Bad Request'),
            '401': ErrorResponseSchema(description='Unauthorized'),
        })
    def collection_put(self):
        next_id = self.request.validated['body']['next_id']
        highest_id = self.context.get_highest_observed_id()
        if next_id < highest_id:
            self.request.errors.add(
                'body', 'next_id', 'Must be at least %s' % highest_id)
            return self.request
        self.context.set_current_id(next_id)
        return {'current_id': next_id,
                'highest_observed_id':  highest_id}
