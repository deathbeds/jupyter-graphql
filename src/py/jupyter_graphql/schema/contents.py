from graphene import Boolean, Enum, Field, Interface, ObjectType, relay, String, Union
from graphene.types.datetime import DateTime


class ContentType(Enum):
    # {None, 'directory', 'file', 'notebook'}:
    NONE = None
    DIRECTORY = "directory"
    FILE = "file"
    NOTEBOOK = "notebook"


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
        ]
    }

    content_type = icontents["type"]

    if content_type == "directory":
        return DirectoryContents(**icontents)
    elif content_type == "file":
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
    # content = String()


class DirectoryContents(ObjectType):
    class Meta:
        interfaces = (IContents, relay.Node)


class NotebookContents(ObjectType):
    class Meta:
        interfaces = (IContents, relay.Node)


class FileContents(ObjectType):
    class Meta:
        interfaces = (IContents, relay.Node)


class Contents(Union):
    class Meta:
        types = (DirectoryContents, NotebookContents, FileContents)


class Query(ObjectType):
    contents = Field(Contents, path=String())

    def resolve_contents(self, info, path=""):
        cm = info.context._app.contents_manager
        contents = cm.get(path)
        return contents_to_node(contents)
