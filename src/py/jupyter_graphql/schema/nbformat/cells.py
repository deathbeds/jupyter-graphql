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
        return CodeCell(**icell, cell_type=CellType.code)
    elif cell_type == "markdown":
        return MarkdownCell(**icell, cell_type=CellType.markdown)
    elif cell_type == "raw":
        return MarkdownCell(**icell, cell_type=CellType.raw)


class CellType(Enum):
    code = "code"
    markdown = "markdown"
    raw = "raw"


class Cell(Interface):
    source = String()
    cell_type = Field(CellType)


class CodeCell(ObjectType):
    class Meta:
        interfaces = (Cell, relay.Node)


class MarkdownCell(ObjectType):
    class Meta:
        interfaces = (Cell, relay.Node)


class RawCell(ObjectType):
    class Meta:
        interfaces = (Cell, relay.Node)


class AnyCell(Union):
    class Meta:
        types = (CodeCell, MarkdownCell, RawCell)


class CellConnection(relay.Connection):
    class Meta:
        node = AnyCell
