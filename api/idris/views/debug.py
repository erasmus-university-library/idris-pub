from pyramid.view import view_config

@view_config(route_name='debug')
def echo_view(request):
    response = request.response
    for header in request.headers:
        if header == 'Echo-Body':
            response.write(request.headers[header])
        elif header == 'Echo-Status':
            response.status_code = int(request.headers[header])
        elif header.startswith('Echo-'):
            response.headers[header[5:]] = request.headers[header]
    return response

"""
@view_config(route_name='debug')
def debug_view(request):
    request.response.content_type = 'text/plain'
    for header in request.headers:
        request.response.write(
            ('%s: %s\n' % (header, request.headers[header])).encode('utf8'))
    request.response.write('\n')
    request.response.write(request.body)
    return request.response
"""
