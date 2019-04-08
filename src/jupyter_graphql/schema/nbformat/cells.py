import graphene as G

from .cell_metadata import CodeCellMetaData, MarkdownCellMetaData, RawCellMetaData
from .output import OUTPUT_TYPES, Media, Output


class CellType(G.Enum):
    code = "code"
    markdown = "markdown"
    raw = "raw"


class Cell(G.Interface):
    source = G.String()
    cell_type = G.Field(CellType)

    @classmethod
    def resolve_type(cls, it, info):
        return CELL_TYPES[it["cell_type"]]


class Attachment(G.ObjectType):
    key = G.String()
    data = G.List(Media)

    def resolve_key(it, info):
        return it[0]

    def resolve_data(it, info):
        return it[1].items()


class HasAttachments(G.Interface):
    attachments = G.List(Attachment)

    def resolve_attachments(it, info):
        return it.get("attachments").items()


# The actual Cells


class CodeCell(G.ObjectType):
    class Meta:
        interfaces = (Cell, G.relay.Node)

    metadata = G.Field(CodeCellMetaData, required=True)
    execution_count = G.Int()
    outputs = G.List(Output)


class MarkdownCell(G.ObjectType):
    class Meta:
        interfaces = (Cell, HasAttachments, G.relay.Node)

    metadata = G.Field(MarkdownCellMetaData)


class RawCell(G.ObjectType):
    class Meta:
        interfaces = (Cell, HasAttachments, G.relay.Node)

    metadata = G.Field(RawCellMetaData)


# used to resolve type
CELL_TYPES = dict(code=CodeCell, markdown=MarkdownCell, raw=RawCell)


# A collection of cells


class CellConnection(G.relay.Connection):
    class Meta:
        node = Cell


__types__ = [*CELL_TYPES.values(), *OUTPUT_TYPES.values()]
