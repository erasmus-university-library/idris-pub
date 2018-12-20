import os
from pyramid.authorization import ACLAuthorizationPolicy
from pyramid.config import Configurator
from pyramid.httpexceptions import HTTPFound

from idris.security import add_role_principals
from idris.interfaces import IAppRoot

def root_factory(request):
    if request.repository is None:
        app_name = 'base'
    else:
        app_name = request.repository.app_name
    AppRoot = request.registry.queryUtility(IAppRoot, app_name)
    return AppRoot(request)

def token_tween_factory(handler, registry):
    def token_tween(request):
        # if there is no authorization header, but there is a token cookie
        # use that instead
        if (request.headers.get('authorization') is None and
            request.cookies.get('token') is not None):
                request.headers['authorization'] = (
                    'Bearer %s' % request.cookies['token'])
        return handler(request)
    return token_tween

def configure(global_config, **settings):

    gcp_project = settings.get('idris.google_cloud_project')
    gcp_auth = settings.get('idris.google_application_credentials')
    if gcp_project and gcp_auth:
        os.environ['GOOGLE_CLOUD_PROJECT'] = gcp_project
        os.environ[
            'GOOGLE_APPLICATION_CREDENTIALS'] = os.path.abspath(gcp_auth)

    config = Configurator(settings=settings, root_factory=root_factory)
    config.add_tween('idris.token_tween_factory')
    config.include('cornice')
    config.include('cornice_swagger')
    config.include('pyramid_chameleon')
    config.include('pyramid_jwt')
    config.include('idris.storage')
    config.include('idris.blob')
    config.include('idris.services.lookup')
    config.include('idris.services.cache')
    config.include('idris.apps.base')
    config.include('idris.apps.course')

    config.set_authorization_policy(ACLAuthorizationPolicy())
    config.set_jwt_authentication_policy(settings['idris.secret'],
                                         http_header='Authorization',
                                         auth_type='Bearer',
                                         expiration=3600,
                                         callback=add_role_principals)

    config.scan("idris.views")

    config.add_route('debug', '/debug')
    config.add_route('liveness_check', '/_live')
    config.add_route('readiness_check', '/_ready')

    config.add_route('api_without_slash', '/api')
    config.add_view(
        lambda _, __: HTTPFound('/api/'), route_name='api_without_slash')
    config.add_static_view('api', path='idris:static/dist/swagger')

    config.add_static_view('static', path='idris:static/dist/web')


    config.add_route('edit_without_slash', '/edit')
    config.add_view(
        lambda _, __: HTTPFound('/edit/'), route_name='edit_without_slash')
    config.add_static_view('edit', path='idris:static/dist/web')

    return config

def main(global_config, **settings):
    config = configure(global_config, **settings)
    return config.make_wsgi_app()
