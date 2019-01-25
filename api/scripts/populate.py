import re
import sys
import json
import requests

BASE_URL = 'http://localhost:6543/api/v1'

SETTINGS = {'title': 'Test Repository'}

IDS = {'group': set(),
       'person': set(),
       'work': set()}

def login(user, password):
    response = requests.post(BASE_URL + '/auth/login',
                             json.dumps({'user': user, 'password': password}),
                             headers={'Content-Type': 'application/json'})

    token = response.json()['token']
    return token


def update_settings(token, settings):
    print 'Update Settings: %s' % settings['title']

    response = requests.put(BASE_URL + '/schemes/settings',
                            json.dumps(settings),
                            headers={'Content-Type': 'application/json',
                                     'Authorization': 'Bearer %s' % token})

    assert response.status_code == 200

def get_types(token, scheme):
    response = requests.get(BASE_URL + '/schemes/types/%s' % scheme,
                            headers={'Authorization': 'Bearer %s' % token})
    result = {}
    for item in response.json()['values']:
        result[item['key']] = item['label']
    return result

def set_types(token, scheme, values):
    print 'Setting Types: %s' % scheme
    response = requests.put(BASE_URL + '/schemes/types/%s' % scheme,
                            json.dumps({'id': scheme, 'values': values}),
                            headers={'Content-Type': 'application/json',
                                     'Authorization': 'Bearer %s' % token})
    assert response.status_code == 200



def fix_dates(data):
    for org in data['records']:
        if org['start_date'] and org['end_date']:
            if org['end_date'] < org['start_date']:
                org['start_date'], org['end_date'] = (org['end_date'],
                                                      org['start_date'])
    return data

def un_camel_case(text):
    return re.sub('([a-z0-9])([A-Z])',
                  r'\1_\2', re.sub('(.)([A-Z][a-z]+)', r'\1 \2', text))



def upload(token, data, kind):
    total = len(data)
    fmt_string = '%%0.%sd/%%s Uploading %s records..\r' % (len(str(total)), kind)

    for start in range(0, len(data), 500):
        chunk = data[start: start + 500]
        response = requests.post(BASE_URL + '/%s/bulk' % kind,
                                 json.dumps({'records': chunk}),
                                 headers={'Content-Type': 'application/json',
                                          'Authorization': 'Bearer %s' % token})
        sys.stdout.write(fmt_string % (start, total))
        sys.stdout.flush()
        if not response.status_code == 201:
            print
            print 'Error HTTP %s -> %s' % (response.status_code,
                                           response.content)
            sys.exit(1)
    print

def upload_persons(token, data):
    print '-- Persons'
    account_types = get_types(token, 'personAccount')
    used_account_types = set()
    for person in data:
        IDS['person'].add(person['id'])
        for account in person.get('accounts', []):
            used_account_types.add(account['type'])
    missing_types = used_account_types - set(account_types)
    if missing_types:
        print 'The following person account types are missing: %s' % ', '.join(sorted(missing_types))
        if raw_input('Use these types [y/N]? ') == 'y':
            set_types(token,
                      'personAccount',
                      [{'key': t, 'label': t} for t in missing_types])
    upload(token, data, 'person')

def upload_groups(token, data):
    print '-- Groups'
    account_types = get_types(token, 'groupAccount')
    used_account_types = set()
    child_ids = {}
    group_ids = set([g['id'] for g in data])
    IDS['group'] = group_ids
    for group in data:
        for account in group.get('accounts', []):
            used_account_types.add(account['type'])

        if group.get('parent_id') is not None:
            if group['parent_id'] not in group_ids:
                print 'Warn: Missing Group Parent %s on group %s' % (
                    group['parent_id'], group['id'])
                del group['parent_id']
            else:
                child_ids.setdefault(group['parent_id'], []).append(group['id'])
    missing_types = used_account_types - set(account_types)
    if missing_types:
        print 'The following group account types are missing: %s' % ', '.join(
            sorted(missing_types))
        if raw_input('Use these types [y/N]? ') == 'y':
            set_types(token,
                      'groupAccount',
                      [{'key': t, 'label': t} for t in missing_types])

    def parent_sorter(group):
        if group['id'] in child_ids and group.get('parent_id') is None:
            return 0
        elif group['id'] in child_ids:
            return 1
        elif group.get('parent_id') is not None:
            return 2
        else:
            return 3

    data.sort(key=parent_sorter)
    upload(token, data, 'group')

def upload_blobs(token, data):
    print '-- Blobs'
    upload(token, data, 'blob')

def upload_works(token, data):
    print '-- Works'
    current_types={'identifier': get_types(token, 'identifier'),
                   'relation': get_types(token, 'relation'),
                   'expression': get_types(token, 'expression'),
                   'contributorRole': get_types(token, 'contributorRole'),
                   'work': get_types(token, 'work')}
    used_types = {'identifier': set(),
                  'relation': set(),
                  'expression': set(),
                  'contributorRole': set(),
                  'work': set()}
    work_ids = [w['id'] for w in data]
    IDS['work'] = work_ids
    for work in data:
        used_types['work'].add(work['type'])
        for identifier in work.get('identifiers', []):
            used_types['identifier'].add(identifier['type'])
        for expression in work.get('expressions', []):
            used_types['expression'].add(expression['type'])

        relations = []
        for relation in work.get('relations', []):
            used_types['relation'].add(relation['type'])
            if (relation.get('target_id') and
                relation['target_id'] not in work_ids):
                print 'Warn: Missing Relation %s on work %s' % (
                    relation['target_id'], work['id'])
                continue
            relations.append(relation)
        work['relations'] = relations

        contributors = []
        for contributor in work.get('contributors', []):
            used_types['contributorRole'].add(contributor['role'])
            if (contributor.get('group_id') and
                contributor['group_id'] not in IDS['group']):
                print 'Warn: Missing group Contributor %s on work %s' % (
                    contributor['group_id'], work['id'])
                continue
            if (contributor.get('person_id') and
                contributor['person_id'] not in IDS['person']):
                print 'Warn: Missing person Contributor %s on work %s' % (
                    contributor['person_id'], work['id'])
                continue
            contributors.append(contributor)
        work['contributors'] = contributors



    for type in current_types:
        missing_types = used_types[type] - set(current_types[type])
        if missing_types:
            print 'The following work %s types are missing: %s' % (
                type, ', '.join(sorted(used_types[type])))
            if raw_input('Use these types [y/N]? ') == 'y':
                set_types(token,
                          type,
                          [{'key': t, 'label': t} for t in used_types[type]])
    def relation_sorter(work):
        if len(work.get('relations', [])) == 0:
            return 0
        else:
            return 1

    data.sort(key=relation_sorter)
    upload(token, data, 'work')


if __name__ == '__main__':


    token = login('admin', 'admin')
    update_settings(token, SETTINGS)
    person_data = json.loads(open('idris-persons.json').read())
    upload_persons(token, person_data)
    group_data = json.loads(open('idris-groups.json').read())
    upload_groups(token, group_data)
    blob_data = json.loads(open('idris-blobs.json').read())
    upload_blobs(token, blob_data)
    work_data = json.loads(open('idris-works.json').read())
    upload_works(token, work_data)
