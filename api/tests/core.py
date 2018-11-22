import unittest
import os
import shutil
import pytest

import transaction
from pyramid import testing
from webtest import TestApp as WebTestApp

from idris import configure
from idris.storage import Storage
from idris.models import User, Owner
from idris.resources import UserResource
from idris.blob import LocalBlobStore

DB_INITIALIZED_TESTS = set()


GOOGLE_CREDENTIALS_FILE = '/home/jasper/wip/idris/caleido-eur-service-account.json'


def has_google_credentials_file():
    return os.path.isfile(GOOGLE_CREDENTIALS_FILE)


no_google_credentials = pytest.mark.skipif(
    not has_google_credentials_file(),
    reason='No GCP support when running locally')


class BaseTest(unittest.TestCase):

    def app_settings(self):
        settings = {
            'idris.secret': 'sekret',
            'idris.blob_path': '/tmp/idris.files',
            'idris.blob_backend': 'local',
            'idris.blob_root_prefix': 'var/files',
            'idris.google_cloud_project': 'caleido-eur',
            'idris.lookup.crossref.email': 'jasper@artudis.com',
            'sqlalchemy.url': (
                'postgresql://idris:c4l31d0@localhost/idris')
        }
        if has_google_credentials_file():
            settings.update({
                'idris.google_application_credentials': GOOGLE_CREDENTIALS_FILE
            })
        return settings

    def setUp(self, app_name='base'):
        settings = self.app_settings()

        self.config = configure({}, **settings)
        self.app = self.config.make_wsgi_app()

        self.storage = self.app.registry['storage']
        blob_path = LocalBlobStore.root_path(
            settings['idris.blob_root_prefix'],
            'unittest')

        if os.path.isdir(blob_path):
            shutil.rmtree(blob_path)

        self.api = WebTestApp(
            self.app,
            extra_environ={'HTTP_HOST': 'unittest.localhost'})
        storage = Storage(self.app.registry)
        self.session = storage.make_session()
        if True:  # self.__class__.__name__ not in DB_INITIALIZED_TESTS:
            DB_INITIALIZED_TESTS.add(self.__class__.__name__)
            if 'unittest' in storage.repository_info(self.session):
                storage.drop_repository(self.session, 'unittest')
                transaction.commit()
            storage.create_repository(self.session,
                                      'unittest',
                                      'unittest.localhost',
                                      app_name)
        else:
            storage.clear_repository(self.session, 'unittest')

        storage.initialize_repository(self.session,
                                      'unittest',
                                      'admin',
                                      'admin')
        transaction.commit()

    def admin_token(self):
        return self.api.post_json(
            '/api/v1/auth/login',
            {'user': 'admin', 'password': 'admin'}).json['token']

    def generate_test_token(self, user_group_password, owners=None):
        """Returns a token for owner / editor / admin / viewer
        If the user does not exist, a new user is created
        """
        response = self.api.post_json(
            '/api/v1/auth/login',
            {'user': user_group_password, 'password': user_group_password},
            status=[200, 401])
        if response.status_code == 401:
            context = UserResource(self.storage.registry, self.session)
            context.put(
                User(userid=user_group_password,
                     credentials=user_group_password,
                     owns=[Owner(**d) for d in (owners or [])],
                     user_group={'admin': 100,
                                 'manager': 80,
                                 'editor': 60,
                                 'owner': 40,
                                 'viewer': 10}[user_group_password]),
                principals=['group:admin'])
            transaction.commit()
            response = self.api.post_json(
                '/api/v1/auth/login',
                {'user': user_group_password, 'password': user_group_password})
        return response.json['token']

    def tearDown(self):
        testing.tearDown()
        transaction.abort()
