import graphene as G

from . import NBFormat, Named, Nameable


class KernelSpecMeta(G.ObjectType):
    class Meta:
        interfaces = (NBFormat, Named, G.relay.Node)

    display_name = G.String(required=True)


class CodeMirrorMode(G.ObjectType):
    class Meta:
        interfaces = (NBFormat, Named, G.relay.Node)


class LanguageInfoMeta(G.ObjectType):
    class Meta:
        interfaces = (NBFormat, Named, G.relay.Node)

    codemirror_mode = G.Field(CodeMirrorMode)
    file_extension = G.String()
    mimetype = G.String()
    pygments_lexer = G.String()

    def resolve_codemirror_mode(it, info):
        mode = it["codemirror_mode"]
        return mode if isinstance(mode, dict) else dict(name=mode)


class Author(G.ObjectType):
    class Meta:
        interfaces = (NBFormat, Nameable, G.relay.Node)


class NotebookMetadata(G.ObjectType):
    class Meta:
        interfaces = (NBFormat, G.relay.Node)

    kernelspec = G.Field(KernelSpecMeta)
    language_info = G.Field(LanguageInfoMeta)
    title = G.String()
    authors = G.List(Author)
