import json

from cornice import Service
from cornice.resource import resource, view
from cornice.validators import colander_validator
import colander
from pyramid.view import view_config
from pyramid.httpexceptions import HTTPFound

from idris.apps.course.services import course_royalty_calculator_factory
from idris.resources import ResourceFactory
from idris.apps.course.resources import CourseResource
from idris.exceptions import StorageError
from idris.models import Work
from idris.services.lookup import lookup_factory, LookupError
from idris.utils import (ErrorResponseSchema,
                         JsonMappingSchemaSerializerMixin,
                         colander_bound_repository_body_validator)
from idris.apps.course.resources import CourseAppRoot

@view_config(context=CourseAppRoot)
def home_view(request):
    raise HTTPFound('/course/')


class CourseSchema(colander.MappingSchema,
                   JsonMappingSchemaSerializerMixin):
    @colander.instantiate()
    class course(colander.MappingSchema):
        id = colander.SchemaNode(colander.Int(), missing=None)
        title = colander.SchemaNode(colander.String())
        start_date = colander.SchemaNode(colander.Date(), missing=None)
        end_date = colander.SchemaNode(colander.Date(), missing=None)
        group = colander.SchemaNode(colander.Int(), missing=None)

        course_id = colander.SchemaNode(
            colander.String(), missing=colander.drop)
        canvas_id = colander.SchemaNode(
            colander.String(), missing=colander.drop)
        lti_id = colander.SchemaNode(
            colander.String(), missing=colander.drop)

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

    @colander.instantiate()
    class royalties(colander.MappingSchema):
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
class CourseDOILookupSchema(colander.MappingSchema,
                            JsonMappingSchemaSerializerMixin):
    @colander.instantiate()
    class querystring(colander.MappingSchema):
        doi = colander.SchemaNode(colander.String(),
                                  description='format: "10.XXX/XXX"')

class CourseMaterialListingRequestSchema(
        colander.MappingSchema,
        JsonMappingSchemaSerializerMixin):
    @colander.instantiate()
    class querystring(colander.MappingSchema):
        show_royalties = colander.SchemaNode(colander.Boolean(),
                                             missing=False)


class CourseMaterialSchema(colander.MappingSchema,
                           JsonMappingSchemaSerializerMixin):

    dry_run = colander.SchemaNode(colander.Boolean(), missing=False)
    @colander.instantiate()
    class material(colander.MappingSchema):
        title =  colander.SchemaNode(colander.String())
        type =  colander.SchemaNode(colander.String())
        authors = colander.SchemaNode(colander.String())
        year = colander.SchemaNode(colander.Int())
        starting = colander.SchemaNode(colander.Int(), missing=colander.drop)
        ending = colander.SchemaNode(colander.Int(), missing=colander.drop)
        pages = colander.SchemaNode(colander.Int(), missing=colander.drop)
        book_title = colander.SchemaNode(colander.String(), missing=colander.drop)
        book_pages = colander.SchemaNode(colander.Int(), missing=colander.drop)
        journal = colander.SchemaNode(colander.String(), missing=colander.drop)
        volume = colander.SchemaNode(colander.String(), missing=colander.drop)
        issue = colander.SchemaNode(colander.String(), missing=colander.drop)
        doi = colander.SchemaNode(colander.String(), missing=colander.drop)
        link = colander.SchemaNode(colander.String(), missing=colander.drop)
        words = colander.SchemaNode(colander.Int(), missing=colander.drop)
        pages = colander.SchemaNode(colander.Int(), missing=colander.drop)
        blob_id = colander.SchemaNode(colander.Int(), missing=colander.drop)
        exception = colander.SchemaNode(colander.String(), missing=colander.drop)



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
        schema=CourseMaterialListingRequestSchema(),
        validators=(colander_validator),
        cors_origins=('*', ),
        response_schemas={
            '200': CourseSchema(description='Ok'),
            '400': ErrorResponseSchema(description='Bad Request'),
            '401': ErrorResponseSchema(description='Unauthorized')})
    def get(self):
        "Retrieve a course"
        qs = self.request.validated['querystring']
        toc_items =  self.context.toc_items_csl()
        if qs['show_royalties']:
            course_year = str(self.context.model.issued.year)
            royalties = course_royalty_calculator_factory(
                self.request.registry,
                course_year)()
            royalty_materials = self.context.toc_items_royalty()
            for royalty_calculation in royalties.calculate(royalty_materials):
                toc_items.get(
                    royalty_calculation['id'],
                    {})['royalties'] = royalty_calculation

        return CourseSchema().to_json(
            {'course': self.context.to_course_data(),
             'toc_items': toc_items})

    @view(
        permission='course_update',
        schema=CourseSchema(),
        validators=(colander_bound_repository_body_validator,),
        cors_origins=('*', ),
        response_schemas={
            '200': CourseSchema(description='Ok'),
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
             'toc_items': self.context.toc_items_csl()})

    @view(
        permission='course_add',
        schema=CourseSchema(),
        validators=(colander_bound_repository_body_validator,),
        cors_origins=('*', ),
        response_schemas={
            '400': ErrorResponseSchema(description='Bad Request'),
            '201': CourseSchema(description='Ok'),
            '401': ErrorResponseSchema(description='Unauthorized')})
    def collection_post(self):
        "Add a course"
        body = self.request.validated
        body['course']['type'] = 'course'
        self.context.model = Work()
        body['course'].pop('id', None)
        self.context.from_course_data(body['course'])
        try:
            self.context.put()
        except StorageError as err:
            self.request.errors.status = 400
            self.request.errors.add('body', err.location, str(err))
            return

        self.request.response.status = 201
        return CourseSchema().to_json(
            {'course': self.context.to_course_data(),
             'toc_items': self.context.toc_items_csl()})


