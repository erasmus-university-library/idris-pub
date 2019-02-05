from pyramid.view import view_config

from idris.apps.base.resources import BaseAppRoot
from idris.utils import load_web_index_template

@view_config(context=BaseAppRoot)
def home_view(request):
    request.response.write(
        '<html><head><title>BaseApp</title></head><body></body></html>')
    return request.response

@view_config(context=BaseAppRoot, name='edit')
def edit_view(request):
    config = {'app': 'edit'}
    html = load_web_index_template('index.html', config)
    request.response.content_type = 'text/html'
    request.response.write(html.encode('utf8'))
    return request.response
