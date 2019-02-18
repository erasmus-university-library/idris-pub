import os
import base64
import json
from urllib.parse import parse_qsl, quote

from cornice import Service
from cornice.resource import resource, view
from cornice.validators import colander_validator
import colander
from pyramid.view import view_config
from pyramid.httpexceptions import HTTPFound, HTTPNotFound, HTTPForbidden
from pylti.common import verify_request_common
from lxml import etree

from idris.apps.course.services import course_royalty_calculator_factory
from idris.resources import ResourceFactory, BlobResource
from idris.exceptions import StorageError
from idris.models import Work, Identifier, Group
from idris.services.lookup import lookup_factory, LookupError
from idris.utils import (ErrorResponseSchema,
                         JsonMappingSchemaSerializerMixin,
                         load_web_index_template,
                         colander_bound_repository_body_validator)


from idris.apps.course.resources import (
    CourseAppRoot, CourseResource)

@view_config(context=CourseAppRoot)
def home_view(request):
    config = {'app': 'course',
              'title': request.GET.get('title'),
              'course_id': request.GET.get('course_id'),
              'lti_id': request.GET.get('lti')}
    html = load_web_index_template('index.html', config)
    request.response.content_type = 'text/html'
    request.response.write(html.encode('utf8'))
    return request.response

@view_config(context=CourseAppRoot, name='edit')
def edit_view(request):
    config = {'app': 'edit'}
    html = load_web_index_template('index.html', config)
    request.response.content_type = 'text/html'
    request.response.write(html.encode('utf8'))
    return request.response

@view_config(context=CourseResource)
def course_view(request):
    course = request.context.model
    group_id = course.contributors[0].id
    edit_url = '/#/group/%s/course/%s' % (
        group_id, course.id)
    raise HTTPFound(edit_url)

@view_config(context=CourseResource,
             name='material',
             permission='course_material_view')
def course_material_view(request):
    course = request.context.model
    material_id = int(request.subpath[0])
    for material_toc in course.relations:
        if material_toc.target_id == material_id:
            break
    else:
        raise HTTPNotFound(
            'Course %s has no material %s' % (
                course.id, material_id))
    material = request.context.get(material_id)
    if len(material.expressions) == 0:
        raise HTTPNotFound(
            'CourseMaterial %s has no expressions' % (
                material_id,))

    expression = material.expressions[0]
    if expression.blob_id is None and expression.url:
        raise HTTPFound(expression.url)
    elif expression.blob_id:
        blob = ResourceFactory(BlobResource)(request, expression.blob_id)
        return request.repository.blob.serve_blob(
            request,
            request.response,
            blob)
    else:
        raise HTTPNotFound(
            'CourseMaterial %s first expression has no content' % (
                material_id,))

@view_config(context=CourseAppRoot, name='lti.xml')
def lti_config_view(request):
    request.response.content_type = 'application/xml'
    doc = etree.parse(
        os.path.join(os.path.dirname(__file__),
                     'lti_config.xml'))
    lti_url = request.url
    if request.headers.get('X-Forwarded-Proto') == 'https':
        lti_url = lti_url.replace('http://', 'https://')

    for el in doc.xpath('//*[@name="url"]'):
        el.text = lti_url.replace('/lti.xml', '/lti')
    for el in doc.xpath('//*[@name="domain"]'):
        el.text = request.host
    for el in doc.xpath('//*[@name="icon_url"]'):
        el.text = lti_url.replace('/lti.xml', '/lti.png')
    request.response.write(etree.tostring(doc))
    return request.response

@view_config(context=CourseAppRoot, name='lti.png')
def lti_icon_view(request):
    data = base64.b64decode(
        'iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARn'
        'QU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADZSURBVEhL5dQxCsJAEIXh'
        'BcELeAobSwsVD+FtxFYiehcPYWlp4w208gKCoO+HHZAw0wzb5cEHy+btJCSQMpiM5STP'
        'ijV7zcLAb89BmoWnZuhClnXNXrPYDVYV64c0y1EY+q/pK+KDchOeGgxPfeS3vOQuZ9nJ'
        'TKJwjQ5dznCWGWH6r8FcZS0W1ux5XYTxyuYj24q11zFhvHJGGK+cEcYrZ4TxyhlhvHJG'
        'GK+cEcYrZ4Txyhlh+L9MZCob2ctNvCHgGh26nOFs6h81l4vYYNbsNc1Iuor1IFLKD8j5'
        '3abZMoa6AAAAAElFTkSuQmCC')
    request.response.content_type = 'image/png'
    request.response.write(data)
    return request.response

