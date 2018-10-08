import json

from cornice import Service
from cornice.resource import resource, view
from cornice.validators import colander_validator
import colander

from idris.resources import ResourceFactory, CourseResource
from idris.exceptions import StorageError
from idris.utils import (ErrorResponseSchema,
                         StatusResponseSchema,
                         OKStatusResponseSchema,
                         OKStatus,
                         JsonMappingSchemaSerializerMixin,
                         colander_bound_repository_body_validator)


class CourseSchema(colander.MappingSchema,
                   JsonMappingSchemaSerializerMixin):
    @colander.instantiate()
    class course(colander.MappingSchema):
        id = colander.SchemaNode(colander.Int())
        title = colander.SchemaNode(colander.String())
        start_date = colander.SchemaNode(colander.Date(), missing=None)
        end_date = colander.SchemaNode(colander.Date(), missing=None)

        @colander.instantiate(missing=colander.drop)
        class toc(colander.SequenceSchema):
            @colander.instantiate()
            class toc_item(colander.MappingSchema):
                id = colander.SchemaNode(colander.Int(), missing=colander.drop)
                target_id = colander.SchemaNode(colander.Int(),
                                                missing=colander.drop)
                module = colander.SchemaNode(colander.String(),
                                             missing=colander.drop)
                comment = colander.SchemaNode(colander.String(),
                                              missing=colander.drop)

    @colander.instantiate()
    class toc_items(colander.MappingSchema):
        def __init__(self, unknown='preserve'):
            super(self.__class__, self).__init__(
                unknown=unknown, missing=colander.drop)


class CourseListingRequestSchema(colander.MappingSchema,
                                 JsonMappingSchemaSerializerMixin):
    @colander.instantiate()
    class querystring(colander.MappingSchema):
        group_id = colander.SchemaNode(colander.Int())
        course_year = colander.SchemaNode(colander.String(),
                                          description='format: "YYYY-YYYY"')


@resource(name='Course',
          collection_path='/api/v1/course/records',
          path='/api/v1/course/records/{id}',
          tags=['course'],
          cors_origins=('*', ),
          api_security=[{'jwt': []}],
          factory=ResourceFactory(CourseResource))
class CourseRecordAPI(object):
    def __init__(self, request, context):
        self.request = request
        self.response = request.response
        self.context = context

    @view(
        permission='course_list',
        schema=CourseListingRequestSchema(),
        validators=(colander_validator),
        cors_origins=('*', ))
    def collection_get(self):
        "Retrieve a list of courses"
        qs = self.request.validated['querystring']
        listing = self.context.courses(qs['group_id'],
                                       course_year=qs['course_year'])
        self.response.content_type = 'application/json'
        self.response.write(json.dumps(listing).encode('utf8'))
        return self.response

    @view(
        permission='course_view',
        validators=(colander_validator),
        cors_origins=('*', ),
        response_schemas={
            '200': CourseSchema(),
            '400': ErrorResponseSchema(description='Bad Request'),
            '401': ErrorResponseSchema(description='Unauthorized')})
    def get(self):
        "Retrieve a course"
        return CourseSchema().to_json(
            {'course': self.context.to_course_data(),
             'toc_items': self.context.toc_items(self.context.model.id)})

    @view(
        permission='course_update',
        schema=CourseSchema(),
        validators=(colander_bound_repository_body_validator,),
        cors_origins=('*', ),
        response_schemas={
            '200': CourseSchema(),
            '400': ErrorResponseSchema(description='Bad Request'),
            '401': ErrorResponseSchema(description='Unauthorized')})
    def put(self):
        "Update a course"
        body = self.request.validated
        body['id'] = int(self.request.matchdict['id'])
        self.context.from_course_data(body['course'])
        try:
            self.context.put()
        except StorageError as err:
            self.request.errors.status = 400
            self.request.errors.add('body', err.location, str(err))
            return

        return CourseSchema().to_json(
            {'course': self.context.to_course_data(),
             'toc_items': self.context.toc_items(self.context.model.id)})


course_nav = Service(name='CourseNavigation',
                     path='/api/v1/course/nav',
                     factory=ResourceFactory(CourseResource),
                     api_security=[{'jwt': []}],
                     tags=['course'],
                     cors_origins=('*', ))


@course_nav.get(permission='view')
def course_nav_view(request):
    response = request.response
    response.content_type = 'application/json'
    response.write(
        json.dumps(request.context.navigation()).encode('utf8'))
    return response
