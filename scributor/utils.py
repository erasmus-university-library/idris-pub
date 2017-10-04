import colander

OKStatus = colander.SchemaNode(colander.String(),
                               validator=colander.OneOf(['ok']))
ErrorStatus = colander.SchemaNode(colander.String(),
                                  validator=colander.OneOf(['error']))

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

    
class StatusResponseSchema(colander.MappingSchema):
    @colander.instantiate()
    class body(colander.MappingSchema):
        status = ErrorStatus


class PagingInfoSchema(colander.MappingSchema):
    total = colander.SchemaNode(colander.Int())
    size = colander.SchemaNode(colander.Int())
    current = colander.SchemaNode(colander.Int())
    previous = colander.SchemaNode(colander.Int())
    next = colander.SchemaNode(colander.Int())

