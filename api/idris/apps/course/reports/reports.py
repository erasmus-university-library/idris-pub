# from sqlalchemy import func
import csv
import datetime
from io import StringIO
from cornice import Service
from idris.resources import ResourceFactory
from idris.apps.course.resources import CourseResource


# XXX If we keep this move it to a renderers module.
class CSVRenderer(object):
    def __init__(self, info):
        pass

    def __call__(self, value, system):
        request = system.get('request')
        if request is not None:
            report = value.get('report', 'none')
            today = datetime.datetime.today().strftime('%Y-%m-%d')
            filename = '{date}-{report}.csv'.format(
                date=today, report=report)
            content_disposition = 'attachment;filename={filename}'.format(
                filename=filename)
            response = request.response
            response.content_type = 'text/csv'
            response.content_disposition = content_disposition
        fout = StringIO()
        writer = csv.writer(fout)
        writer.writerow(value.get('header', []))
        writer.writerows(value.get('rows', []))
        return fout.getvalue()


course_material_report = Service(
    name='CourseMaterialsReport',
    renderer='csv',  # Renderer is added in base/__init__.py
    path='/api/v1/course/records/{id}/materials/report',
    factory=ResourceFactory(CourseResource),
    api_security=[{'jwt': []}])


@course_material_report.get(permission='view')  # XXX Change this but to what?
def course_material_report_view(request):
    context = request.context
    fieldnames = ['id', 'type', 'words', 'pages',
                  'blob_count', 'url_count', 'starting',
                  'ending', 'book_pages', 'book_title']
    result = context.course_material_report()
    rows = []
    if result:
        rows = [list(x.values()) for x in result]
    return {'report': 'course-materials-report',
            'header': fieldnames, 'rows': rows}


course_faculty_report = Service(
    name='CourseFacultyReport',
    renderer='csv',  # Renderer is added in base/__init__.py
    path='/api/v1/course/records/faculty/report',
    factory=ResourceFactory(CourseResource),
    api_security=[{'jwt': []}])


@course_faculty_report.get(permission='view')  # XXX Change this but to what?
def course_faculty_report_view(request):
    context = request.context
    fieldnames = ['faculty', 'courses', 'latest', 'earliest']
    result = context.course_faculty_report()
    rows = []
    if result:
        rows = [list(x.values()) for x in result]
    return {'report': 'course-faculty-report',
            'header': fieldnames, 'rows': rows}
