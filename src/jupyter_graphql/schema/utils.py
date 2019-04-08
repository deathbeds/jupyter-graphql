import entrypoints


def load_bases(entry_point):
    def _load():
        for ep in entrypoints.get_group_all(entry_point):
            yield ep.load()

    return _load


def GET(attr):
    return lambda it, info: it.get(attr)


def IDENTITY(it, info):
    return it
