from traitlets.config import LoggingConfigurable
import traitlets as T

import entrypoints

import graphene as G
from ._version import __version__
from .subscriptions import TornadoSubscriptionServer
from .constants import ENTRY_POINT


class GraphQLManager(LoggingConfigurable):
    schema = T.Instance(G.Schema)
    subscription_server = T.Instance(TornadoSubscriptionServer)
    graphiql = T.Bool(True)

    @T.default("subscription_server")
    def _default_subscription_server(self):
        return TornadoSubscriptionServer(self.schema)

    @T.default("schema")
    def _default_schema(self):
        queries = []
        subscriptions = []
        mutations = []
        _types = []

        def register(query=None, subscription=None, mutation=None, types=None):
            if query:
                queries.append(query)
            if subscription:
                subscriptions.append(subscription)
            if mutation:
                mutations.append(mutation)
            if types:
                _types.extend(types)

        for ep in sorted(entrypoints.get_group_all(ENTRY_POINT), key=lambda e: e.name):
            self.log.debug("[graphql] loading %s", ep.name)
            ep.load()(register)

        class Query(*queries, G.ObjectType):
            _version = G.String()

            def resolve__version(self, *args, **kwargs):
                return __version__

        class Subscription(*subscriptions, G.ObjectType):
            _version = G.String()

            def resolve__version(self, *args, **kwargs):
                return __version__

        class Mutation(*mutations, G.ObjectType):
            _version = G.String()

            def resolve__version(self, *args, **kwargs):
                return __version__

        return G.Schema(
            query=Query,
            subscription=Subscription,
            mutation=Mutation,
            types=_types,
            auto_camelcase=False,
        )
