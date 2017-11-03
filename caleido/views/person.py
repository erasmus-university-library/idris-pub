import colander
from cornice.resource import resource, view
from cornice.validators import colander_validator
from cornice import Service

from caleido.models import Person
from caleido.resources import ResourceFactory, PersonResource

from caleido.exceptions import StorageError
from caleido.utils import (ErrorResponseSchema,
                           StatusResponseSchema,
                           OKStatusResponseSchema,
                           JsonMappingSchemaSerializerMixin,
                           colander_bound_repository_body_validator)

@colander.deferred
def deferred_account_type_validator(node, kw):
    types = kw['repository'].type_config('person_account_type')
    return colander.OneOf([t['key'] for t in types])


def person_validator(node, kw):
    if not kw.get('given_name') and not kw.get('initials'):
        node.name = '%s.initials' % node.name
        raise colander.Invalid(
            node, "Required: supply one of 'initials' or 'given_name'")

class PersonSchema(colander.MappingSchema, JsonMappingSchemaSerializerMixin):
    def __init__(self, *args, **kwargs):
        kwargs['validator'] = person_validator
        super(PersonSchema, self).__init__(*args, **kwargs)

    id = colander.SchemaNode(colander.Int())
    name = colander.SchemaNode(colander.String(),
                                missing=colander.drop)
    family_name = colander.SchemaNode(colander.String())
    family_name_prefix = colander.SchemaNode(colander.String(),
                                             missing=colander.drop)
    given_name = colander.SchemaNode(colander.String(), missing=colander.drop)
    initials = colander.SchemaNode(colander.String(), missing=colander.drop)
    honorary = colander.SchemaNode(colander.String(), missing=colander.drop)


    @colander.instantiate(missing=colander.drop)
    class accounts(colander.SequenceSchema):
        @colander.instantiate()
        class account(colander.MappingSchema):
            type = colander.SchemaNode(colander.String(),
                                       validator=deferred_account_type_validator)
            value = colander.SchemaNode(colander.String())

class PersonPostSchema(PersonSchema):
    # similar to person schema, but id is optional
    id = colander.SchemaNode(colander.Int(), missing=colander.drop)

class PersonResponseSchema(colander.MappingSchema):
    body = PersonSchema()

class PersonListingResponseSchema(colander.MappingSchema):
    @colander.instantiate()
    class body(colander.MappingSchema):
        @colander.instantiate()
        class records(colander.SequenceSchema):
            person = PersonSchema()
        total = colander.SchemaNode(colander.Int())
        offset = colander.SchemaNode(colander.Int())
        limit = colander.SchemaNode(colander.Int())

class PersonListingRequestSchema(colander.MappingSchema):
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

class PersonBulkRequestSchema(colander.MappingSchema):
    @colander.instantiate()
    class records(colander.SequenceSchema):
        person = PersonSchema()

@resource(name='Person',
          collection_path='/api/v1/person/records',
          path='/api/v1/person/records/{id}',
          tags=['person'],
          api_security=[{'jwt':[]}],
          factory=ResourceFactory(PersonResource))
class PersonRecordAPI(object):
    def __init__(self, request, context):
        self.request = request
        self.context = context

    @view(permission='view',
          response_schemas={
        '200': PersonResponseSchema(description='Ok'),
        '401': ErrorResponseSchema(description='Unauthorized'),
        '403': ErrorResponseSchema(description='Forbidden'),
        '404': ErrorResponseSchema(description='Not Found'),
        })
    def get(self):
        "Retrieve a Person"
        return PersonSchema().to_json(self.context.model.to_dict())

    @view(permission='edit',
          schema=PersonSchema(),
          validators=(colander_bound_repository_body_validator,),
          response_schemas={
        '200': PersonResponseSchema(description='Ok'),
        '401': ErrorResponseSchema(description='Unauthorized'),
        '403': ErrorResponseSchema(description='Forbidden'),
        '404': ErrorResponseSchema(description='Not Found'),
        })
    def put(self):
        "Modify an Person"
        body = self.request.validated
        body['id'] = int(self.request.matchdict['id'])
        self.context.model.update_dict(body)
        try:
            self.context.put()
        except StorageError as err:
            self.request.errors.status = 400
            self.request.errors.add('body', err.location, str(err))
            return
        return PersonSchema().to_json(self.context.model.to_dict())


    @view(permission='delete',
          response_schemas={
        '200': StatusResponseSchema(description='Ok'),
        '401': ErrorResponseSchema(description='Unauthorized'),
        '403': ErrorResponseSchema(description='Forbidden'),
        '404': ErrorResponseSchema(description='Not Found'),
        })
    def delete(self):
        "Delete an Person"
        self.context.delete()
        return {'status': 'ok'}

    @view(permission='add',
          schema=PersonPostSchema(),
          validators=(colander_bound_repository_body_validator,),
          response_schemas={
        '201': PersonResponseSchema(description='Created'),
        '400': ErrorResponseSchema(description='Bad Request'),
        '401': ErrorResponseSchema(description='Unauthorized'),
        '403': ErrorResponseSchema(description='Forbidden'),
        })
    def collection_post(self):
        "Create a new Person"
        person = Person.from_dict(self.request.validated)
        try:
            self.context.put(person)
        except StorageError as err:
            self.request.errors.status = 400
            self.request.errors.add('body', err.location, str(err))
            return

        self.request.response.status = 201
        return PersonSchema().to_json(person.to_dict())


    @view(permission='view',
          schema=PersonListingRequestSchema(),
          validators=(colander_validator),
          cors_origins=('*', ),
          response_schemas={
        '200': PersonListingResponseSchema(description='Ok'),
        '400': ErrorResponseSchema(description='Bad Request'),
        '401': ErrorResponseSchema(description='Unauthorized')})
    def collection_get(self):
        offset = self.request.validated['querystring']['offset']
        limit = self.request.validated['querystring']['limit']
        order_by = [Person.family_name.asc(), Person.name.asc()]
        listing = self.context.search(
            offset=offset,
            limit=limit,
            order_by=order_by,
            principals=self.request.effective_principals)
        schema = PersonSchema()
        return {'total': listing['total'],
                'records': [schema.to_json(person.to_dict())
                            for person in listing['hits']],
                'limit': limit,
                'offset': offset}

person_bulk = Service(name='PersonBulk',
                     path='/api/v1/person/bulk',
                     factory=ResourceFactory(PersonResource),
                     api_security=[{'jwt':[]}],
                     tags=['person'],
                     cors_origins=('*', ),
                     schema=PersonBulkRequestSchema(),
                     validators=(colander_bound_repository_body_validator,),
                     response_schemas={
    '200': OKStatusResponseSchema(description='Ok'),
    '400': ErrorResponseSchema(description='Bad Request'),
    '401': ErrorResponseSchema(description='Unauthorized')})

@person_bulk.post(permission='import')
def person_bulk_import_view(request):
    # get existing resources from submitted bulk
    keys = [r['id'] for r in request.validated['records'] if r.get('id')]
    existing_records = {r.id:r for r in request.context.get_many(keys) if r}
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