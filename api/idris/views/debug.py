import logging

from pyramid.view import view_config
from pyramid.httpexceptions import HTTPNotFound

from idris.interfaces import IAppRoot

@view_config(context=IAppRoot, name='debug_cache')
def echo_view(request):
    raise ValueError('gug')
    import gzip
    gzip_body = gzip.compress(b'Hello! ' * 10000)
    response = request.response
    logging.info(dict(request.headers))
    filename = request.path.split('/')[-1]
    files = {'1.pdf': {'headers': {'Content-Length': str(len('Hello! ' * 10000)),
                                   'ETag': 'W/"hello"',
                                   'Content-Type': 'text/plain',
                                   'Cache-Control': 'public, must-revalidate'},
                       'status': 200,
                       'body': ('Hello! ' * 10000).encode('utf8') },
             '2.pdf': {'headers': {'Content-Length': str(len(gzip_body)),
                                   'ETag': '"33a64df551425fcc55e4d42a148795d9f25f89d4"',
                                   'Content-Encoding': 'gzip',
                                   'Content-Type': 'text/plain',
                                   'Cache-Control': 'public, must-revalidate'},
                       'status': 200,
                       'body': gzip_body},
             'foo.pdf': {'headers': {'Content-Length': str(len('Hello! ' * 10000)),
                                     'Content-Type': 'text/plain',
                                     'Cache-Control': request.GET.get('cache', '')},
                         'status': 200,
                         'body': ('Hello! ' * 10000).encode('utf8')}}
    file = files.get(filename)
    if file is None:
        raise HTTPNotFound()

    response.status_code = file['status']
    for key, value in file['headers'].items():
        response.headers[key] = value
    response.write(file['body'])


    for header in request.headers:
        if header == 'Echo-Body':
            response.write(request.headers[header])
        elif header == 'Echo-Status':
            response.status_code = int(request.headers[header])
        elif header.startswith('Echo-'):
            response.headers[header[5:]] = request.headers[header]
    return response

@view_config(context=IAppRoot, name='debug_db')
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
