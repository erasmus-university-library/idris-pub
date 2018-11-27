import os
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

    def test_course_material_download(self):
        teacher_token = self.admin_token(
            on_behalf_of=['group:teacher',
                          'user:x',
                          'teacher:course:%s' % self.course_id])
        headers = dict(Authorization='Bearer %s' % teacher_token)
        content = open(os.path.join(os.path.dirname(__file__),
                                    'blobs',
                                    'test.pdf'), 'rb').read()

        out = self.api.post_json('/api/v1/blob/records',
                                 {'name': 'test.pdf',
                                  'bytes': len(content),
                                  'format': 'application/pdf'},
                                 headers=headers,
                                 status=201)
        blob_id = out.json['id']
        upload_url = out.json['upload_url']
        upload_headers = headers.copy()
        upload_headers['Content-Length'] = str(len(content))
        upload_headers['Content-Type'] = 'application/pdf'
        out = self.api.put(upload_url,
                           content,
                           headers=upload_headers,
                           status=200)
        out = self.api.put('/api/v1/blob/records/%s' % blob_id,
                           headers=headers,
                           status=200)
        # now, let's add this material to a course
        new_material = {'title': 'Yet another article',
                        'authors': 'Erasmus University',
                        'type': 'article',
                        'blob_id': blob_id,
                        'year': '2018'}
        out = self.api.post_json(
            '/api/v1/course/records/%s/materials' % self.course_id,
            {'material': new_material},
            headers=headers)
        assert out.status_code == 201
        material_id = out.json['material']['id']
        # now we can download the material as a teacher
        out = self.api.get(
            '/course/%s/material/%s' % (self.course_id, material_id),
            headers=headers)
        assert out.content_type == 'application/pdf'
        assert out.body[:10] == b'%PDF-1.4\n%'
        # note that without the authorization header it is forbidden
        self.api.get(
            '/course/%s/material/%s' % (self.course_id, material_id),
            status=401)
        # we can also pass the token as a cookie
        # which makes more sense, since this is not an api call
        headers={'Cookie': 'token=%s; Path=/' % teacher_token}
        self.api.get(
            '/course/%s/material/%s' % (
                self.course_id, material_id),
            headers=headers,
            status=200)
        # a student is also allowed to download files
        student_token = self.admin_token(
            on_behalf_of=['group:student',
                          'user:x',
                          'student:course:%s' % self.course_id])
        headers={'Cookie': 'token=%s; Path=/' % student_token}
        self.api.get(
            '/course/%s/material/%s' % (
                self.course_id, material_id),
            headers=headers,
            status=200)
