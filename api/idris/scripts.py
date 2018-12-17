import click
import transaction
from idris.tools import (initialize_storage, create_all_repositories,
                         create_single_repository, drop_all_repositories,
                         drop_single_repository, get_idris_schema)


@click.group()
def idris_admin():
    """Command line tool for running idris administration processes."""
    pass


@click.command(name='initialize_db')
@click.argument('config_uri', metavar='<configuration-uri>')
@click.option('-a', '--app_name',
              default='base', help='Create individual repository.')
@click.option('-r', '--repo', help='Create individual repository.')
def initialize_db(config_uri, app_name, repo):
    """Create all or a single idris repository."""
    session, storage = initialize_storage(config_uri)
    if repo:
        create_single_repository(storage, session, app_name, repo)
    else:
        create_all_repositories(storage, session)
    transaction.commit()


@click.command(name='drop_db')
@click.argument('config_uri', metavar='<configuration-uri>')
@click.option('-r', '--repo', help='Drop individual repository.')
def drop_db(config_uri, repo):
    """Drop all or a single idris repository."""
    session, storage = initialize_storage(config_uri)
    if repo:
        drop_single_repository(storage, session, repo)
    else:
        drop_all_repositories(storage, session)
    transaction.commit()


@click.command(name='bigquery_schema')
@click.option(
    '-t', '--type',
    help="The content type of the scheme to be printed "
         "(person, group, or work).")
def bigquery_schema(type):
    """Print the scheme of an idris content type in JSON."""
    get_idris_schema(type)


idris_admin.add_command(initialize_db)
idris_admin.add_command(drop_db)
idris_admin.add_command(bigquery_schema)
