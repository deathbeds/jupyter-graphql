from pathlib import Path
from notebook.base.handlers import FileFindHandler

from notebook.utils import url_path_join as ujoin

from .subscriptions import TornadoSubscriptionServer
from .handlers import GraphQLHandler, SubscriptionHandler
from .schema import schema


HERE = Path(__file__).parent
TEMPLATES = HERE / "templates"
STATIC = HERE / "static"


def load_jupyter_server_extension(app):
    app.log.info("[graphql] initializing")
    web_app = app.web_app

    subscription_server = TornadoSubscriptionServer(schema)

    # add our templates
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
                dict(schema=schema, graphiql=True, middleware=[app_middleware]),
            ),
            (
                base("subscriptions"),
                SubscriptionHandler,
                dict(subscription_server=subscription_server, app=app),
            ),
            # serve the graphiql assets
            (base("static", "(.*)"), FileFindHandler, dict(path=[STATIC])),
        ],
    )
    app.log.info("[graphql] initialized!")
