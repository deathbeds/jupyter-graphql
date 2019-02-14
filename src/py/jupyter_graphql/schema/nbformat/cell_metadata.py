import graphene as G

from ..utils import load_bases


CELL_METADATA_ENTRY_POINT = "jupyter_graphql_schema.CellMetaData"


load_cell_metadata_bases = load_bases(CELL_METADATA_ENTRY_POINT)


class CellMetaData(*load_cell_metadata_bases(), G.Interface):
    name = G.String()
    tags = G.List(G.NonNull(G.String))


# Official Jupyter Metadata


class HideableSource(G.Interface):
    source_hidden = G.Boolean()


class HideableOutputs(G.Interface):
    outputs_hidden = G.Boolean()


class CodeCellJupyterMetaData(G.ObjectType):
    class Meta:
        interfaces = (HideableSource, HideableOutputs)


class RawCellJupyterMetaData(G.ObjectType):
    class Meta:
        interfaces = (HideableSource,)


class MarkdownCellJupyterMetaData(G.ObjectType):
    class Meta:
        interfaces = (HideableSource,)


# Cell Metadata


class CodeCellMetaData(G.ObjectType):
    class Meta:
        interfaces = (CellMetaData,)

    collapsed = G.Boolean()
    scrolled = G.Boolean()
    jupyter = G.Field(CodeCellJupyterMetaData)


class RawCellMetaData(G.ObjectType):
    class Meta:
        interfaces = (CellMetaData,)

    format = G.String()
    jupyter = G.Field(RawCellJupyterMetaData)


class MarkdownCellMetaData(G.ObjectType):
    class Meta:
        interfaces = (CellMetaData,)

    jupyter = G.Field(MarkdownCellJupyterMetaData)
