import unittest
import os
import shutil

import transaction
from pyramid import testing
from webtest import TestApp as WebTestApp

from idris import main
from idris.storage import Storage
from idris.models import User, Owner
from idris.resources import UserResource


class BaseTest(unittest.TestCase):

    def app_settings(self):
        return {
            'idris.secret': 'sekret',
            'idris.blob_path': '/tmp/idris.files',
            'idris.blob_storage': 'local',
            'idris.blob_api': 'http://unittest.localhost/api/v1/blob/upload/',
            'sqlalchemy.url': (
                'postgresql://idris:c4l31d0@localhost/idris')
        }

    def setUp(self):
        settings = self.app_settings()
        self.app = main({}, **settings)

        self.storage = self.app.registry['storage']
        blob_path = settings['idris.blob_path']
        if os.path.isdir(blob_path):
            shutil.rmtree(blob_path)
        self.api = WebTestApp(
            self.app,
            extra_environ={'HTTP_HOST': 'unittest.localhost'})
        storage = Storage(self.app.registry)
        self.session = storage.make_session()
        if 'unittest' in storage.repository_info(self.session):
            storage.drop_repository(self.session, 'unittest')
            transaction.commit()
        storage.create_repository(self.session,
                                  'unittest',
                                  'unittest.localhost')
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
