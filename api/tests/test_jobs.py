from redis import Redis
from rq import SimpleWorker, Queue
from fakeredis import FakeStrictRedis
from idris.jobs import person_bulk_export_job

from core import BaseTest


class BackgroundJobsTest(BaseTest):

    def test_foo(self):
        from webtest import TestApp as WebTestApp
        app = WebTestApp('http://unittest.localhost')
        fake_redis = FakeStrictRedis()
        queue = Queue(is_async=False, connection=fake_redis)
        url = 'http://unittest.localhost/api/v1/person/bulk?limit=1'
        job = queue.enqueue(person_bulk_export_job, url)
