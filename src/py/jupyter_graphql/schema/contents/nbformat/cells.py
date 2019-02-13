import graphene as G


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


class CellMetaData(G.Interface):
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

    def resolve_jupyter(it, info):
        return it.get("jupyter", {})


class RawCellMetaData(G.ObjectType):
    class Meta:
        interfaces = (CellMetaData,)

    format = G.String()
    jupyter = G.Field(RawCellJupyterMetaData)

    def resolve_jupyter(it, info):
        return it.get("jupyter", {})


class MarkdownCellMetaData(G.ObjectType):
    class Meta:
        interfaces = (CellMetaData,)

    jupyter = G.Field(MarkdownCellJupyterMetaData)

    def resolve_jupyter(it, info):
        return it.get("jupyter", {})


class Media(G.ObjectType):
    mimetype = G.String()
    data = G.types.json.JSONString()

    def resolve_mimetype(it, info):
        return it[0]

    def resolve_data(it, info):
        return it[1]


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


# Output


class OutputType(G.Enum):
    execute_result = "execute_result"
    display_data = "display_data"
    stream = "stream"
    error = "error"


class Output(G.Interface):
    output_type = G.Field(OutputType)

    @classmethod
    def resolve_type(cls, it, info):
        return OUTPUT_TYPES[it["output_type"]]


class RichOutput(G.Interface):
    data = G.List(Media)
    metadata = G.types.json.JSONString()

    def resolve_data(it, info):
        return it["data"].items()


class ExecuteResult(G.ObjectType):
    class Meta:
        interfaces = (Output, RichOutput)

    execution_count = G.Int()


class DisplayData(G.ObjectType):
    class Meta:
        interfaces = (Output, RichOutput)


class StreamType(G.Enum):
    stdout = "stdout"
    stderr = "stderr"


class Stream(G.ObjectType):
    class Meta:
        interfaces = (Output,)

    name = G.Field(StreamType)
    text = G.String()


class Error(G.ObjectType):
    class Meta:
        interfaces = (Output,)

    ename = G.String()
    evalue = G.String()
    traceback = G.List(G.String)


OUTPUT_TYPES = dict(
    execute_result=ExecuteResult, display_data=DisplayData, stream=Stream, error=Error
)


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


CELL_TYPES = dict(code=CodeCell, markdown=MarkdownCell, raw=RawCell)


# A collection of cells


class CellConnection(G.relay.Connection):
    class Meta:
        node = Cell


__types__ = [*CELL_TYPES.values(), *OUTPUT_TYPES.values()]
