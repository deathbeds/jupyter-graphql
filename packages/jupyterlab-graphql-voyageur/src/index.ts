export const PLUGIN_NS = '@deathbeds/jupyterlab-graphql-voyageur';
export const PLUGIN_ID = `${PLUGIN_NS}:plugin`;

export {makeVoyageur} from './_voyageur';

export const CSS = {
  ICON: 'jp-GraphQLVoyageur-Icon',
  DOC: 'jp-GraphQLVoyageur',
};

export const CMD = {
  VOYAGE: 'graphql-voyager:show',
};
