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
        assert self.downloads.get_total_counts([12345]) == [1]
        self.downloads.count(12345, 'me')
        assert self.downloads.get_total_counts([12345]) == [2]
        self.downloads.count(12345, 'you')
        assert self.downloads.get_total_counts([12345]) == [3]
        # have a download in 29 days
        when = datetime.datetime.utcnow()
        future_date = when + datetime.timedelta(days=29)
        self.downloads.count(12345, 'me', future_date)
        assert self.downloads.get_total_counts([12345], future_date) == [4]
        # if there is a download after 30 days, the initial
        # 3 downloads of today should drop off
        future_date = when + datetime.timedelta(days=30)
        self.downloads.count(12345, 'me', future_date)
        assert self.downloads.get_total_counts([12345], future_date) == [2]

    def test_read_new_download_counter(self):
        tomorrow = datetime.datetime.utcnow() + datetime.timedelta(days=1)
        assert self.downloads.get_total_counts([12345])[0] == 0
        self.downloads.count(12345, 'me')
        assert self.downloads.get_total_counts([12345])[0] == 1
        # although no download has occurred, yesterdays download
        # is counted
        self.downloads.count(12345, 'me', tomorrow)[0] == 1

    def test_unique_download_counter(self):
        self.downloads.count(12345, 'me')
        assert self.downloads.get_total_counts([12345]) == [1]
        assert self.downloads.get_unique_counts([12345]) == [1]
        self.downloads.count(12345, 'you')
        assert self.downloads.get_total_counts([12345]) == [2]
        assert self.downloads.get_unique_counts([12345]) == [2]
        self.downloads.count(12345, 'me')
        assert self.downloads.get_total_counts([12345]) == [3]
        assert self.downloads.get_unique_counts([12345]) == [2]
        self.downloads.count(12345, 'you')
        assert self.downloads.get_total_counts([12345]) == [4]
        assert self.downloads.get_unique_counts([12345]) == [2]
        # user me downloads again after 29 days, which
        # increments the totals but not the unique totals
        when = datetime.datetime.utcnow()
        future_date = when + datetime.timedelta(days=29)
        self.downloads.count(12345, 'me', future_date)
        assert self.downloads.get_total_counts([12345]) == [5]
        assert self.downloads.get_unique_counts([12345]) == [2]
        # if there is a download after 30 days, the initial
        # downloads of today should drop off,
        # the unique download  from user 'you' is also gone
        future_date = when + datetime.timedelta(days=30)
        self.downloads.count(12345, 'me', future_date)
        assert self.downloads.get_total_counts([12345]) == [2]
        assert self.downloads.get_unique_counts([12345]) == [1]

    def test_global_download_counter(self):
        # 2 users downloading each 2 different materials 2 times
        for expression_id in [1, 2]:
            self.downloads.count(expression_id, 'me')
            self.downloads.count(expression_id, 'you')
            self.downloads.count(expression_id, 'me')
            self.downloads.count(expression_id, 'you')
            assert self.downloads.get_total_counts([expression_id]) == [4]
            assert self.downloads.get_unique_counts([expression_id]) == [2]
        assert self.downloads.get_total_counts(['repo']) == [8]
        assert self.downloads.get_unique_counts(['repo']) == [2]
