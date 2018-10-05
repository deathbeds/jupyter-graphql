import graphene as G
from ..base import IDENTITY


class NBFormat(G.Interface):
    _nbformat, resolve__nbformat = G.types.json.JSONString(), IDENTITY


class Named(G.Interface):
    name = G.String(required=True)


class Nameable(G.Interface):
    name = G.String()
