import json
from core import BaseTest


class WorkWebTest(BaseTest):

    def test_crud_as_admin(self):
        headers = dict(Authorization='Bearer %s' % self.admin_token())
        out = self.api.post_json('/api/v1/work/records',
                                 {'title': 'A test article.',
                                  'issued': '2018-02-26',
                                  'type': 'article'},
                                 headers=headers)
        assert out.status_code == 201
        last_id = out.json['id']
        self.api.put_json('/api/v1/work/records/%s' % last_id,
                          {'id': last_id,
                           'title': 'A modified article.',
                           'issued': '2018-02-26',
                           'type': 'article'},
                          headers=headers,
                          status=200)
        out = self.api.get('/api/v1/work/records/%s' % last_id,
                          headers=headers,
                          status=200)
        assert out.json['title'] == 'A modified article.'
        self.api.delete('/api/v1/work/records/%s' % last_id,
                        headers=headers,
                        status=200)
        self.api.get('/api/v1/group/work/%s' % last_id,
                          headers=headers,
                          status=404)

    def test_invalid_group_type(self):
        headers = dict(Authorization='Bearer %s' % self.admin_token())
        out = self.api.post_json('/api/v1/work/records',
                                 {'title': 'A test article.',
                                  'issued': '2018-02-26',
                                  'type': 'foobar'},
                                 headers=headers,
                                 status=400)
        assert out.json['errors'][0]['name'] == 'type'
        assert out.json['errors'][0]['location'] == 'body'
        assert out.json['errors'][0]['description'].startswith(
            '"foobar" is not one of')

    def test_work_bulk_import(self):
        headers = dict(Authorization='Bearer %s' % self.admin_token())
        records = {'records': [
            {'id': 1,
             'title': 'Pub 1',
             'type': 'article',
             'issued': '2018-01-01'},
            {'id': 2,
             'title': 'Pub 2',
             'type': 'article',
             'issued': '2018-01-01'
             }]}
        # bulk add records
        out = self.api.post_json('/api/v1/work/bulk',
                                 records,
                                 headers=headers,
                                 status=201)
        assert out.json['status'] == 'ok'
        out = self.api.get('/api/v1/work/records/2', headers=headers)
        assert out.json['title'] == 'Pub 2'
        records['records'][1]['title'] = 'Pub 2 with modified title'
        # bulk update records
        out = self.api.post_json('/api/v1/work/bulk',
                                 records,
                                 headers=headers,
                                 status=201)
        assert out.json['status'] == 'ok'
        out = self.api.get('/api/v1/work/records/2', headers=headers)
        assert out.json['title'] == 'Pub 2 with modified title'

    def test_work_bulk_export_record_schema(self):
        headers = dict(Authorization='Bearer %s' % self.admin_token())
        records = {'records': [
            {'id': 1,
             'title': 'Pub 1',
             'type': 'article',
             'issued': '2018-01-01'},
            {'id': 2,
             'title': 'Pub 2',
             'type': 'article',
             'issued': '2018-01-01'
             }]}

        # bulk add records
        out = self.api.post_json('/api/v1/work/bulk',
                                 records,
                                 headers=headers,
                                 status=201)
        # Export records.
        out = self.api.get('/api/v1/work/bulk?limit=1', headers=headers)

        # Test the output keys.
        out_keys = sorted(['remaining', 'records', 'limit', 'cursor', 'status'])
        assert out_keys == sorted(list(out.json.keys()))

        # Test the record keys.
        record = out.json['records'][0]
        record_keys = sorted(['id', 'title', 'type', 'issued',
                              'start_date', 'end_date', 'identifiers',
                              'measures', 'contributors', 'descriptions',
                              'expressions', 'relations'])
        assert record_keys == sorted(list(record.keys()))

        # Test record contents.
        assert record['id'] == 1
        assert record['type'] == 'article'
        assert record['title'] == 'Pub 1'
        assert record['issued'] == '2018-01-01'
        assert record['start_date'] == '2018-01-01'
        assert record['end_date'] == '2018-01-01'
        assert len(record['identifiers']) == 0
        assert len(record['measures']) == 0
        assert len(record['contributors']) == 0
        assert len(record['descriptions']) == 0
        assert len(record['expressions']) == 0
        assert len(record['relations']) == 0


