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


def content_to_cell(content):
    icell = dict(source=content["source"])

    cell_type = content["cell_type"]

    if cell_type == "code":
        return CodeCell(**icell)
    elif cell_type == "markdown":
        return MarkdownCell(**icell)
    elif cell_type == "raw":
        return MarkdownCell(**icell)


class ICell(Interface):
    source = String()


class CodeCell(ObjectType):
    class Meta:
        interfaces = (ICell, relay.Node)


class MarkdownCell(ObjectType):
    class Meta:
        interfaces = (ICell, relay.Node)


class RawCell(ObjectType):
    class Meta:
        interfaces = (ICell, relay.Node)


class Cell(Union):
    class Meta:
        types = (CodeCell, MarkdownCell, RawCell)


class CellConnection(relay.Connection):
    class Meta:
        node = Cell
