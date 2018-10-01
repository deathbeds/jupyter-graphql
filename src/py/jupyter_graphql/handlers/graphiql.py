from notebook.base.handlers import IPythonHandler

from .base import SchemaMixin


class GraphIQLHandler(SchemaMixin, IPythonHandler):
    def get(self):
        self.finish(
            self.render_template(
                "graphiql.html", base_url=self.application.settings["base_url"]
            )
        )
