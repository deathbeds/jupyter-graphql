import graphene as G

from . import NBFormat, cells
from .metadata import NotebookMetadata


class Notebook(G.ObjectType):
    class Meta:
        interfaces = (NBFormat, G.relay.Node)

    cells = G.relay.ConnectionField(cells.CellConnection)
    nbformat = G.Int()
    nbformat_minor = G.Int()
    metadata = G.Field(NotebookMetadata)


__types__ = cells.__types__ + [Notebook]
