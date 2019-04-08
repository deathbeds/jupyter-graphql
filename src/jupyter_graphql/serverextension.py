from notebook.base.handlers import FileFindHandler
from notebook.utils import url_path_join as ujoin

from .constants import STATIC, TEMPLATES
from .handlers import GraphQLHandler, SubscriptionHandler
from .manager import GraphQLManager


def load_jupyter_server_extension(app):
    app.log.info("[graphql] initializing")
    web_app = app.web_app

    graphql_manager = GraphQLManager(parent=app)

    web_app.settings["jinja2_env"].loader.searchpath += [TEMPLATES]

    def base(*bits):
        return ujoin(web_app.settings["base_url"], "graphql", *bits)

    def app_middleware(next, root, info, **args):
        setattr(info.context, "_app", app)
        return next(root, info, **args)

    web_app.add_handlers(
        ".*$",
        [
            (
                base(),
                GraphQLHandler,
                dict(
                    schema=graphql_manager.schema,
                    graphiql=graphql_manager.graphiql,
                    middleware=[app_middleware],
                ),
            ),
            (
                base("subscriptions"),
                SubscriptionHandler,
                dict(graphql_manager=graphql_manager),
            ),
            # serve the graphiql assets
            (base("static", "(.*)"), FileFindHandler, dict(path=[STATIC])),
        ],
    )
    app.log.debug("[graphql] initialized!")
