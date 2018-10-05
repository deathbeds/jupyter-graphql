import graphene as G

from . import contents


class Query(contents.Query, G.ObjectType):
    node = G.relay.Node.Field()


schema = G.Schema(query=Query, auto_camelcase=False, types=contents.__types__)
