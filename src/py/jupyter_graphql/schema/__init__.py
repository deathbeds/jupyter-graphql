from graphene import ObjectType, Schema, String, relay

from . import contents


class Query(contents.Query, ObjectType):
    thrower = String(required=True)
    request = String(required=True)
    test = String(who=String())
    node = relay.Node.Field()

    def resolve_thrower(self, info):
        raise Exception("Throws!")

    def resolve_request(self, info):
        return info.context.arguments["q"][0]

    async def resolve_test(self, info, who="World"):
        return f"""Hello {who}"""


schema = Schema(query=Query)
