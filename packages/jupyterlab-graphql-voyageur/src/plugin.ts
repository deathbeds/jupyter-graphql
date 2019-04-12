import {JupyterLab, JupyterLabPlugin} from '@jupyterlab/application';
import {MainAreaWidget} from '@jupyterlab/apputils';

import {IGraphQLManager} from '@deathbeds/jupyterlab-graphql';
import {GraphQLModel} from '@deathbeds/jupyterlab-graphql/lib/models';

import {PLUGIN_ID as id, makeVoyageur, CMD, CSS} from '.';
import '../style/index.css';

const graphqlPlugin: JupyterLabPlugin<void> = {
  activate: (_: JupyterLab, gql: IGraphQLManager): void => {
    const {shell, commands} = _;

    async function makeMainAreaWidget(args: any) {
      let model: GraphQLModel = args.model;
      const {introspection} = model;
      const content = await makeVoyageur({introspection});
      const widget = new MainAreaWidget({content});
      model.referenceChanged.connect(() => {
        content.model.reference = model.reference;
      });
      widget.title.label = 'Voyager';
      widget.title.iconClass = CSS.ICON;
      shell.addToMainArea(widget, {mode: 'split-bottom'});
    }

    commands.addCommand(CMD.VOYAGE, {execute: makeMainAreaWidget});
    gql.registerToolbarItem('Voyager', CMD.VOYAGE);
  },
  requires: [IGraphQLManager],
  autoStart: true,
  id,
};

const plugins: JupyterLabPlugin<any>[] = [graphqlPlugin];
export default plugins;
