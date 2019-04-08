from asyncio import Queue

from notebook.base.handlers import IPythonHandler

from tornado import websocket, ioloop

from graphene_tornado.tornado_graphql_handler import TornadoGraphQLHandler
from graphql_ws.constants import GRAPHQL_WS


class GraphQLHandler(TornadoGraphQLHandler, IPythonHandler):
    def check_xsrf_cookie(self, *args, **kwargs):
        return True

    def render_graphiql(self, query, variables, operation_name, result):
        return self.render_template(
            "graphiql.html", base_url=self.application.settings["base_url"]
        )


# TODO: use notebook websocket stuff
class SubscriptionHandler(websocket.WebSocketHandler):
    def initialize(self, graphql_manager):
        self.graphql_manager = graphql_manager
        self.queue = Queue(100)

    def select_subprotocol(self, subprotocols):
        return GRAPHQL_WS

    def open(self):
        async def handler():
            await self.graphql_manager.subscription_server.handle(
                self, request_context=dict(_app=self.graphql_manager.parent)
            )

        ioloop.IOLoop.current().spawn_callback(handler)

    async def on_message(self, message):
        await self.queue.put(message)

    async def recv(self):
        return await self.queue.get()
