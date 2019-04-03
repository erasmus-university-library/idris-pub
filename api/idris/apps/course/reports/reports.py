# from sqlalchemy import func
import csv
import datetime
from io import StringIO
from cornice import Service
from idris.resources import ResourceFactory, GroupResource
from idris.apps.course.resources import CourseResource, CourseGroupResource


# XXX If we keep this move it to a renderers module.
class CSVRenderer(object):
    def __init__(self, info):
        pass

    def __call__(self, value, system):
        request = system.get('request')
        if request is not None:  # XXX If it is None?
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


def _initialize_report(report_resource, report_name, fieldnames):
    result = report_resource()
    rows = []
    if result:
        rows = [list(x.values()) for x in result]
    return {'report': report_name,
            'header': fieldnames, 'rows': rows}


course_materials_report = Service(
    name='CourseMaterialsReport',
    renderer='csv',  # Renderer is added in base/__init__.py
    path='/api/v1/course/records/{id}/materials/report',
    factory=ResourceFactory(CourseResource),
    api_security=[{'jwt': []}])


@course_materials_report.get(permission='view')  # XXX Change this but to what?
def course_materials_report_view(request):
    context = request.context
    fieldnames = ['id', 'type', 'words', 'pages',
                  'blob_count', 'url_count', 'starting',
                  'ending', 'book_pages', 'book_title']
    result = _initialize_report(
        context.course_materials_report,
        'course-materials-report', fieldnames)
    return result


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
    result = _initialize_report(
        context.course_faculty_report,
        'course-faculty-report', fieldnames)
    return result


materials_by_courses_report = Service(
    name='MaterialsByCoursesReport',
    renderer='csv',  # Renderer is added in base/__init__.py
    path='/api/v1/course/records/{id}/materials/by/courses/report',
    factory=ResourceFactory(CourseGroupResource),
    api_security=[{'jwt': []}])


@materials_by_courses_report.get(permission='view')
def materials_by_courses_report_view(request):
    context = request.context
    fieldnames = ['id', 'title', 'courseCode',
                  'starting', 'ending', 'materials']
    result = _initialize_report(
        context.materials_by_courses_report,
        'materials-by-courses-report', fieldnames)
    return result