class WorkPermissionWebTest(BaseTest):
    def setUp(self):
        super(WorkPermissionWebTest, self).setUp()
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
        out = self.api.post_json('/api/v1/work/records',
                                 {'title': 'Test Publication',
                                  'type': 'article',
                                  'issued': '2018-02-27'},
                                 headers=headers,
                                 status=201)
        self.pub_id = out.json['id']
        out = self.api.post_json('/api/v1/work/records',
                                 {'title': 'Another Test Publication',
                                  'type': 'article',
                                  'issued': '2018-02-27'},
                                 headers=headers,
                                 status=201)
        self.another_pub_id = out.json['id']
        out = self.api.post_json('/api/v1/contributor/records',
                                 {'person_id': self.john_id,
                                  'work_id': self.pub_id,
                                  'role': 'author',
                                  'position': 0},
                                 headers=headers,
                                 status=201)
        self.contributor_id = out.json['id']
        self.api.post_json('/api/v1/contributor/records',
                           {'person_id': self.jane_id,
                            'work_id': self.another_pub_id,
                            'role': 'author',
                            'position': 0},
                           headers=headers,
                           status=201)
        self.api.post_json('/api/v1/membership/records',
                           {'person_id': self.john_id,
                            'group_id': self.corp_id,
                            'start_date': '2018-01-01',
                            'end_date': '2018-12-31'},
                           headers=headers,
                           status=201)
        self.api.post_json('/api/v1/membership/records',
                           {'person_id': self.jane_id,
                            'group_id': self.corp_id,
                            'start_date': '2017-01-01',
                            'end_date': '2017-12-31'},
                           headers=headers,
                           status=201)



    def test_listing_personal_owner_works(self):
        headers = dict(Authorization='Bearer %s' % self.generate_test_token(
            'owner', owners=[{'person_id': self.john_id}]))
        out = self.api.get('/api/v1/work/records',
                           headers=headers)
        assert len(out.json['records']) == 1


    def test_retrieve_contributor_affiliations_inline(self):
        headers = dict(Authorization='Bearer %s' % self.admin_token())
        self.api.post_json('/api/v1/affiliation/records',
                           {'contributor_id': self.contributor_id,
                            'work_id': self.pub_id,
                            'group_id':  self.corp_id,
                            'position': 0},
                           headers=headers,
                           status=201)
        out = self.api.get('/api/v1/work/records/%s' % self.pub_id,
                           headers=headers)
        assert len(out.json['contributors']) == 1
        contributor = out.json['contributors'][0]
        assert len(contributor['affiliations']) == 1

    def test_add_contributor_inline(self):
        headers = dict(Authorization='Bearer %s' % self.admin_token())
        out = self.api.get('/api/v1/work/records/%s' % self.pub_id,
                           headers=headers)
        pub = out.json
        assert len(pub['contributors']) == 1
        pub['contributors'].append({'position': 1,
                                    'role': 'author',
                                    'person_id': self.jane_id})
        out = self.api.put_json('/api/v1/work/records/%s' % self.pub_id,
                                pub,
                                headers=headers)
        pub = out.json
        assert len(pub['contributors']) == 2
        pub['contributors'] = list(reversed(pub['contributors']))
        out = self.api.put_json('/api/v1/work/records/%s' % self.pub_id,
                                pub,
                                headers=headers)
        pub = out.json
        assert pub['contributors'][0]['person_id'] == 2
        assert pub['contributors'][1]['person_id'] == 1

        del pub['contributors'][0]
        out = self.api.put_json('/api/v1/work/records/%s' % self.pub_id,
                                pub,
                                headers=headers)
        pub = out.json
        assert len(pub['contributors']) == 1

    def test_add_contributor_inline_group(self):
        headers = dict(Authorization='Bearer %s' % self.admin_token())
        out = self.api.get('/api/v1/work/records/%s' % self.pub_id,
                           headers=headers)
        pub = out.json
        assert len(pub['contributors']) == 1
        pub['contributors'].append({'position': 1,
                                    'role': 'author',
                                    'group_id': self.corp_id})
        out = self.api.put_json('/api/v1/work/records/%s' % self.pub_id,
                                pub,
                                headers=headers)
        pub = out.json
        assert len(pub['contributors']) == 2

        # test output GET
        out = self.api.get('/api/v1/work/records/%s' % self.pub_id,
                           headers=headers)
        corp = out.json['contributors'][1]
        assert corp['_group_name'] == 'Corp.'
        # test listing output
        out = self.api.get('/api/v1/work/records',
                           headers=headers)
        corp = out.json['records'][1]['contributors'][1]
        assert corp['_group_name'] == 'Corp.'
        # test listing output
        out = self.api.get('/api/v1/work/listing',
                           headers=headers)
        corp = out.json['snippets'][0]['contributors'][1]
        assert corp['group_name'] == 'Corp.'
        # test csl listing output
        out = self.api.get('/api/v1/work/listing?format=csl',
                           headers=headers)
        corp = out.json['snippets'][0]['author'][1]
        assert corp['literal'] == 'Corp.'

        del pub['contributors'][1]
        out = self.api.put_json('/api/v1/work/records/%s' % self.pub_id,
                                pub,
                                headers=headers)
        pub = out.json
        assert len(pub['contributors']) == 1

    def test_add_contributor_inline_description(self):
        headers = dict(Authorization='Bearer %s' % self.admin_token())
        out = self.api.get('/api/v1/work/records/%s' % self.pub_id,
                           headers=headers)
        pub = out.json
        assert len(pub['contributors']) == 1
        pub['contributors'].append(
            {'position': 1,
             'role': 'author',
             'description': 'John Doe',
             'person_info': json.dumps({'family_name': 'Doe',
                                        'given_name': 'John'})})
        out = self.api.put_json('/api/v1/work/records/%s' % self.pub_id,
                                pub,
                                headers=headers)
        pub = out.json
        assert len(pub['contributors']) == 2
        # test output GET
        out = self.api.get('/api/v1/work/records/%s' % self.pub_id,
                           headers=headers)
        somebody = out.json['contributors'][1]
        assert somebody['description'] == 'John Doe'
        assert json.loads(somebody['person_info'])['family_name'] == 'Doe'

        # test listing output
        out = self.api.get('/api/v1/work/records',
                           headers=headers)
        somebody = out.json['records'][1]['contributors'][1]
        assert somebody['description'] == 'John Doe'
        # test listing output
        out = self.api.get('/api/v1/work/listing',
                           headers=headers)
        somebody = out.json['snippets'][0]['contributors'][1]
        assert somebody['description'] == 'John Doe'
        # test csl listing output
        out = self.api.get('/api/v1/work/listing?format=csl',
                           headers=headers)
        somebody = out.json['snippets'][0]['author'][1]
        assert somebody['literal'] == 'John Doe'


    def test_add_contributor_inline_affiliations(self):
        headers = dict(Authorization='Bearer %s' % self.admin_token())
        out = self.api.get('/api/v1/work/records/%s' % self.pub_id,
                           headers=headers)
        pub = out.json
        assert len(pub['contributors']) == 1
        assert len(pub['contributors'][0]['affiliations']) == 0

        pub['contributors'][0]['affiliations'] = [{'group_id': self.corp_id,
                                                   'position': 0}]
        out = self.api.put_json('/api/v1/work/records/%s' % self.pub_id,
                                pub,
                                headers=headers)
        assert len(pub['contributors'][0]['affiliations']) == 1

    def test_add_contributor_inline_affiliations_with_description(self):
        headers = dict(Authorization='Bearer %s' % self.admin_token())
        out = self.api.get('/api/v1/work/records/%s' % self.pub_id,
                           headers=headers)
        pub = out.json
        assert len(pub['contributors']) == 1
        assert len(pub['contributors'][0]['affiliations']) == 0
        pub['contributors'][0]['affiliations'] = [
            {'description': 'Some Faculty',
             'group_info': json.dumps({
                 'international_name': 'Some Faculty',
                 'location': 'some address'}),
             'position': 0}]
        out = self.api.put_json('/api/v1/work/records/%s' % self.pub_id,
                                pub,
                                headers=headers)
        assert len(pub['contributors'][0]['affiliations']) == 1
        aff = pub['contributors'][0]['affiliations'][0]
        assert aff['description'] == 'Some Faculty'
        assert json.loads(aff['group_info'])['location'] == 'some address'

    def test_work_with_identifiers_inline(self):
        headers = dict(Authorization='Bearer %s' % self.admin_token())
        out = self.api.get('/api/v1/work/records/%s' % self.pub_id,
                           headers=headers)
        pub = out.json
        assert len(pub['identifiers']) == 0
        pub['identifiers'].append({'type': 'doi', 'value': '10.12345/54321'})
        out = self.api.put_json('/api/v1/work/records/%s' % self.pub_id,
                                pub,
                                headers=headers)
        assert len(pub['identifiers']) == 1
        pub['identifiers'][0]['value'] = 'changed'
        out = self.api.put_json('/api/v1/work/records/%s' % self.pub_id,
                                pub,
                                headers=headers)
        assert len(pub['identifiers']) == 1
        assert pub['identifiers'][0]['value'] == 'changed'

    def test_work_with_measures_inline(self):
        headers = dict(Authorization='Bearer %s' % self.admin_token())
        out = self.api.get('/api/v1/work/records/%s' % self.pub_id,
                           headers=headers)
        pub = out.json
        assert len(pub['measures']) == 0
        pub['measures'].append({'type': 'cites', 'value': '10'})
        out = self.api.put_json('/api/v1/work/records/%s' % self.pub_id,
                                pub,
                                headers=headers)
        assert len(pub['measures']) == 1
        pub['measures'][0]['value'] = 'changed'
        out = self.api.put_json('/api/v1/work/records/%s' % self.pub_id,
                                pub,
                                headers=headers)
        assert len(pub['measures']) == 1
        assert pub['measures'][0]['value'] == 'changed'


    def test_add_descriptions_inline(self):
        headers = dict(Authorization='Bearer %s' % self.admin_token())
        out = self.api.get('/api/v1/work/records/%s' % self.pub_id,
                           headers=headers)
        pub = out.json
        assert len(pub['descriptions']) == 0
        pub['descriptions'].append({'type': 'abstract',
                                    'format': 'text',
                                    'value': 'An abstract'})
        out = self.api.put_json('/api/v1/work/records/%s' % self.pub_id,
                                pub,
                                headers=headers)
        pub = out.json
        assert len(pub['descriptions']) == 1
        assert pub['descriptions'][0]['value'] == 'An abstract'
        pub['descriptions'].append({'type': 'abstract',
                                    'format': 'text',
                                    'value': 'Another abstract'})
        out = self.api.put_json('/api/v1/work/records/%s' % self.pub_id,
                                pub,
                                headers=headers)
        pub = out.json
        assert len(pub['descriptions']) == 2
        assert pub['descriptions'][1]['value'] == 'Another abstract'
        pub['descriptions'] = list(reversed(pub['descriptions']))
        out = self.api.put_json('/api/v1/work/records/%s' % self.pub_id,
                                pub,
                                headers=headers)
        pub = out.json
        assert len(pub['descriptions']) == 2
        assert pub['descriptions'][1]['value'] == 'An abstract'
        assert pub['descriptions'][0]['value'] == 'Another abstract'
        del pub['descriptions'][0]
        pub['descriptions'] = list(reversed(pub['descriptions']))
        out = self.api.put_json('/api/v1/work/records/%s' % self.pub_id,
                                pub,
                                headers=headers)
        pub = out.json
        assert len(pub['descriptions']) == 1
        assert pub['descriptions'][0]['value'] == 'An abstract'

    def test_add_relations_inline(self):
        headers = dict(Authorization='Bearer %s' % self.admin_token())
        out = self.api.get('/api/v1/work/records/%s' % self.pub_id,
                           headers=headers)
        pub = out.json

        assert len(pub['relations']) == 0
        pub['relations'].append({'type': 'isPartOf',
                                 'target_id': self.another_pub_id,
                                 'starting': '1',
                                 'ending': '2',
                                 'volume': '3',
                                 'issue': '4',
                                 'location': 'here'})
        out = self.api.put_json('/api/v1/work/records/%s' % self.pub_id,
                                pub,
                                headers=headers)
        pub = out.json
        assert len(pub['relations']) == 1
        assert pub['relations'][0]['_target_name'] == 'Another Test Publication'

    def test_add_relations_description(self):
        headers = dict(Authorization='Bearer %s' % self.admin_token())
        out = self.api.get('/api/v1/work/records/%s' % self.pub_id,
                           headers=headers)
        pub = out.json

        assert len(pub['relations']) == 0
        pub['relations'].append(
            {'type': 'isPartOf',
             'description': 'Some Journal',
             'target_info': json.dumps({'type': 'journal',
                                        'identifiers': [{'type': 'isnn',
                                                         'value': '1234-1233'}]}),
             'starting': '1',
             'ending': '2',
             'volume': '3',
             'issue': '4',
             'location': 'here'})

        out = self.api.put_json('/api/v1/work/records/%s' % self.pub_id,
                                pub,
                                headers=headers)
        pub = out.json
        assert len(pub['relations']) == 1
        assert pub['relations'][0]['description'] == 'Some Journal'
        assert json.loads(pub['relations'][0]['target_info'])['type'] == 'journal'

    def test_work_id_minting(self):
        headers = dict(Authorization='Bearer %s' % self.admin_token())
        out = self.api.get('/api/v1/work/ids', headers=headers)
        id_count = out.json['current_id']
        assert id_count > 0 # there are already works
        assert id_count == out.json['highest_observed_id']
        # let's increment the id
        out = self.api.post('/api/v1/work/ids', headers=headers)
        assert out.json['current_id'] == id_count + 1
        # note that there is no work with this id yet
        assert out.json['current_id'] == out.json['highest_observed_id'] + 1
        # now let's set the id counter to ten
        out = self.api.put('/api/v1/work/ids',
                           {'next_id': 10},
                           headers=headers)
        assert out.json['current_id'] == 10
        assert out.json['highest_observed_id'] == id_count
        # let's fetch the current sequence, just to be sure
        self.api.get('/api/v1/work/ids',
                     headers=headers).json['current_id'] == 10
        # if the id sequence is set to a number lower then the
        # highest observed id, an error is raised
        out = self.api.put('/api/v1/work/ids',
                           {'next_id': 0},
                           headers=headers,
                           status=400)
        assert out.json['errors'][0]['name'] == 'next_id'
