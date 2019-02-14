from idris.services.cache import cache_factory

from core import BaseTest


class CacheServiceTest(BaseTest):

    def setUp(self):
        super(CacheServiceTest, self).setUp()
        self.cache = cache_factory(self.app.registry, 'unittest')

    def test_set_get(self):
        assert self.cache.set('hello', 'world')
        assert self.cache.get('hello') == b'world'
        assert self.cache.set('hello', b'world')
        assert self.cache.get('hello') == b'world'
        assert self.cache.set('hello', 1)
        assert self.cache.get('hello') == b'1'

        assert self.cache.set('foo', 'bar')
        assert self.cache.get('foo') == b'bar'
        assert self.cache.delete('foo')
        assert self.cache.get('foo') is None

        assert self.cache.flush() == 1
        assert self.cache.get('hello') is None

    def test_multi_tenancy(self):
        cache_x = cache_factory(self.app.registry, 'x')
        cache_y =  cache_factory(self.app.registry, 'y')
        assert cache_x.set('hello', 'x world')
        assert cache_y.set('hello', 'y world')
        assert cache_x.get('hello') == b'x world'
        assert cache_x.flush() == 1
        assert cache_x.get('hello') is None
        assert cache_y.get('hello') == b'y world'
        assert cache_y.flush() == 1
