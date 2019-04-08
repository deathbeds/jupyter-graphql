from asyncio import Queue

import graphene as G
import graphene.relay as R
from graphene.types.datetime import DateTime
from tornado import ioloop

from ..nbformat import notebook
from ..utils import GET
from .base import CM, RESOLVE_CONTENT


class ContentType(G.Enum):
    # {None, 'directory', 'file', 'notebook'}:
    directory = "directory"
    file = "file"
    notebook = "notebook"


class Contents(G.Interface):
    # https://github.com/graphql-python/graphene/pull/775
    type_, resolve_type_ = ContentType(), GET("type")

    path, resolve_path = G.String(), GET("path")
    name, resolve_name = G.String(), GET("name")
    mimetype, resolve_mimetype = G.String(), GET("mimetype")

    writable, resolve_writable = G.Boolean(), GET("writable")
    created, resolve_created = DateTime(), GET("created")
    last_modified, resolve_last_modified = DateTime(), GET("last_modified")
    format, resolve_format = G.String(), GET("format")

    @classmethod
    def resolve_type(cls, instance, info):
        return {
            "file": FileContents,
            "notebook": NotebookContents,
            "directory": DirectoryContents,
        }[instance["type"]]


class AnyFileContents(G.Interface):
    size = G.Int()


class DirectoryContents(G.ObjectType):
    class Meta:
        interfaces = (Contents, R.Node)

    content = R.ConnectionField(lambda: ContentsConnection)

    resolve_content = RESOLVE_CONTENT


class NotebookContents(G.ObjectType):
    class Meta:
        interfaces = (AnyFileContents, Contents, R.Node)

    content, resolve_content = G.Field(notebook.Notebook), RESOLVE_CONTENT


class FileContents(G.ObjectType):
    class Meta:
        interfaces = (AnyFileContents, Contents, R.Node)

    content, resolve_content = G.String(), RESOLVE_CONTENT


class ContentsConnection(R.Connection):
    class Meta:
        node = Contents


class Query(G.ObjectType):
    contents = G.Field(Contents, path=G.String())

    def resolve_contents(self, info, path=""):
        return CM(info).get(path)


class Subscription(G.ObjectType):
    contents = G.Field(Contents, path=G.String())

    async def resolve_contents(self, info, path=""):
        queue = Queue()
        await queue.put(CM(info).get(path))

        _old_hook = CM(info).post_save_hook

        async def put(model):
            await queue.put(model)

        def hook(os_path, model, contents_manager):
            if path == model["path"]:
                ioloop.IOLoop.current().spawn_callback(put, model)

            if _old_hook:
                _old_hook(os_path, model, contents_manager)

        CM(info).post_save_hook = hook

        while True:
            yield await queue.get()


__types__ = [NotebookContents, FileContents, DirectoryContents] + notebook.__types__


def load_jupyter_graphql(register):
    register(query=Query, subscription=Subscription, types=__types__)
