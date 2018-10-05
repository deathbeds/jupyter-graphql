from graphene import Field, ObjectType, relay, String, List

from . import NBFormat, Named, Nameable


def content_to_notebook_metadata(content):
    return NotebookMetadata(
        kernelspec=content_to_kernelspec(content["kernelspec"]),
        language_info=content_to_language_info(content["language_info"]),
        _nbformat=content,
        authors=content_to_authors(content.get("authors")),
    )


def content_to_kernelspec(content):
    return KernelSpecMeta(
        name=content["name"], display_name=content["display_name"], _nbformat=content
    )


def content_to_language_info(content):
    return LanguageInfoMeta(
        name=content["name"],
        file_extension=content.get("file_extension"),
        mimetype=content.get("mimetype"),
        pygments_lexer=content.get("pygments_lexer"),
        codemirror_mode=content_to_codemirror_mode(content.get("codemirror_mode")),
        _nbformat=content,
    )


def content_to_codemirror_mode(content):
    if isinstance(content, str):
        return CodeMirrorMode(name=content, _nbformat=content)
    elif isinstance(content, dict):
        return CodeMirrorMode(name=content.get("name"), _nbformat=content)


def content_to_authors(content):
    return (
        content
        if content is None
        else [Author(name=author.get("name"), _nbformat=content) for author in content]
    )


class KernelSpecMeta(ObjectType):
    class Meta:
        interfaces = (NBFormat, Named, relay.Node)

    display_name = String(required=True)


class CodeMirrorMode(ObjectType):
    class Meta:
        interfaces = (NBFormat, Named, relay.Node)


class LanguageInfoMeta(ObjectType):
    class Meta:
        interfaces = (NBFormat, Named, relay.Node)

    codemirror_mode = Field(CodeMirrorMode)
    file_extension = String()
    mimetype = String()
    pygments_lexer = String()


class Author(ObjectType):
    class Meta:
        interfaces = (NBFormat, Nameable, relay.Node)


class NotebookMetadata(ObjectType):
    class Meta:
        interfaces = (NBFormat, relay.Node)

    kernelspec = Field(KernelSpecMeta)
    language_info = Field(LanguageInfoMeta)
    title = String()
    authors = List(Author)
