import json

from cornice import Service
from cornice.resource import resource, view
from cornice.validators import colander_validator
import colander

from idris.resources import ResourceFactory, CourseResource
from idris.utils import (ErrorResponseSchema,
                         StatusResponseSchema,
                         OKStatusResponseSchema,
                         OKStatus,
                         JsonMappingSchemaSerializerMixin,
                         colander_bound_repository_body_validator)


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
        permission='view',
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
