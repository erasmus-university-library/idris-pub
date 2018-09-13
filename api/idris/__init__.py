from pyramid.authorization import ACLAuthorizationPolicy
from pyramid.config import Configurator
from pyramid.httpexceptions import HTTPFound

from idris.security import add_role_principals


def main(global_config, **settings):
    config = Configurator(settings=settings)
    config.include('cornice')
    config.include('cornice_swagger')
    config.include('pyramid_chameleon')
    config.include('pyramid_jwt')
    config.include('idris.storage')
    config.include('idris.blob')

    config.set_authorization_policy(ACLAuthorizationPolicy())
    config.set_jwt_authentication_policy(settings['idris.secret'],
                                         http_header='Authorization',
                                         auth_type='Bearer',
                                         expiration=3600,
                                         callback=add_role_principals)

    config.scan("idris.views")

    config.add_route('debug', '/debug')

    config.add_route('api_without_slash', '/api')
    config.add_view(lambda _, __: HTTPFound('/api/'),
                    route_name='api_without_slash')
    config.add_static_view('api', path='idris:static/dist/swagger')

    config.add_route('edit_without_slash', '/edit')
    config.add_view(lambda _, __: HTTPFound('/edit/'),
                    route_name='edit_without_slash')
    config.add_static_view('edit', path='idris:static/dist/web')

    config.add_route('course_without_slash', '/course')
    config.add_view(lambda _, __: HTTPFound('/course/'),
                    route_name='course_without_slash')
    config.add_static_view('course', path='idris:static/dist/web')

    config.add_static_view('', path='idris:static/dist/web')
    return config.make_wsgi_app()
