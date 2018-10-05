from graphene import Field, Int, ObjectType, relay

from .cells import content_to_cell, CellConnection

from . import NBFormat
from .metadata import NotebookMetadata, content_to_notebook_metadata


def content_to_notebook(content):
    return Notebook(
        nbformat=content["nbformat"],
        nbformat_minor=content["nbformat_minor"],
        cells=[content_to_cell(c) for c in content["cells"]],
        metadata=content_to_notebook_metadata(content["metadata"]),
        _nbformat=content,
    )


class Notebook(ObjectType):
    class Meta:
        interfaces = (NBFormat, relay.Node)

    cells = relay.ConnectionField(CellConnection)
    nbformat = Int()
    nbformat_minor = Int()
    metadata = Field(NotebookMetadata)
