from pyramid.httpexceptions import HTTPFound

from idris.interfaces import IAppRoot, ICourseRoyaltyCalculator

from idris.apps.course.resources import CourseAppRoot
from idris.apps.course.services import (
    ProCourseRoyaltyCalculator2017,
    ProCourseRoyaltyCalculator2018)

def includeme(config):
    config.registry.registerUtility(
        CourseAppRoot, IAppRoot, 'course')
    config.scan('idris.apps.course.views')
    config.registry.registerUtility(
        ProCourseRoyaltyCalculator2017, ICourseRoyaltyCalculator, '2017')
    config.registry.registerUtility(
        ProCourseRoyaltyCalculator2018, ICourseRoyaltyCalculator, '2018')

    config.add_route('course_without_slash', '/course')
    config.add_view(
        lambda _, __: HTTPFound('/course/'), route_name='course_without_slash')
    config.add_static_view('course', path='idris:static/dist/web')
