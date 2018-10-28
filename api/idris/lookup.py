import requests

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
        assert ('email' in self.settings) , 'missing idris.lookup.crossref.email'

    def query(self, query):
        base_url = 'https://api.crossref.org/works/%s' % query
        headers = {
            'User-Agent': ('Idris-Pub (https://idris.pub; mailto:%s) '
                           'based on Python/Requests' % self.settings['email'])}
        response = requests.get(base_url, headers=headers)
        if not response.status_code == 200:
            raise LookupError(
                'Crossref Lookup returned error %s for doi %s' % (
                    response.status_code, query))
        data = response.json()
        if data.get('status') != 'ok':
            raise LookupError(
                'Crossref Lookup returned status %s for doi %s' % (
                    data.get('status'), query))
        data = data['message']
        result = {'type': data['type']}

        for title in data.get('title', []):
            result['title'] = title
            break
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
