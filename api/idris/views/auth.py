import json
from urllib.parse import parse_qsl

import jwt
from pylti.common import verify_request_common
import colander
from pyramid.view import forbidden_view_config, notfound_view_config
from pyramid.httpexceptions import HTTPForbidden, HTTPFound
from pyramid.interfaces import IAuthenticationPolicy

from cornice import Service
from cornice.validators import colander_body_validator

from idris.security import authenticator_factory
from idris.utils import ErrorResponseSchema, OKStatus
from idris.models import Identifier, Group

class AuthLoginSchema(colander.MappingSchema):
    user = colander.SchemaNode(colander.String())
    password = colander.SchemaNode(colander.String())

class AuthRenewSchema(colander.MappingSchema):
    token = colander.SchemaNode(colander.String())

class AuthLoggedInSchema(colander.MappingSchema):
    status = OKStatus
    token = colander.SchemaNode(colander.String())

class AuthLoggedInBodySchema(colander.MappingSchema):
    body = AuthLoggedInSchema()

login = Service(name='login',
                path='/api/v1/auth/login',
                validators=(colander_body_validator,),
                factory=authenticator_factory,
                cors_origins=('*', ),
                response_schemas={
        '20O': AuthLoggedInBodySchema(description='Ok'),
        '400': ErrorResponseSchema(description='Bad Request'),
        '401': ErrorResponseSchema(description='Unauthorized')})
@login.post(tags=['auth'], schema=AuthLoginSchema())
def login_view(request):
    user_id = request.validated['user']
    credentials = request.validated['password']
    if not request.context.valid_user(user_id, credentials):
        raise HTTPForbidden('Unauthorized')
    principals = request.context.principals(user_id)
    result = {'status': 'ok',
              'token': request.create_jwt_token(user_id, principals=principals)}

    return result



renew = Service(name='renew',
                path='/api/v1/auth/renew',
                validators=(colander_body_validator,),
                factory=authenticator_factory,
                cors_origins=('*', ),
                response_schemas={
    '20O': AuthLoggedInBodySchema(description='Ok'),
    '400': ErrorResponseSchema(description='Bad Request'),
    '401': ErrorResponseSchema(description='Unauthorized')})
@renew.post(tags=['auth'], schema=AuthRenewSchema())
def renew_view(request):
    token = request.validated['token']
    policy = request.registry.queryUtility(IAuthenticationPolicy)
    try:
        claims = jwt.decode(token, policy.private_key)
    except jwt.InvalidTokenError as e:
        raise HTTPForbidden('Invalid JWT token: %s' % e)

    user_id = claims['sub']
    if not request.context.existing_user(user_id):
        raise HTTPForbidden('Invalid JWT token: unknown user')

    principals = request.context.principals(user_id)
    result = {'status': 'ok',
              'token': request.create_jwt_token(user_id, principals=principals)}
    return result

@forbidden_view_config()
def forbidden_view(request):
    response = request.response
    description = None
    if request.errors and request.errors.status == 404:
        response.status = 404
        response.content_type = 'application/json'
        response.write(
            json.dumps({'status': 'error',
                        'errors': request.errors}).encode('utf8'))
        return response

    if request.exception and request.exception.detail:
        description = request.exception.detail
    if request.authenticated_userid or request.headers.get('Authorization'):
        response.status = 403
        response.content_type = 'application/json'
        response.write(
            json.dumps({'status': 'error',
                        'errors': [{'name': 'forbidden',
                                    'description': description or 'Forbidden',
                                    'location': 'request'}]}).encode('utf8'))
    else:
        response.status = 401
        response.content_type = 'application/json'
        response.headers['Location'] = request.route_url('login')
        response.write(
            json.dumps({'status': 'error',
                        'errors': [{'name': 'unauthorized',
                                    'description': description or 'Unauthorized',
                                    'location': 'request'}]}).encode('utf8'))
    return response

@notfound_view_config()
def notfound_view(request):
    description = None
    if request.exception and request.exception.detail:
        description = request.exception.detail
    response = request.response
    response.status = 404
    response.content_type = 'application/json'
    response.write(
        json.dumps({'status': 'error',
                    'errors': [{'name': 'not found',
                                'description': description or 'Not Found',
                                'location': 'request'}]}).encode('utf8'))
    return response


lti_login = Service(name='LTILogin',
                    path='/api/v1/auth/lti',
                    cors_origins=('*', ),
                    factory=authenticator_factory,
                    response_schemas={
        '20O': AuthLoggedInBodySchema(description='Ok'),
        '400': ErrorResponseSchema(description='Bad Request'),
        '401': ErrorResponseSchema(description='Unauthorized')})


@lti_login.get(tags=['auth'])
def lti_login_view_get(request):
    return lti_login_view(request)


@lti_login.post(tags=['auth'])
def lti_login_view(request):
    settings = request.repository.settings
    if settings['course_lti_enabled'] is not True:
        raise HTTPForbidden('Not Enabled')
    params = dict(request.GET)
    params.update(dict(parse_qsl(request.body.decode('utf8'))))


    import logging
    logging.info('url: %s' % request.url)
    logging.info('scheme: %s' % request.scheme)

    url = request.url.replace('http://', 'https://')


    consumer_key = params['oauth_consumer_key']
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
        raise HTTPForbidden('Unauthorized')
    user_id = params['user_id']
    principals = []

    group = request.dbsession.query(Group).filter(
        Group.id==consumer_key.split('-')[-1]).first()

    if group:
        principals.append('member:group:%s' % group.id)

    course = request.dbsession.query(Identifier).filter(
        Identifier.type=='lti',
        Identifier.value==params['resource_link_id']).first()
    if course:
        course = course.work_id

    if (params['roles'] == 'Instructor' or params['roles'] == 'Administrator'):
        principals.append('group:course:staff')
        # XXX for testing
        principals.append('group:admin')
        if course:
            principals.append('owner:course:%s' % course)
    elif (params['roles'] == 'Student' or params['roles'] == 'Learner'):
        principals.append('group:course:student')
        if course:
            principals.append('viewer:course:%s' % course)
    token = request.create_jwt_token(user_id, principals=principals)
    redirect_url = '%s?token=%s&embed=true' % (settings['course_lti_redirect_url'], token)
    redirect_url = redirect_url.replace('http://', 'https://')
    if group:
        redirect_url = '%s#/group/%s' % (redirect_url, group.id)
    if course:
        redirect_url = '%s/course/%s' % (redirect_url, course)
    request.response.content_type = 'application/json'
    request.response.write(
        json.dumps({'status': 'ok', 'token': token}).encode('utf8'))
    request.response.status_code = 303
    request.response.headers['Location'] = redirect_url
    return request.response
