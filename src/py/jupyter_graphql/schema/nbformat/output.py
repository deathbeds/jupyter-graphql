import graphene as G


class Media(G.ObjectType):
    mimetype = G.String()
    data = G.types.json.JSONString()

    def resolve_mimetype(it, info):
        return it[0]

    def resolve_data(it, info):
        return it[1]


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
