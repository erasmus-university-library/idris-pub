from idris.interfaces import IAppRoot
from idris.apps.base.resources import BaseAppRoot


def includeme(config):
    config.add_renderer(
        'csv', 'idris.apps.course.reports.reports.CSVRenderer')
    config.registry.registerUtility(
        BaseAppRoot, IAppRoot, 'base')
    config.scan('idris.apps.base.views')
