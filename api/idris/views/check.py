import subprocess

from pyramid.view import view_config


@view_config(route_name='liveness_check')
def liveness_check_view(request):
    request.response.content_type = 'text/plain'
    request.response.write('ok')
    return request.response


@view_config(route_name='readiness_check')
def readiness_check_view(request):
    request.response.content_type = 'text/plain'
    request.response.write('ok')
    return request.response
