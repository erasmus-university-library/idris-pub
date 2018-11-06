import time
import datetime

import requests
from requests.exceptions import RequestException
from requests.packages.urllib3.util.retry import Retry
from requests.adapters import HTTPAdapter

from zope.interface import implementer
from idris.interfaces import IDataLookupService

class LookupError(Exception):
    pass

@implementer(IDataLookupService)
class CrossRefLookup(object):
    id = 'crossref'
    name = 'CrossRef DOI'
    supported_kind = 'work'
    query_param_name = 'doi'

    def __init__(self, settings):
        self.settings = settings
        self.base_url = 'https://api.crossref.org/works/%s'
        assert ('email' in self.settings) , 'missing idris.lookup.crossref.email'

    def query(self, doi):
        url = self.base_url % doi
        headers = {
            'User-Agent': ('Idris-Pub (https://idris.pub; mailto:%s) '
                           'based on Python/Requests %s' % (
                               self.settings['email'],
                               requests.__version__))}
        session = requests.Session()
        retries = Retry(total=3,
                        backoff_factor=0.3,
                        status_forcelist=[500, 502, 503, 504])
        session.mount('https://', HTTPAdapter(max_retries=retries))
        try:
            response = session.get(url, headers=headers, timeout=5)
        except RequestException as err:
            raise LookupError(
                'Crossref Lookup returned error %s for doi %s' % (
                    err, doi))
        if response.status_code == 404:
            return None
        if not response.status_code == 200:
            raise LookupError(
                'Crossref Lookup returned error %s for doi %s' % (
                    response.status_code, doi))
        rate_limit = response.headers.get('X-Rate-Limit-Limit')
        rate_interval = response.headers.get('X-Rate-Limit-Interval')
        if (rate_limit and
            rate_limit.isdigit() and
            rate_interval and
            rate_interval.endswith('s') and
            rate_interval[:-1].isdigit()):
            sleep_for = float(rate_interval[:-1]) / float(rate_limit)
            if sleep_for < 2:
                time.sleep(sleep_for)
            else:
                time.sleep(2)
        data = response.json()
        if data.get('status') != 'ok':
            raise LookupError(
                'Crossref Lookup returned status %s for doi %s' % (
                    data.get('status'), doi))
        data = data['message']
        return self.crossref2idris(data)

    def crossref2idris(self, data):
        result = {'type': data['type'],
                  'identifiers': [dict(type='doi', value=data['DOI'])]
        }
        issued = data['issued']['date-parts'][0]
        while len(issued) < 3:
            issued.append(1)
        result['issued'] = datetime.date(*issued)

        for title in data.get('title', []):
            result['title'] = title
            break
        for subtitle in data.get('subtitle', []):
            result['title'] = '%s: %s' % (result.get('title', ''),
                                          subtitle)
            break
        for author in data.get('author', []):
            label = '%s, %s' % (author.get('family'),
                                author.get('given'))
            contributor = {
                'role': 'author',
                'description': label,
                'person_info': {'given_name': author.get('given'),
                                'family_name': author.get('family'),
                                'initials': author.get('initials')}}
            affiliation_info = []
            for aff in author.get('affiliation'):
                affiliation_info.append({'international_name': aff})
            if affiliation_info:
                contributor['affiliaiton_info'] = affiliation_info
            result.setdefault('contributors', []).append(contributor)

            if data['type'] == 'journal-article':
                if '-' in data.get('page'):
                    start_page, end_page = data['page'].split('-', 1)
                else:
                    start_page = data.get('page')

                relation = {'type': 'journal',
                            'description': data['container-title'][0],
                            'start_page': start_page,
                            'end_page': end_page,
                            'volume': data.get('volume'),
                            'issue': data.get('issue')}
                journal = {'title': data['container-title'][0],
                           'type': 'journal'}
                if data.get('ISSN'):
                    if len(data['ISSN']) == 2:
                        issn, essn = data['ISSN']
                    else:
                        issn = data['ISSN']
                        essn = None

                    journal.setdefault(
                        'identifiers', []).append(dict(type='issn',
                                                       value=issn))
                    if essn:
                        journal.setdefault(
                            'identifiers', []).append(dict(type='essn',
                                                           value=essn))
                if data.get('publisher'):
                    journal['contributors'] = [{
                        'type': 'publisher',
                        'description': data['publisher'],
                        'group_info': {'international_name': data['publisher'],
                                       'type': 'publisher'}}]
                relation['work_info'] = journal
                result.setdefault('relations', []).append(relation)
        return result

def lookup_services(registry):
    return registry.getAllUtilitiesRegisteredFor(IDataLookupService)


def lookup_factory(registry, service_id):
    LookupImpl = registry.queryUtility(IDataLookupService, service_id)
    settings = {}
    settings_prefix = 'idris.lookup.%s.' % service_id
    for key in registry.settings:
        if key.startswith(settings_prefix):
            settings[
                key[len(settings_prefix):]] = registry.settings[key]
    return LookupImpl(settings)


def includeme(config):
    config.registry.registerUtility(
        CrossRefLookup, IDataLookupService, CrossRefLookup.id)
