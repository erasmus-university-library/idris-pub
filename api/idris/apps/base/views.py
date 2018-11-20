from pyramid.view import view_config

from idris.apps.base.resources import BaseAppRoot

@view_config(context=BaseAppRoot)
def home_view(request):
    request.response.write(
        '<html><head><title>BaseApp</title></head><body></body></html>')
    return request.response
