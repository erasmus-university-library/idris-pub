import transaction

from core import BaseTest
from caleido.models import User

class MembershipWebTest(BaseTest):

    def setUp(self):
        super(MembershipWebTest, self).setUp()
        headers = dict(Authorization='Bearer %s' % self.admin_token())
        out = self.api.post_json('/api/v1/person/records',
                                 {'family_name': 'Doe',
                                  'given_name': 'John'},
                                 headers=headers,
                                 status=201)
        self.john_id = out.json['id']
        out = self.api.post_json('/api/v1/person/records',
                                 {'family_name': 'Doe',
                                  'given_name': 'Jane'},
                                 headers=headers,
                                 status=201)
        self.jane_id = out.json['id']
        out = self.api.post_json('/api/v1/group/records',
                                 {'international_name': 'Corp.',
                                  'type': 'organisation'},
                                 headers=headers,
                                 status=201)
        self.corp_id = out.json['id']

    def test_membership_crud_as_admin(self):
        headers = dict(Authorization='Bearer %s' % self.admin_token())
        out = self.api.post_json('/api/v1/membership/records',
                                 {'person_id': self.john_id,
                                  'group_id': self.corp_id,
                                  'start_date': '2017-01-01',
                                  'end_date': '2017-12-31'},
                                 headers=headers,
                                 status=201)
        last_id = out.json['id']
        self.api.put_json('/api/v1/membership/records/%s' % last_id,
                          {'id': last_id,
                           'person_id': self.jane_id,
                           'group_id': self.corp_id},
                          headers=headers,
                          status=200)
        out = self.api.get('/api/v1/membership/records/%s' % last_id,
                          headers=headers,
                          status=200)
        assert out.json['person_id'] == self.jane_id
        self.api.delete('/api/v1/membership/records/%s' % last_id,
                        headers=headers,
                        status=200)
        self.api.get('/api/v1/membership/records/%s' % last_id,
                          headers=headers,
                          status=404)

class MembershipAuthorzationWebTest(MembershipWebTest):

    def test_crud_memberships_by_user_memberships(self):
        super(MembershipAuthorzationWebTest, self).setUp()
        # add some users
        test_users = [('test_admin', 100),
                      ('test_manager', 80),
                      ('test_editor',  60)]
        session = self.storage.make_session(namespace='unittest')
        for user, user_group in test_users:
            session.add(
                User(userid=user, credentials=user, user_group=user_group))
        session.flush()
        transaction.commit()
        for user, user_membership in test_users:
            token = self.api.post_json(
            '/api/v1/auth/login',
            {'user': user, 'password': user}).json['token']
            headers = dict(Authorization='Bearer %s' % token)
            out = self.api.post_json('/api/v1/membership/records',
                                     {'person_id': self.john_id,
                                      'group_id': self.corp_id,
                                      'start_date': '2017-01-01',
                                      'end_date': '2017-12-31'},
                                     headers=headers,
                                     status=201)
            last_id = out.json['id']
            out = self.api.get('/api/v1/membership/records/%s' % last_id,
                               headers=headers)
            assert out.json['person_id'] == self.john_id
            out = self.api.put_json('/api/v1/membership/records/%s' % last_id,
                                    {'id': last_id,
                                     'person_id': self.jane_id,
                                     'group_id': self.corp_id},
                                    headers=headers,
                                    status=200)
            assert out.json['person_id'] == self.jane_id
            out = self.api.delete('/api/v1/membership/records/%s' % last_id,
                                  headers=headers)
            self.api.get('/api/v1/membership/records/%s' % last_id,
                         headers=headers,
                         status=404)

    def test_person_owners_can_view_and_edit(self):
        headers = dict(Authorization='Bearer %s' % self.admin_token())
        out = self.api.post_json('/api/v1/membership/records',
                                 {'person_id': self.john_id,
                                  'group_id': self.corp_id,
                                  'start_date': '2017-01-01',
                                  'end_date': '2017-12-31'},
                                 headers=headers,
                                 status=201)
        membership_id = out.json['id']
        out = self.api.post_json(
            '/api/v1/user/records',
            {'userid': 'john',
             'credentials': 'john',
             'user_group': 40,
             'owns': [{'person_id': self.john_id}]},
            headers=headers, status=201)
        assert out.json['owns'] == [{'person_id': self.john_id}]
        token = self.api.post_json(
            '/api/v1/auth/login',
            {'user': 'john', 'password': 'john'}).json['token']
        john_headers = dict(Authorization='Bearer %s' % token)
        # we can view the metadata
        out = self.api.get('/api/v1/membership/records/%s' % membership_id,
                           headers=john_headers)
        # and are allowed to edit it
        out = self.api.put_json('/api/v1/membership/records/%s' % membership_id,
                                {'id': membership_id,
                                 'person_id': self.john_id,
                                 'group_id': self.corp_id,
                                 'start_date': '2015-01-01'},
                                headers=headers,
                                status=200)
        # owners can also delete
        self.api.delete(
            '/api/v1/membership/records/%s' % membership_id,
             headers=john_headers, status=200)

    def test_group_owners_can_view_and_edit(self):
        headers = dict(Authorization='Bearer %s' % self.admin_token())
        out = self.api.post_json('/api/v1/membership/records',
                                 {'person_id': self.john_id,
                                  'group_id': self.corp_id,
                                  'start_date': '2017-01-01',
                                  'end_date': '2017-12-31'},
                                 headers=headers,
                                 status=201)
        membership_id = out.json['id']
        out = self.api.post_json(
            '/api/v1/user/records',
            {'userid': 'john',
             'credentials': 'john',
             'user_group': 40,
             'owns': [{'group_id': self.corp_id}]},
            headers=headers, status=201)
        assert out.json['owns'] == [{'group_id': self.corp_id}]
        token = self.api.post_json(
            '/api/v1/auth/login',
            {'user': 'john', 'password': 'john'}).json['token']
        john_headers = dict(Authorization='Bearer %s' % token)
        # we can view the metadata
        out = self.api.get('/api/v1/membership/records/%s' % membership_id,
                           headers=john_headers)
        # and are allowed to edit it
        out = self.api.put_json('/api/v1/membership/records/%s' % membership_id,
                                {'id': membership_id,
                                 'person_id': self.john_id,
                                 'group_id': self.corp_id,
                                 'start_date': '2015-01-01'},
                                headers=headers,
                                status=200)
        # owners can also delete
        self.api.delete(
            '/api/v1/membership/records/%s' % membership_id,
             headers=john_headers, status=200)


    def test_membership_bulk_import(self):
        headers = dict(Authorization='Bearer %s' % self.admin_token())
        records = {'records': [
            {'id': 1,
             'person_id': 1,
             'group_id': 1,
             'start_date': '2017-01-01'},
            {'id': 2,
             'person_id': 1,
             'group_id': 1,
             'start_date': '2018-01-01'},
             ]}
        # bulk add records
        out = self.api.post_json('/api/v1/membership/bulk',
                                 records,
                                 headers=headers,
                                 status=201)
        assert out.json['status'] == 'ok'
        out = self.api.get('/api/v1/membership/records/2', headers=headers)
        assert out.json['start_date'] == '2018-01-01'
        records['records'][1]['end_date'] = '2018-12-31'
        # bulk update records
        out = self.api.post_json('/api/v1/membership/bulk',
                                 records,
                                 headers=headers,
                                 status=201)
        assert out.json['status'] == 'ok'
        out = self.api.get('/api/v1/membership/records/2', headers=headers)
        assert out.json['end_date'] == '2018-12-31'
