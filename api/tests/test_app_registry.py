import transaction

from core import BaseTest

from idris.interfaces import IAppRoot


class UnittestAppRoot(object):
    def __init__(self, request):
        self.request = request

    def __getitem__(self, key):
        if key == 'foo':
            return FooResource()
        raise KeyError('Not Found')


class FooResource(object):
    name = 'bar'

def unittest_home_view(request):
    request.response.write('unittest home view')
    return request.response

def unittest_foo_view(request):
    request.response.write(request.context.name)
    return request.response

class AppRegistryTest(BaseTest):

    def test_base_app_registries(self):
        # the default base app has an index view
        out = self.api.get('/')
        assert out.status_code == 200
        # it does not have a /foo view
        self.api.get('/foo', status=404)
        # register a custom unittest app root
        self.app.registry.registerUtility(
            UnittestAppRoot, IAppRoot, 'app_registry_test')
        # with an index view, and a view for FooResources
        self.config.add_view(
            unittest_home_view, context=UnittestAppRoot)
        self.config.add_view(
            unittest_foo_view, context=FooResource)
        self.app = self.config.make_wsgi_app()
        # now lets change the database to use this unittest app
        from idris.models import Repository
        repo = self.session.query(Repository).filter(
            Repository.namespace == 'unittest').scalar()
        repo.app = 'app_registry_test'
        self.session.add(repo)
        transaction.commit()
        # now let's render the home view of the unittest app
        out = self.api.get('/')
        assert out.text == 'unittest home view'
        out = self.api.get('/foo', status=200)
        assert out.text == 'bar'
