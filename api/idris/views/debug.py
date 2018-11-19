import subprocess

from pyramid.view import view_config


@view_config(route_name='debug')
def debug_view(request):
    request.response.content_type = 'text/plain'
    for header in request.headers:
        request.response.write(
            ('%s: %s\n' % (header, request.headers[header])).encode('utf8'))
    request.response.write('\n')
    request.response.write(request.body)
    return request.response
