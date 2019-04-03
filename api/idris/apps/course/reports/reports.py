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
            today = datetime.datetime.today().strftime('%Y-%m-%d')
            filename = '{date}-course-materials-report.csv'.format(date=today)
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
    name='CourseMaterialInfoReport',
    renderer='csv',  # Renderer is added in base/__init__.py
    path='/api/v1/course/records/{id}/materials/report',
    factory=ResourceFactory(CourseResource),
    api_security=[{'jwt': []}])


@course_material_report.get(permission='view')
def course_material_report_view(request):
    context = request.context
    result = context.course_material_report()
    fieldnames = list(result[0].keys())
    rows = [[x['id'], x['type'], x['words'],
             x['pages'], x['blob_count'],
             x['url_count'], x['starting'],
             x['ending'], x['book_pages'],
             x['book_title']] for x in result]
    return {'header': fieldnames, 'rows': rows}
