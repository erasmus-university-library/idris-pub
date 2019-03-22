import sys
import os
import json

from pyramid.paster import get_appsettings
import transaction
import sqlalchemy as sql
import sqlalchemy.dialects.postgresql as postgresql
from sqlalchemy.inspection import inspect

from idris import main
from idris.models import Person, Group, Work


def initialize_storage(config_uri, namespace=None):
    """ Create an app and from the app return a storage registry
    object and an SQLAlchemey session. """
    settings = get_appsettings(config_uri)
    app = main({}, **settings)
    storage = app.registry['storage']
    session = storage.make_session(namespace=namespace)
    return session, storage


def create_all_repositories(storage, session):
    storage.create_all(session)
    print('Creating base "unittest" repository on "unittest.localhost"')
    storage.create_repository(session,
                              'unittest',
                              'unittest.localhost',
                              'base')
    print('Creating base "test" repository on "localhost"')
    storage.create_repository(session, 'test', 'localhost', 'base')
    print('- Adding user "admin" with password "admin"')
    storage.initialize_repository(session, 'test', 'admin', 'admin')


def create_single_repository(storage, session, app_name, repo):
    print('Creating {app} "{repo}" repository on "{repo}.localhost"'.format(
        app=app_name, repo=repo))

    # Why do we pass the app name when we only print it? The real app is
    # 'base' I would have thought it would be the app name. To me it's confusing
    # to pass arguments that don't do anything.
    storage.create_repository(session, repo, '%s.localhost' % repo, 'base')
    storage.initialize_repository(session, repo, 'admin', 'admin')


def drop_all_repositories(storage, session):
    print('Dropping all repositories"')
    storage.drop_all(session)


def drop_single_repository(storage, session, repo):
    print('Dropping "%s" repository on "%s.localhost"' % (repo, repo))
    storage.drop_repository(session, repo)


def initialize_db():  # This makes repositories or a single repository.
    if len(sys.argv) == 1:
        cmd = os.path.basename(sys.argv[0])
        print('usage: %s <config_uri> [schema] [app]\n'
              'example: "%s development.ini test"' % (cmd, cmd))
        sys.exit(1)
    session, storage = initialize_storage(sys.argv[1])
    if len(sys.argv) >= 3:

        # Create an app with a repository.
        repo = sys.argv[2]
        if len(sys.argv) == 4:
            app_name = sys.argv[3]
        else:

            # XXX The app name is only used to print to the console.
            app_name = 'base'
        create_single_repository(storage, session, app_name, repo)
    else:
        create_all_repositories(storage, session)
    transaction.commit()


def drop_db():
    if len(sys.argv) == 1:
        cmd = os.path.basename(sys.argv[0])
        print('usage: %s <config_uri> [schema]\n'
              'example: "%s development.ini test"' % (cmd, cmd))
        sys.exit(1)

    session, storage = initialize_storage(sys.argv[1])
    if len(sys.argv) == 3:
        repo = sys.argv[2]
        drop_single_repository(storage, session, repo)
    else:
        drop_all_repositories(storage, session)
    transaction.commit()


def export_repository():
    if len(sys.argv) == 1:
        cmd = os.path.basename(sys.argv[0])
        print('usage: %s <config_uri> repo_id schema\n'
              'example: "%s development.ini test Person"' % (cmd, cmd))
        sys.exit(1)
    session, storage = initialize_storage(sys.argv[1], sys.argv[2])
    kind = _get_model(sys.argv[3])



def _get_model(kind):
    repository_mapping = {
        'person': Person,
        'group': Group,
        'work': Work}
    model = repository_mapping.get(kind)
    if model is None:
        print('Error: unknown kind: {kind}'.format(kind=kind))
        sys.exit(1)
    return model


def _model2schema(model):
    schema = []
    mapper = inspect(model)
    for column in mapper.columns:
        field = {'name': column.name,
                 'type': 'string'}
        if column.name == 'during':
            schema.append({'name': 'start_date', 'type': 'date'})
            schema.append({'name': 'end_date', 'type': 'date'})
            continue
        elif isinstance(column.type, sql.BigInteger):
            field['type'] = 'integer'
        elif isinstance(column.type, sql.Integer):
            field['type'] = 'integer'
        elif isinstance(column.type, sql.Boolean):
            field['type'] = 'boolean'
        elif isinstance(column.type, sql.Float):
            field['type'] = 'float'
        elif isinstance(column.type, sql.Date):
            field['type'] = 'date'
        elif isinstance(column.type, sql.DateTime):
            field['type'] = 'dateTime'
        elif isinstance(column.type, postgresql.TSVECTOR):
            continue
        schema.append(field)

    for relation in mapper.relationships:
        if relation.info.get('inline_schema') is True:
            field = {'name': relation.key,
                     'type': 'record',
                     'mode': 'repeated',
                     'fields': _model2schema(relation.argument())}
            schema.append(field)
    return schema


def get_idris_schema(kind):
    model = _get_model(kind)
    schema = _model2schema(model)
    schema.append({'name': 'modified', 'type': 'datetime'})
    print(json.dumps(schema))


def bigquery_schema():
    if len(sys.argv) == 1:
        cmd = os.path.basename(sys.argv[0])
        print('usage: %s content_type \n'
              'example: "%s works|persons|groups"' % (cmd, cmd))
        sys.exit(1)
    kind = sys.argv[1]
    get_idris_schema(kind)
