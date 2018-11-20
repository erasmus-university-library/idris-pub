from idris.interfaces import IAppRoot

from idris.apps.base.resources import BaseAppRoot

def includeme(config):
    config.registry.registerUtility(
        BaseAppRoot, IAppRoot, 'base')
    config.scan('idris.apps.base.views')
