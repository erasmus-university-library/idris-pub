import os
import json
import codecs
import binascii
from infinity import is_infinite

import colander
from cornice.validators import colander_validator, colander_body_validator


class JsonString(colander.String):
    def deserialize(self, node, cstruct):
        if isinstance(cstruct, str):
            try:
                cstruct = json.loads(cstruct)
            except json.decoder.JSONDecodeError:
                raise colander.Invalid(node, '%r is not valid json' % cstruct)
        return cstruct

    def serialize(self, node, appstruct):
        if appstruct is colander.null:
            return colander.null
        return json.dumps(appstruct)

class Base64String(colander.String):
    def deserialize(self, node, cstruct):
        if isinstance(cstruct, str):
            try:
                codecs.decode(cstruct.encode('utf8'), 'base64')
            except binascii.Error:
                raise colander.Invalid(node, '%r is not valid base64' % cstruct)
        return cstruct


def parse_duration(duration, format=None):
    start_date = duration.lower
    end_date = duration.upper
    if is_infinite(start_date):
        start_date = None
    elif format is not None:
        start_date = start_date.strftime(format)
    if is_infinite(end_date):
        end_date = None
    elif format is not None:
        end_date = end_date.strftime(format)
    return start_date, end_date

OKStatus = colander.SchemaNode(colander.String(),
                               validator=colander.OneOf(['ok']))
ErrorStatus = colander.SchemaNode(colander.String(),
                                  validator=colander.OneOf(['error']))


WEBINDEXTEMPLATES = {}

def load_web_index_template(filename='index.html', config=None):
    """Loads/Caches the index.html file from the dist/web
    directory, and rewrites the asset paths to the /static dir.

    Note that this is only updated on server startup.
    """
    html = WEBINDEXTEMPLATES.get(filename)
    if html is None:
        dir_name = os.path.join(os.path.dirname(__file__),
                                'static',
                                'dist',
                                'web')
        manifest = json.load(open(os.path.join(dir_name, 'manifest.json')))
        with open(os.path.join(dir_name, filename), 'r') as fp:
            html = fp.read()

        for static_file in manifest.values():
            if static_file in html:
                html = html.replace(static_file, '/static/%s' % static_file)
        WEBINDEXTEMPLATES[filename] = html

    start = html.find('CONFIG=')
    if start != -1:
        end = html.find('<', start)
        html = '%sCONFIG=%s;%s' % (html[:start],
                                   json.dumps(config or {}),
                                   html[end:])
    return html


class JsonMappingSchemaSerializerMixin(object):
    def to_json(self, appstruct):
        def json_serialize(key, value, context):
            if key is None:
                node = context
            else:
                node = context.get(key)
                if node is None:
                    raise ValueError('%s has no field "%s"' % (
                        context.__class__, key))
            if isinstance(node.typ, colander.String):
                value = node.serialize(value)
            elif isinstance(node.typ, colander.Sequence):
                new_value = []
                child_node = node.children[0]
                for item in value:
                    new_value.append(json_serialize(None, item, child_node))
                value = new_value
            elif (isinstance(node.typ, colander.Mapping) and
                  getattr(node, 'unknown', 'ignore') == 'preserve'):
                pass
            elif isinstance(node.typ, colander.Mapping):
                cstruct = {}
                for item_key, item_value in value.items():
                    if item_value is None or colander.null:
                        continue
                    cstruct[item_key] = json_serialize(
                        item_key, item_value, node)
                value = cstruct
            elif isinstance(node.typ, colander.Integer):
                value = int(node.serialize(value))
            elif isinstance(node.typ, colander.Date):
                value = node.serialize(value)
            elif isinstance(node.typ, colander.DateTime):
                value = node.serialize(value)
            elif isinstance(node.typ, colander.Boolean):
                value = node.serialize(value) == 'true'
            else:
                raise ValueError('Unsupported type: %s' % node.typ)
            return value

        cstruct = {}
        for key, value in appstruct.items():
            if value is None or colander.null:
                continue
            cstruct[key] = json_serialize(key, value, self)
        return cstruct


class ErrorResponseSchema(colander.MappingSchema):
    @colander.instantiate()
    class body(colander.MappingSchema):
        @colander.instantiate()
        class errors(colander.SequenceSchema):
            @colander.instantiate()
            class error(colander.MappingSchema):
                name = colander.SchemaNode(colander.String())
                description = colander.SchemaNode(colander.String())
                location = colander.SchemaNode(colander.String())
        status = ErrorStatus


class OKStatusResponseSchema(colander.MappingSchema):
    @colander.instantiate()
    class body(colander.MappingSchema):
        status = OKStatus

class StatusResponseSchema(colander.MappingSchema):
    @colander.instantiate()
    class body(colander.MappingSchema):
        status = ErrorStatus

def colander_bound_repository_validator(
    request, schema=None, deserializer=None, **kwargs):
    return colander_bound_repository_body_validator(request,
                                                    schema=schema,
                                                    deserializer=deserializer,
                                                    validator=colander_validator,
                                                    **kwargs)

def colander_bound_repository_body_validator(request,
                                             schema=None,
                                             deserializer=None,
                                             validator=colander_body_validator,
                                             **kwargs):
    if schema:
        schema = schema.bind(repository=request.repository)
    for method in kwargs.get('response_schemas', {}):
        kwargs['response_schemas'][method] = kwargs[
            'response_schemas'][method].bind(repository=request.repository)
    return colander_body_validator(request, schema=schema, **kwargs)
