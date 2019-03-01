import os
import json
import logging

from pyramid.view import view_config
from pyramid.httpexceptions import HTTPNotFound

from idris.interfaces import IAppRoot

@view_config(context=IAppRoot, name='debug_log')
def debug_log(request):
    succeeded = request.repository.auditlog.append(
        'debug', 'test', 0, 0, message='this is a test', value='woot')
    if not succeeded:
        if not request.repository.auditlog.has_log('debug'):
            request.repository.auditlog.create_log('debug')
            succeeded = request.repository.auditlog.append(
                'debug', 'test', 0, 0, message='this is a test', value='woot')
    request.response.content_type = 'application/json'
    request.response.write(json.dumps(succeeded).encode('utf8'))
    return request.response

@view_config(context=IAppRoot, name='debug_db')
def debug_db(request):
    pool = request.registry['engine'].pool
    info = ("Pool size: %d  Connections in pool: %d "\
            "Current Overflow: %d Current Checked out "\
            "connections: %d" % (pool.size(),
                                 pool.checkedin(),
                                 pool.overflow(),
                                 pool.checkedout()))

    request.response.content_type = 'text/plain'
    request.response.write(info)
    return request.response

@view_config(context=IAppRoot, name='debug_repo')
def debug_repo(request):
    from idris.storage import REPOSITORY_CONFIG
    request.response.content_type = 'application/json'
    request.response.write(
        json.dumps(
            REPOSITORY_CONFIG.get(request.repository.namespace,
                                  {})).encode('utf8'))
    return request.response
