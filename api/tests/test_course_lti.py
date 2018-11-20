from urllib.parse import urlencode
import oauthlib.oauth1
import jwt

from core import BaseTest

class CourseLTIAuthTest(BaseTest):

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

    def test_lti_oauth_request(self):
        # first add some course settings to enable the lti authentication
        headers = dict(Authorization='Bearer %s' % self.admin_token())
        settings = self.api.get('/api/v1/schemes/settings',
                                headers=headers).json
        settings['course_lti_enabled'] = True
        settings['course_lti_redirect_url'] = '/course/'
        settings['course_lti_secret'] = 'sekret'
        self.api.put_json('/api/v1/schemes/settings',
                          settings,
                          headers=headers)
        url = 'https://unittest.localhost/api/v1/auth/lti'
        params = self.generate_lti_request(url, 'foobar-1', 'sekret')
        out = self.api.get('/api/v1/auth/lti?%s' % params)
        assert out.json['status'] == 'ok'
        info = jwt.decode(out.json['token'], verify=False)
        assert 'group:course:staff' in info['principals']
        assert info['sub'] == '008437924c9852377e8994829aaac7a1'
        assert 'owner:course:1' not in info['principals']
        # now let's add a course with resource_link_id
        # and validate again
        out = self.api.post_json('/api/v1/group/records',
                                 {'international_name': 'Faculty X',
                                  'type': 'faculty'},
                                 headers=headers,
                                 status=201)
        corp_id = out.json['id']
        out = self.api.post_json(
            '/api/v1/work/records',
            {'title': 'Course X',
             'type': 'course',
             'issued': '2018-02-27',
             'identifiers': [{'type': 'lti',
                              'value': 'lti-94173d3e79d145fd8ec2e83f15836ac8'}],
             'contributors': [{'role': 'publisher',
                               'group_id': corp_id}]},
            headers=headers,
            status=201)
        course_id = out.json['id']
        out = self.api.get('/api/v1/auth/lti?%s' % params)
        assert out.json['status'] == 'ok'
        info = jwt.decode(out.json['token'], verify=False)
        assert 'owner:course:%s' % course_id in info['principals']
        assert out.status_code == 303
        assert out.headers['Location'] == (
            'http://unittest.localhost/course/?token=%s&embed=true'
            '#/group/1/course/1') % out.json['token']
