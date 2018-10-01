class SchemaMixin(object):
    schema = None

    def initialize(self, *args, **kwargs):
        schema = kwargs.pop("schema")
        super(SchemaMixin, self).initialize(*args, **kwargs)
        self.schema = schema
