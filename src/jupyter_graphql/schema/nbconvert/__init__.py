import graphene as G
from nbconvert.exporters.base import get_exporter
from nbconvert.exporters.export import get_export_names

from ..contents.base import CM

format_classes = []


def _make_format(name):
    def resolve_output(self, info):
        return self["output"]

    Format = type(
        f"NBConvert{name.title()}",
        (G.ObjectType,),
        {"output": G.String(), "resolve_output": resolve_output},
    )

    def resolve_format(self, info, path):
        exporter = get_exporter(name)()
        model = CM(info).get(path=path)
        try:
            output, resources = exporter.from_notebook_node(
                nb=model["content"], resources={}
            )
        except Exception as err:
            print(err)
        return {"output": output, "resources": resources}

    FormatBase = type(
        f"FormatBase_{name}",
        (),
        {name: G.Field(Format, path=G.String()), f"resolve_{name}": resolve_format},
    )
    return FormatBase


class NBConvert(*[_make_format(name) for name in get_export_names()], G.ObjectType):
    pass


class Query(G.ObjectType):
    nbconvert = G.Field(NBConvert)

    def resolve_nbconvert(self, info):
        return {}


def load_jupyter_graphql(register):
    register(query=Query)
