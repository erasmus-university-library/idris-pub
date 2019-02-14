from urllib.parse import urlencode
import oauthlib.oauth1
import jwt

from core import BaseTest

class CourseLTIAuthTest(BaseTest):

    def setUp(self):
        return super(CourseLTIAuthTest, self).setUp(app_name='course')


    def generate_lti_request(self, url, consumer_key, consumer_secret):
        """
        This code generated valid LTI 1.0 basic-lti-launch-request request

        (Parts taken from pylti.tests.test_common)
        """
        params = {'resource_link_id': u'lti-94173d3e79d145fd8ec2e83f15836ac8',
                  'user_id': u'008437924c9852377e8994829aaac7a1',
                  'roles': u'Instructor',
                  'lis_result_sourcedid': u'MITx/ODL_ENG/2014_T1:edge.edx.org-'
                                          u'i4x-MITx-ODL_ENG-lti-'
                                          u'94173d3e79d145fd8ec2e83f15836ac8'
                                          u':008437924c9852377e8994829aaac7a1',
                  'context_id': u'MITx/ODL_ENG/2014_T1',
                  'context_title': u'A test course',
                  'lti_version': u'LTI-1p0',
                  'launch_presentation_return_url': u'',
                  'lis_outcome_service_url': u'https://edge.edx.org/courses/'
                                             u'MITx/ODL_ENG/2014_T1/xblock/'
                                             u'i4x:;_;_MITx;_ODL_ENG;_lti;_'
                                             u'94173d3e79d145fd8ec2e83f1583'
                                             u'6ac8/handler_noauth'
                                             u'/grade_handler',
                  'lti_message_type': u'basic-lti-launch-request'}
        urlparams = urlencode(params)
        client = oauthlib.oauth1.Client(
            consumer_key,
            client_secret=consumer_secret,
            signature_method=oauthlib.oauth1.SIGNATURE_HMAC,
            signature_type=oauthlib.oauth1.SIGNATURE_TYPE_QUERY)

        signature = client.sign("{}?{}".format(url, urlparams))
        return signature[0].split('?', 1)[1]

    def test_lti_config(self):
        out = self.api.get('/lti.xml')
        assert out.content_type == 'application/xml'
        assert '<cartridge_basiclti_link' in out.text


    def test_lti_oauth_request(self):
        # first add some course settings to enable the lti authentication
        headers = dict(Authorization='Bearer %s' % self.admin_token())
        settings = self.api.get('/api/v1/schemes/settings',
                                headers=headers).json
        settings['course_lti_enabled'] = True
        settings['course_lti_secret'] = 'sekret'
        self.api.put_json('/api/v1/schemes/settings',
                          settings,
                          headers=headers)
        # add a group that can be referenced from the consumer_key
        out = self.api.post_json('/api/v1/group/records',
                                 {'international_name': 'Faculty X',
                                  'type': 'faculty'},
                                 headers=headers,
                                 status=201)
        corp_id = out.json['id']
        url = 'http://unittest.localhost/lti'
        params = self.generate_lti_request(
            url, 'foobar-%s' % corp_id, 'sekret')
        out = self.api.get('/lti?%s' % params)
        assert out.json['status'] == 'ok'
        info = jwt.decode(out.json['token'], verify=False)
        assert 'group:teacher' in info['principals']
        assert info['sub'] == '008437924c9852377e8994829aaac7a1'
        # there is not course with this lti context_id, so
        # we get redirected to the course add form of the group
        assert out.headers['Location'] == (
            'http://unittest.localhost/?token=%s&embed=true'
            '&title=A%%20test%%20course&course_id=&lti=MITx/ODL_ENG/2014_T1'
            '#/group/1/add') % out.json['token']

        assert 'teacher:course:1' not in info['principals']
        # now let's add a course with resource_link_id
        # and validate again
        out = self.api.post_json(
            '/api/v1/work/records',
            {'title': 'Course X',
             'type': 'course',
             'issued': '2018-02-27',
             'identifiers': [{'type': 'lti',
                              'value': 'MITx/ODL_ENG/2014_T1'}],
             'contributors': [{'role': 'publisher',
                               'group_id': corp_id}]},
            headers=headers,
            status=201)
        course_id = out.json['id']
        out = self.api.get('/lti?%s' % params)
        assert out.json['status'] == 'ok'
        info = jwt.decode(out.json['token'], verify=False)
        assert 'teacher:course:%s' % course_id in info['principals']
        assert out.status_code == 303
        assert out.headers['Location'] == (
            'http://unittest.localhost/?token=%s&embed=true'
            '#/group/1/course/1') % out.json['token']
        # note that the token is also set as a cookie
        out.json['token'] in out.headers['Set-Cookie']

    def test_lti_oauth_to_non_existing_group(self):
        # first add some course settings to enable the lti authentication
        headers = dict(Authorization='Bearer %s' % self.admin_token())
        settings = self.api.get('/api/v1/schemes/settings',
                                headers=headers).json
        settings['course_lti_secret'] = 'sekret'
        self.api.put_json('/api/v1/schemes/settings',
                          settings,
                          headers=headers)
        url = 'http://unittest.localhost/lti'
        params = self.generate_lti_request(url, 'foo', 'sekret')
        # since the consumer_key 'foo' is not valid, and does not
        # point to an existing group in the db, a 404 is returned
        self.api.get('/lti?%s' % params, status=404)
