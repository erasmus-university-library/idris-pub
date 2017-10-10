import colander
from cornice.resource import resource, view
from cornice.validators import colander_body_validator, colander_validator
from pyramid.httpexceptions import HTTPNotFound

from caleido.models import User
from caleido.resources import UserResource

from caleido.utils import (ErrorResponseSchema,
                           StatusResponseSchema)

def user_factory(request):
    key = request.matchdict.get('id')
    user = UserResource(request.registry,
                        request.dbsession,
                        key)
    if key and user.model is None:
        raise HTTPNotFound()
    return user

class UserSchema(colander.MappingSchema):
    id = colander.SchemaNode(colander.Int(), missing=colander.drop)
    user_group = colander.SchemaNode(colander.Int())
    userid = colander.SchemaNode(colander.String())
    credentials = colander.SchemaNode(colander.String())

class UserResponseSchema(colander.MappingSchema):
    body = UserSchema()

class UserListingResponseSchema(colander.MappingSchema):
    @colander.instantiate()
    class body(colander.MappingSchema):
        @colander.instantiate()
        class records(colander.SequenceSchema):
            user = UserSchema()
        total = colander.SchemaNode(colander.Int())
        offset = colander.SchemaNode(colander.Int())
        limit = colander.SchemaNode(colander.Int())

class UserListingRequestSchema(colander.MappingSchema):
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

@resource(name='User',
          collection_path='/api/v1/users',
          path='/api/v1/users/{id}',
          tags=['user'],
          api_security=[{'jwt':[]}],
          factory=user_factory)
class UserAPI(object):
    def __init__(self, request, context):
        self.request = request
        self.context = context

    @view(permission='view',
          response_schemas={
        '200': UserResponseSchema(description='Ok'),
        '401': ErrorResponseSchema(description='Unauthorized'),
        '403': ErrorResponseSchema(description='Forbidden'),
        '404': ErrorResponseSchema(description='Not Found'),
        })
    def get(self):
        "Retrieve a User"
        return UserSchema().serialize(self.context.model.to_dict())


    @view(permission='delete',
          response_schemas={
        '200': StatusResponseSchema(description='Ok'),
        '401': ErrorResponseSchema(description='Unauthorized'),
        '403': ErrorResponseSchema(description='Forbidden'),
        '404': ErrorResponseSchema(description='Not Found'),
        })
    def delete(self):
        "Delete a User"
        self.context.delete()
        return {'status': 'ok'}

    @view(permission='add',
          schema=UserSchema(),
          validators=(colander_body_validator,),
          response_schemas={
        '201': UserResponseSchema(description='Created'),
        '400': ErrorResponseSchema(description='Bad Request'),
        '401': ErrorResponseSchema(description='Unauthorized'),
        '403': ErrorResponseSchema(description='Forbidden'),
        })
    def collection_post(self):
        "Create a new User"
        user = User.from_dict(self.request.validated)
        self.context.put(user)
        # force reload the user from db to retrieve the credentials hash
        self.context.session.refresh(user)
        user = self.context.get(user.id)
        self.request.response.status = 201
        return UserSchema().serialize(user.to_dict())


    @view(permission='view',
          schema=UserListingRequestSchema(),
          validators=(colander_validator),
          response_schemas={
        '200': UserListingResponseSchema(description='Ok'),
        '400': ErrorResponseSchema(description='Bad Request'),
        '401': ErrorResponseSchema(description='Unauthorized')})
    def collection_get(self):
        offset = self.request.validated['querystring']['offset']
        limit = self.request.validated['querystring']['limit']
        listing = self.context.search(
            offset=offset,
            limit=limit,
            principals=self.request.effective_principals)
        return {'total': listing['total'],
                'records': [user.to_dict() for user in listing['hits']],
                'limit': limit,
                'offset': offset}
