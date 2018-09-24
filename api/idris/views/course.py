import json

from cornice import Service

from idris.resources import CourseResource

course_nav = Service(name='CourseNavigation',
                     path='/api/v1/course/nav',
                     factory=CourseResource,
                     api_security=[{'jwt': []}],
                     tags=['course'],
                     cors_origins=('*', ))


@course_nav.get(permission='view')
def course_nav_view(request):
    response = request.response
    response.content_type = 'application/json'
    response.write(
        json.dumps(request.context.navigation()).encode('utf8'))
    return response
