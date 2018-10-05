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
from graphene.types.datetime import DateTime

from .nbformat.notebook import Notebook, content_to_notebook


class ContentType(Enum):
    # {None, 'directory', 'file', 'notebook'}:
    directory = "directory"
    file = "file"
    notebook = "notebook"


def contents_to_node(contents):
    icontents = {
        k: contents.get(k, None)
        for k in [
            "path",
            "name",
            "mimetype",
            "type",
            "writeable",
            "created",
            "last_modified",
            "format",
            "content",
        ]
    }

    content_type = icontents["type"]

    if content_type == "directory":
        return DirectoryContents(**icontents)

    icontents["size"] = contents["size"]

    if content_type == "file":
        return FileContents(**icontents)
    elif content_type == "notebook":
        return NotebookContents(**icontents)


class IContents(Interface):
    path = String()
    name = String()
    mimetype = String()
    type = ContentType()
    writeable = Boolean()
    created = DateTime()
    last_modified = DateTime()
    format = String()


class IFileContents(Interface):
    size = Int()


class DirectoryContents(ObjectType):
    class Meta:
        interfaces = (IContents, relay.Node)

    content = relay.ConnectionField(lambda: ContentsConnection)

    def resolve_content(self, info):
        if self.content:
            return [contents_to_node(c) for c in self.content]
        return []


class NotebookContents(ObjectType):
    class Meta:
        interfaces = (IFileContents, IContents, relay.Node)

    content = Field(Notebook)

    def resolve_content(self, info):
        content = self.content
        if content is None:
            cm = info.context._app.contents_manager
            content = cm.get(self.path)["content"]
        return content_to_notebook(content)


class FileContents(ObjectType):
    class Meta:
        interfaces = (IFileContents, IContents, relay.Node)

    content = String()


class Contents(Union):
    class Meta:
        types = (DirectoryContents, NotebookContents, FileContents)


class ContentsConnection(relay.Connection):
    class Meta:
        node = Contents


class Query(ObjectType):
    contents = Field(Contents, path=String())

    def resolve_contents(self, info, path=""):
        cm = info.context._app.contents_manager
        contents = cm.get(path)
        return contents_to_node(contents)
