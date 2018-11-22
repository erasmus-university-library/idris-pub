from test_course import BaseCourseTest

class CourseAuthorizationWebTest(BaseCourseTest):
    def test_course_view_and_update_permissions(self):
        # retrieve course as admin
        headers = dict(Authorization='Bearer %s' % self.admin_token())
        self.api.get(
            '/api/v1/course/records/%s' % self.course_id,
            headers=headers, status=200)
        # get a token similar to a teacher using lti
        headers = dict(
            Authorization='Bearer %s' % self.admin_token(
                on_behalf_of=['group:teacher',
                              'user:x',
                              'teacher:course:%s' % self.course_id]))
        out = self.api.get(
            '/api/v1/course/records/%s' % self.course_id,
            headers=headers, status=200)
        # update the course title
        course = out.json['course']
        assert course['title'] == 'Course X'
        course['title'] = 'An introduction to X'
        out = self.api.put_json(
            '/api/v1/course/records/%s' % self.course_id,
            {'course': course},
            headers=headers,
            status=200)
        # we can retrieve this course as a student
        headers = dict(
            Authorization='Bearer %s' % self.admin_token(
                on_behalf_of=['user:y', 'student:course:%s' % self.course_id]))
        out = self.api.get(
            '/api/v1/course/records/%s' % self.course_id,
            headers=headers, status=200)
        course = out.json['course']
        assert course['title'] == 'An introduction to X'
        # but we can not change the title as a student
        course['title'] = 'An updated introduction to X'
        self.api.put_json(
            '/api/v1/course/records/%s' % self.course_id,
            {'course': course},
            headers=headers,
            status=403)

    def test_course_view_add_permissions(self):
        headers = dict(
            Authorization='Bearer %s' % self.admin_token(
                on_behalf_of=['group:teacher', 'user:x']))
        new_course = {'title': 'The new Course',
                      'start_date': '2018-11-05',
                      'end_date': '2018-12-31',
                      'group': self.corp_id,
                      'course_id': '1234',
                      'lti_id': '5678'}
        out = self.api.post_json(
            '/api/v1/course/records',
            {'course': new_course},
            headers=headers)
        new_course_id = out.json['course']['id']
        assert out.status_code == 201
        # note that when we view the course, there is no 'teacher:course:xxx'
        # principal, however, because the user_id principal is stored as
        # the last_user_id column, we can still get access
        out = self.api.get(
            '/api/v1/course/records/%s' % new_course_id,
            headers=headers)
        assert out.json['course']['title'] == 'The new Course'
        # now we can also add course materials
        new_material = {'title': 'Yet another article',
                        'authors': 'Erasmus University',
                        'type': 'article',
                        'link': 'https://eur.nl',
                        'year': '2018'}
        out = self.api.post_json(
            '/api/v1/course/records/%s/materials' % new_course_id,
            {'material': new_material},
            headers=headers)
        assert out.status_code == 201
