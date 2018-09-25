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

    def test_course_listing(self):
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
