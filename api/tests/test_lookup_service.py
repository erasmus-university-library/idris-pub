import warnings
import datetime

from idris import main
from idris.services.lookup import lookup_factory, LookupError

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

    def test_crossref_article_query(self):
        assert self.lookup.settings['email'] == 'jasper@artudis.com'
        doi = '10.1038/nphys1170'
        try:
            result = self.lookup.query(doi)
        except LookupError:
            # crossref might be down
            warnings.warn('Error connecting to "%s"' % self.lookup.base_url)
            return
        assert result['title'] == 'Measured measurement: Quantum tomography'
        assert result['type'] == 'article'
        assert result['issued'] == datetime.date(2009, 1, 1)

    def test_crossref_bookchapter_query(self):
        assert self.lookup.settings['email'] == 'jasper@artudis.com'
        doi = '10.1002/0470841559.ch1'
        try:
            result = self.lookup.query(doi)
        except LookupError:
            # crossref might be down
            warnings.warn('Error connecting to "%s"' % self.lookup.base_url)
            return
        assert result['title'] == 'Network Concepts'
        assert result['type'] == 'bookChapter'
        assert result['issued'] == datetime.date(2003, 4, 2)


    def test_crossref_notfound(self):
        doi = '10.123456/foobar'
        try:
            result = self.lookup.query(doi)
        except LookupError:
            # crossref might be down
            warnings.warn('Error connecting to "%s"' % self.lookup.base_url)
            return
        assert result is None

    def test_crossref_broken(self):
        self.lookup.base_url = 'http://localhost/whatever/%s'
        doi = '10.123456/foobar'
        with self.assertRaises(LookupError):
            self.lookup.query(doi)
