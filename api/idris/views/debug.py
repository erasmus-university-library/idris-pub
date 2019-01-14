from pyramid.view import view_config
"""
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
    pool = request.registry['engine'].pool
    info = ("Pool size: %d  Connections in pool: %d "\
            "Current Overflow: %d Current Checked out "\
            "connections: %d" % (pool.size(),
                                 pool.checkedin(),
                                 pool.overflow(),
                                 pool.checkedout()))

    request.response.content_type = 'text/plain'
    request.response.write(info)
    return request.response
