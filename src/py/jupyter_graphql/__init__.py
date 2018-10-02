from pathlib import Path
from notebook.base.handlers import FileFindHandler


from notebook.utils import url_path_join as ujoin

from .handlers import GraphQLHandler

from .schema import schema


HERE = Path(__file__).parent
TEMPLATES = HERE / "templates"
STATIC = HERE / "static"


def load_jupyter_server_extension(app):
    app.log.info("[graphql] initializing")
    web_app = app.web_app

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
                dict(
                    schema=schema,
                    graphiql=True,
                    nb_app=app,
                    middleware=[app_middleware],
                ),
            ),
            # serve the graphiql assets
            (base("static", "(.*)"), FileFindHandler, dict(path=[STATIC])),
        ],
    )
    app.log.info("[graphql] initialized!")
