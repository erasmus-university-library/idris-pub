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
    config.scan('idris.apps.course.reports')
    config.registry.registerUtility(
        ProCourseRoyaltyCalculator2017, ICourseRoyaltyCalculator, '2017')
    config.registry.registerUtility(
        ProCourseRoyaltyCalculator2018, ICourseRoyaltyCalculator, '2018')
