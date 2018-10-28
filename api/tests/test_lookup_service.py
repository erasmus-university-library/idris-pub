from idris import main
from idris.interfaces import IDataLookupService
from idris.lookup import lookup_services, lookup_factory

from core import BaseTest

class CrossRefLookupTest(BaseTest):

    def app_settings(self):
        settings = super(CrossRefLookupTest, self).app_settings()
        settings['idris.lookup.crossref.email'] = 'jasper@artudis.com'
        return settings

    def setUp(self):
        settings = self.app_settings()
        self.app = main({}, **settings)
        self.lookup = lookup_factory(self.app.registry, 'crossref')

    def test_service_query(self):
        assert self.lookup.settings['email'] == 'jasper@artudis.com'
        doi = '10.1038/nphys1170'
        result = self.lookup.query(doi)
        assert result['title'] == 'Measured measurement'
