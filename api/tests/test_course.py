from urllib.parse import quote
from core import BaseTest


class CourseWebTest(BaseTest):
    def setUp(self):
        super(CourseWebTest, self).setUp()
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
                                 {'international_name': 'Faculty X',
                                  'type': 'faculty'},
                                 headers=headers,
                                 status=201)
        self.corp_id = out.json['id']
        out = self.api.post_json('/api/v1/work/records',
                                 {'title': 'Test Publication',
                                  'type': 'article',
                                  'contributors': [
                                      {'role': 'author',
                                       'description': 'John Doe, et al.'}],
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
        out = self.api.post_json(
            '/api/v1/work/records',
            {'title': 'Course X',
             'type': 'course',
             'issued': '2018-02-27',
             'relations': [{'type': 'toc', 'target_id': self.pub_id}],
             'contributors': [{'role': 'publisher',
                               'group_id': self.corp_id}]},
            headers=headers,
            status=201)
        self.course_id = out.json['id']

    def test_course_navigation(self):
        headers = dict(Authorization='Bearer %s' % self.admin_token())
        out = self.api.get('/api/v1/course/nav', headers=headers)
        assert len(out.json) == 1
        assert out.json[0]['name'] == 'Faculty X'
        assert out.json[0]['total'] == 1
        assert out.json[0]['years']['2017-2018'] == 1

    def test_group_course_listing(self):
        headers = dict(Authorization='Bearer %s' % self.admin_token())
        out = self.api.get(
            '/api/v1/course/records?group_id=%s&course_year=%s' % (
                self.corp_id, '2017-2018'),
            headers=headers)
        assert len(out.json) == 1
        assert out.json[0]['title'] == 'Course X'
        assert out.json[0]['code'] is None
        assert out.json[0]['literature'] == 1
        assert out.json[0]['start_date'] == '2018-02-27'

    def test_course_toc_listing(self):
        headers = dict(Authorization='Bearer %s' % self.admin_token())
        out = self.api.get(
            '/api/v1/course/records/%s' % self.course_id,
            headers=headers)
        assert 'course' in out.json and 'toc_items' in out.json
        assert len(out.json['course']['toc']) == 1
        toc_item_id = str(out.json['course']['toc'][0]['id'])
        toc_item = out.json['toc_items'].get(toc_item_id)
        assert toc_item
        assert toc_item['title'] == 'Test Publication'
        assert toc_item['author'] == [{'literal': 'John Doe, et al.'}]

    def test_course_update(self):
        headers = dict(Authorization='Bearer %s' % self.admin_token())
        out = self.api.get(
            '/api/v1/course/records/%s' % self.course_id,
            headers=headers)

        course = out.json['course']
        assert course['title'] == 'Course X'
        assert len(course['toc']) == 1
        assert course['toc'][0]['id'] == 1
        course['title'] = 'An introduction to X'
        out = self.api.put_json(
            '/api/v1/course/records/%s' % self.course_id,
            {'course': course},
            headers=headers)
        course = out.json['course']
        assert course['title'] == 'An introduction to X'
        assert len(course['toc']) == 1
        assert course['toc'][0]['id'] == 1
        # let's do an update without including the toc
        # the toc should be preserved
        del course['toc']
        course['title'] = 'An updated introduction to X'
        out = self.api.put_json(
            '/api/v1/course/records/%s' % self.course_id,
            {'course': course},
            headers=headers)
        course = out.json['course']
        assert course['title'] == 'An updated introduction to X'
        assert len(course['toc']) == 1
        assert course['toc'][0]['id'] == 1
        # now let's clear the toc
        course['toc'] = []
        out = self.api.put_json(
            '/api/v1/course/records/%s' % self.course_id,
            {'course': course},
            headers=headers)
        course = out.json['course']
        assert len(course['toc']) == 0
        # one more test adding two toc items
        course['toc'].append({'module': 'Week 1'})
        course['toc'].append({'target_id': self.pub_id,
                              'comment': 'required reading'})
        out = self.api.put_json(
            '/api/v1/course/records/%s' % self.course_id,
            {'course': course},
            headers=headers)
        course = out.json['course']
        assert len(course['toc']) == 2
        assert course['toc'][0]['module'] == 'Week 1'
        assert course['toc'][1]['target_id'] == self.pub_id
        assert course['toc'][1]['comment'] == 'required reading'

    def test_course_doi_lookup(self):
        headers = dict(Authorization='Bearer %s' % self.admin_token())
        doi = '10.1038/nphys1170'
        out = self.api.get(
            '/api/v1/course/lookup/doi?doi=%s' % quote(doi),
            headers=headers)
        course = out.json['course']
        assert course['title'] == (
            'Measured measurement: Quantum tomography')
        assert course['volume'] == '5'
        assert course['year'] == '2009'
        assert course['issue'] == '1'
        assert course['start_page'] == '11'
        assert course['end_page'] == '12'
        assert course['journal'] == 'Nature Physics'

    def test_course_new(self):
        headers = dict(Authorization='Bearer %s' % self.admin_token())
        new_course = {'title': 'The new Course',
                      'start_date': '2018-11-05',
                      'end_date': '2018-12-31',
                      'group': self.corp_id,
                      'course_id': '1234',
                      'canvas_id': '5678'}
        out = self.api.post_json(
            '/api/v1/course/records',
            {'course': new_course},
            headers=headers)
        assert out.status_code == 201
        course = out.json['course']
        for key, value in new_course.items():
            assert course[key] == value
        course_id = course['id']
        out = self.api.get(
            '/api/v1/course/records?group_id=%s&course_year=2018-2019' % (
                self.corp_id),
            headers=headers)
        assert len([c for c in out.json
                    if c['id'] == course_id]) == 1

    def test_course_new_material(self):
        headers = dict(Authorization='Bearer %s' % self.admin_token())
        new_material = {'title': 'Yet another article',
                        'authors': 'Erasmus University',
                        'type': 'article',
                        'link': 'https://eur.nl',
                        'year': '2018'}
        out = self.api.post_json(
            '/api/v1/course/records/%s/materials' % self.course_id,
            {'material': new_material},
            headers=headers)
        assert out.status_code == 201
        assert 'material' in out.json
        assert out.json['material']['authors'] == 'Erasmus University'
        assert 'csl' in out.json
        assert out.json['csl']['author'] == [{'literal': 'Erasmus University'}]
        assert 'royalties' in out.json
        assert out.json['royalties']['tariff_message'] == 'External URL'
        # it is also possible to simulate this addition by setting a flag
        # this is used in the UI to calculate royalties before adding the
        # material to the course
        out = self.api.post_json(
            '/api/v1/course/records/%s/materials' % self.course_id,
            {'material': new_material, 'dry_run': True},
            headers=headers)
        assert out.status_code == 200
        assert 'royalties' in out.json
        assert out.json['royalties']['tariff_message'] == 'External URL'
