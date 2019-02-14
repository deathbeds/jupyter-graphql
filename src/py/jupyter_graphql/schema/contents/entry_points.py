import entrypoints
from functools import partial

CELL_METADATA_ENTRY_POINT = "jupyter_graphql_schema.CellMetaData"


def _load_bases(entry_point):
    for ep in sorted(entrypoints.get_group_all(entry_point)):
        yield ep.load()


load_cell_metadata_bases = partial(_load_bases, CELL_METADATA_ENTRY_POINT)
