import subprocess

from pyramid.view import view_config


@view_config(route_name='debug')
def debug_view(request):
    p = subprocess.Popen(['which', 'pdftotext'],
                         stdout=subprocess.PIPE,
                         stderr=subprocess.PIPE)
    output = p.stdout.read()
    retval = p.wait()
    if retval != 0:
        output = 'Error: command returned value: %s' % retval
    request.response.content_type = 'text/plain'
    request.response.write(output)
    return request.response
