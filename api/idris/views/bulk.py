class BaseBulk(object):
    def post(self):

        # Get existing resources from submitted bulk.
        keys = [r['id'] for r in self.request.validated['records']
                if r.get('id')]
        existing_records = {
            r.id: r for r in self.request.context.get_many(keys) if r}
        models = []
        for record in self.request.validated['records']:
            if record['id'] in existing_records:
                model = existing_records[record['id']]
                model.update_dict(record)
            else:
                model = self.request.context.orm_class.from_dict(record)
            models.append(model)
        models = self.request.context.put_many(models)
        self.request.response.status = 201
        return {'status': 'ok'}

    def get(self):
        cursor = self.request.validated['querystring']['cursor']
        limit = self.request.validated['querystring']['limit']
        listing = self.request.context.search(
            filters=[self.obj.id >= cursor],
            order_by=self.obj.id,
            limit=limit+1,
            principals=self.request.effective_principals)

        if len(listing['hits']) > limit:
            cursor = listing['hits'][-1].id
            listing['hits'].pop()
        else:
            cursor = None

        result = {'remaining': listing['total']-len(listing['hits']),
                  'records': [self.obj_schema.to_json(record.to_dict())
                              for record in listing['hits']],
                  'limit': limit,
                  'cursor': cursor,
                  'status': 'ok'}
        return result
