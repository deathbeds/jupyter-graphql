from graphene import Interface, String
from graphene.types.json import JSONString


class NBFormat(Interface):
    _nbformat = JSONString()


class Named(Interface):
    name = String(required=True)


class Nameable(Interface):
    name = String()
