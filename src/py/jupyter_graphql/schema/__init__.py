from graphene import ObjectType, Schema, relay

from . import contents


class Query(contents.Query, ObjectType):
    node = relay.Node.Field()


schema = Schema(query=Query, auto_camelcase=False)