course_material_add = Service(name='CourseMaterialAdd',
                              path='/api/v1/course/records/{id}/materials',
                              factory=ResourceFactory(CourseResource),
                              schema=CourseMaterialSchema(),
                              api_security=[{'jwt': []}],
                              tags=['course'],
                              cors_origins=('*', ))

@course_material_add.post(permission='course_material_add',
                          validators=colander_bound_repository_body_validator)
def course_material_add_view(request):
    context = request.context
    dry_run = request.validated['dry_run']
    material = request.validated['material']
    material = dict([(k, v) for (k, v) in material.items() if v])
    work = context.from_course_material_data(material)
    if not dry_run:
        try:
            context.put(work)
        except StorageError as err:
            request.errors.status = 400
            request.errors.add('body', err.location, str(err))
            return
        material['id'] = work.id
        course_data = context.to_course_data()
        course_data['toc'].append({'target_id': work.id})
        context.from_course_data(course_data)
        try:
            context.put()
        except StorageError as err:
            request.errors.status = 400
            request.errors.add('body', err.location, str(err))
            return
        # force reload the course from db to retrieve the new toc
        context.session.refresh(context.model)
        request.response.status_code = 201

    course_year = str(context.model.issued.year)
    royalties = course_royalty_calculator_factory(request.registry,
                                                  course_year)()
    royalty_materials = context.toc_items_royalty()
    if dry_run:
        material['id'] = -1
        work.id = -1
        royalty_materials.append(material)
    calculated_royalties = {}
    for royalty_calculation in royalties.calculate(royalty_materials):
        if royalty_calculation['id'] == work.id:
            calculated_royalties = royalty_calculation
    return {'material': material,
            'csl': context.material_data_to_csl(material),
            'royalties': calculated_royalties}


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

doi_lookup = Service(name='CourseDOILookup',
                     path='/api/v1/course/lookup/doi',
                     factory=ResourceFactory(CourseResource),
                     api_security=[{'jwt': []}],
                     tags=['course'],
                     cors_origins=('*', ))


@doi_lookup.get(permission='view',
                schema=CourseDOILookupSchema(),
                validators=(colander_validator))
def doi_lookup_view(request):
    response = request.response
    response.content_type = 'application/json'
    doi = request.validated['querystring']['doi']
    lookup = lookup_factory(request.registry, 'crossref')
    try:
        data = lookup.query(doi)
    except LookupError:
        data = None
    result = {'course': {}}
    if data:
        result['course']['title'] = data['title']
        result['course']['type'] = data['type']
        result['course']['year'] = str(data['issued'].year)
        authors = []
        for contributor in data.get('contributors', []):
            if contributor['role'] == 'author':
                authors.append(contributor['description'])
        result['course']['authors'] = ', '.join(authors)
        for rel in data.get('relations', []):
            if rel['type'] == 'journal':
                result['course']['journal'] = rel['description']
            elif rel['type'] == 'book':
                result['course']['book_title'] = rel['description']
            else:
                continue
            result['course']['volume'] = rel['volume']
            result['course']['issue'] = rel['issue']
            result['course']['starting'] = rel['starting']
            result['course']['ending'] = rel['ending']

    response.write(
        json.dumps(result).encode('utf8'))
    return response
