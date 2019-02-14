def CM(info):
    app = info.context["_app"] if isinstance(info.context, dict) else info.context._app
    return app.contents_manager


def RESOLVE_CONTENT(it, info):
    return it["content"] or CM(info).get(it["path"])["content"]
