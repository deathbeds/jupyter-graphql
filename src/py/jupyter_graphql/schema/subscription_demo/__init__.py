import asyncio
import random

import graphene as G


class RandomType(G.ObjectType):
    seconds = G.Int()
    random_int = G.Int()


class Subscription(G.ObjectType):
    count_seconds = G.Float(up_to=G.Int())
    random_int = G.Field(RandomType)

    async def resolve_count_seconds(root, info, up_to=5):
        for i in range(up_to):
            yield i
            await asyncio.sleep(1.0)
        yield up_to

    async def resolve_random_int(root, info):
        i = 0
        while True:
            yield RandomType(seconds=i, random_int=random.randint(0, 500))
            await asyncio.sleep(1.0)
            i += 1


def load_jupyter_graphql(register):
    register(subscription=Subscription)
