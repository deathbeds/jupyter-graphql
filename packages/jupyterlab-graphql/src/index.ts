export const PLUGIN_NS = '@deathbeds/jupyterlab-graphql';
export const PLUGIN_ID = `${PLUGIN_NS}:plugin`;
export const MIME_ID_TMPL = `${PLUGIN_NS}:mime:`;

export const MIME_GRAPHQL = 'application/graphql';
export const FACTORY_GRAPHQL = 'GraphQLExplorer';

export const CMD = {
  NEW_DOC: 'docmanager:new-untitled',
  OPEN_DOC: 'docmanager:open',
  NEW_GV: 'graphviz:new-untitled',
  GQL_DOCS: 'graphql:docs',
  GQL_SCHEMA: 'graphql:schema'
};

export const CSS = {
  ICON: 'jp-GraphQLIcon',
  DOC: 'jp-GraphQL',
  URL: 'jp-GraphQL-URL',
  EDIT: 'jp-GraphQL-Editor',
  POP: 'jp-GraphQL-PopIcon',
  SCHEMA: 'jp-GraphQL-Schema',
  DOCS: 'jp-GraphQL-Docs'
};

export const TYPES = {
  [MIME_GRAPHQL]: {
    name: 'graphql',
    mimeTypes: [MIME_GRAPHQL],
    extensions: ['.graphql'],
    iconClass: CSS.ICON,
  },
};
