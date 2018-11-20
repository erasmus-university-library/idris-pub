from zope.interface import implementer

from idris.interfaces import IAppRoot

@implementer(IAppRoot)
class BaseAppRoot(object):
    def __init__(self, request):
        self.request = request

    def __getitem__(self, key):
        raise KeyError('no such page: %s' % key)
