import datetime
from idris.services.download_counter import download_counter_factory

from core import BaseTest


class DownloadCounterServiceTest(BaseTest):

    def setUp(self):
        super(DownloadCounterServiceTest, self).setUp()
        self.downloads = download_counter_factory(self.app.registry, 'unittest')
        self.downloads.flush()

    def test_write_download_counter(self):
        self.downloads.count(12345, 'me')
        assert self.downloads.get_count(12345) == 1
        self.downloads.count(12345, 'me')
        assert self.downloads.get_count(12345) == 2
        self.downloads.count(12345, 'you')
        assert self.downloads.get_count(12345) == 3
        # have a download in 29 day
        when = datetime.datetime.utcnow()
        future_date = when + datetime.timedelta(days=29)
        self.downloads.count(12345, 'me', future_date)
        assert self.downloads.get_count(12345, future_date) == 4
        # if there is a download after 30 days, the initial
        # 3 downloads of today should drop off
        future_date = when + datetime.timedelta(days=30)
        self.downloads.count(12345, 'me', future_date)
        assert self.downloads.get_count(12345, future_date) == 2

    def test_read_new_download_counter(self):
        assert self.downloads.get_count(12345) == 0
