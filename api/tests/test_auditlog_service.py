import os
import time
import uuid

import pytest

from idris.services.auditlog import auditlog_factory
from core import BaseTest, no_google_credentials


@pytest.mark.skipif(os.environ.get('TESTENV') == 'travis',
                    reason='No GCP support when running in Travis')
@no_google_credentials
class CacheServiceTest(BaseTest):

    def setUp(self):
        super(CacheServiceTest, self).setUp()
        self.log = auditlog_factory(self.app.registry, 'unittest')

    def tearDown(self):
        try:
            self.log.client.delete_table(
                self.log.client.dataset(
                    self.log.ds_name).table('test_auditlog'))
        except:
                pass
    """
    def test_create_table(self):
        assert self.log.has_log('test') is False
        assert self.log.create_log('test')
        assert self.log.has_log('test') is True

    def test_append_and_retrieve(self):
        assert self.log.create_log('test')
        work_id = 12345
        # bigquery will try and de-duplicate the rows
        # so, add some random values
        # also, it could be that the rows have not
        # materialized in the db, when we query the
        # results, so we add a couple and wait a bit
        for i in range(4):
            self.log.append('test',
                            'download',
                            work_id,
                            i,
                            message='this is test %s' % i,
                            value=str(uuid.uuid4()))
        time.sleep(1)
        entries = list(self.log.work_history('test', work_id))
        assert len(entries)
        assert entries[0]['message'].startswith('this is test')
            """
