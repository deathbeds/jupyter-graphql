from graphene import (
    Boolean,
    Enum,
    Field,
    Int,
    Interface,
    ObjectType,
    relay,
    String,
    Union,
)

from .cells import content_to_cell, CellConnection


def content_to_nbnode(content):
    return NBFormat(
        nbformat=content["nbformat"],
        nbformat_minor=content["nbformat_minor"],
        cells=[content_to_cell(c) for c in content["cells"]],
    )


class NBFormat(ObjectType):
    class Meta:
        interfaces = (relay.Node,)

    cells = relay.ConnectionField(CellConnection)
    nbformat = Int()
    nbformat_minor = Int()