@view_config(context=CourseAppRoot, name='lti')
def lti_login_view(request):
    settings = request.repository.settings
    params = dict(request.GET)
    params.update(dict(parse_qsl(request.body.decode('utf8'),
                                 keep_blank_values=True)))
    import logging
    logging.info('url: %s' % request.url)
    logging.info('scheme: %s' % request.scheme)
    logging.info('%s' % dict(request.headers))
    logging.info(request.environ)
    logging.info(params)
    logging.info('LTI post for course: %s' % params['context_id'])

    url = request.url
    if request.headers.get('X-Forwarded-Proto') == 'https':
        url = url.replace('http://', 'https://')

    consumer_key = params.get('oauth_consumer_key', '')
    consumers = {consumer_key: {
        'secret': settings['course_lti_secret']}}
    try:
        is_valid = verify_request_common(consumers,
                                         url,
                                         request.method,
                                         dict(request.headers),
                                         params)
    except Exception:
        is_valid = False
    if not is_valid:
        logging.info(params)
        logging.info(request.headers)
        logging.info(url)
        raise HTTPForbidden('Unauthorized')
    user_id = params['user_id']
    principals = ['user:%s' % user_id]
    group_id = consumer_key.split('-')[-1]
    try:
        group = request.dbsession.query(Group).filter(
            Group.id==group_id).first()
    except:
        group = None
    if not group:
        request.errors.add(
            'body',
            'oauth_consumer_key',
            'Bad consumer_key, no such group: "%s"' % group_id)
        raise HTTPNotFound(
            'Bad consumer_key, no such group: "%s"' % group_id)
    if group:
        principals.append('member:group:%s' % group.id)

    course = request.dbsession.query(Identifier).filter(
        Identifier.type=='lti',
        Identifier.value==params['context_id']).first()
    if course:
        course = course.work_id

    params['roles'] = params['roles'].replace('urn:lti:instrole:ims/lis/', '')
    if (params['roles'] == 'Instructor' or params['roles'] == 'Administrator'):
        principals.append('group:teacher')
        # XXX for testing
        # principals.append('group:admin')
        if course:
            principals.append('teacher:course:%s' % course)
    elif (params['roles'] == 'Student' or params['roles'] == 'Learner'):
        principals.append('group:student')
        if course:
            principals.append('student:course:%s' % course)
        else:
            # student logged in without a linked course, just return
            # a blank page with a 404
            request.response.status = 404
            request.response.content_type = 'text/html'
            request.response.write('<html></html>')
            return request.response
    token_params = {}
    if params['lti_message_type'] == 'ContentItemSelectionRequest':
        token_params['return_url'] = params['content_item_return_url']
        token_params['lti_url'] = 'https://%s/lti?course_filter=' % request.host

    token = request.create_jwt_token(user_id,
                                     principals=principals,
                                     **token_params)
    redirect_url = 'http://%s/' % (request.host,)
    url_params = '?token=%s&embed=true' % (token,)
    if request.headers.get('X-Forwarded-Proto') == 'https':
        redirect_url = redirect_url.replace('http://', 'https://')
    url_fragment = '#/group/%s' % (group.id,)
    if course:
        url_fragment = '%s/course/%s' % (url_fragment, course)
        if params['lti_message_type'] == 'ContentItemSelectionRequest':
            url_fragment = '%s/filters' % url_fragment
        elif request.GET.get('course_filter'):
            url_fragment = '%s/filter/%s' % (url_fragment,
                                         request.GET['course_filter'])
    else:
        url_fragment = '%s/add' % (url_fragment,)
        url_params = '%s&title=%s&course_id=%s&lti=%s' % (
            url_params,
            quote(params.get('context_title', '')),
            quote(params.get('context_label', '')),
            quote(params['context_id']))
    redirect_url = '%s%s%s' % (redirect_url, url_params, url_fragment)

    request.response.content_type = 'application/json'
    request.response.write(
        json.dumps({'status': 'ok', 'token': token}).encode('utf8'))
    request.response.status_code = 303
    request.response.headers['Location'] = redirect_url
    request.response.set_cookie('token', value=token)
    return request.response


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
                module_id = colander.SchemaNode(colander.String(),
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
        if qs['show_royalties']:
            cache_key = 'course-full:%s@%s' % (
                self.context.model.id, self.context.model.revision)
        else:
            cache_key = 'course-simple:%s@%s' % (
                self.context.model.id, self.context.model.revision)

        result = self.request.repository.cache.get(cache_key)
        if not result:
            toc_items =  self.context.toc_items_csl()
            if qs['show_royalties']:
                course_year = str(self.context.model.issued.year)
                royalties = course_royalty_calculator_factory(
                    self.request.registry,
                    course_year)()
                royalty_materials = self.context.toc_items_royalty()
                for royalty_calculation in royalties.calculate(
                        royalty_materials):
                    toc_items.get(
                        royalty_calculation['id'],
                        {})['royalties'] = royalty_calculation
            result = json.dumps(CourseSchema().to_json(
                {'course': self.context.to_course_data(),
                 'toc_items': toc_items})).encode('utf8')
        # cache result for one hour
        self.request.repository.cache.set(cache_key, result, 60*60)
        self.response.content_type =  'application/json'
        self.response.write(result)
        return self.response

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
