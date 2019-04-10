import {ILayoutRestorer, JupyterLab, JupyterLabPlugin} from '@jupyterlab/application';

import './mode';
import '../style/index.css';

import {InstanceTracker, MainAreaWidget} from '@jupyterlab/apputils';

import {IDocumentWidget} from '@jupyterlab/docregistry';

import {GraphQLFactory, GraphQLEditor} from './renderer';
import {GraphQLSchema} from './renderers/schema';
import {GraphQLDocs} from './renderers/docs';
import {GraphQLManager} from './manager';

import {PLUGIN_ID as id, FACTORY_GRAPHQL, TYPES, CMD, CSS, IGraphQLManager} from '.';

const graphqlPlugin: JupyterLabPlugin<IGraphQLManager> = {
  activate: activateGraphql,
  id,
  requires: [ILayoutRestorer],
  provides: IGraphQLManager,
  autoStart: true,
};

function activateGraphql(app: JupyterLab, restorer: ILayoutRestorer): IGraphQLManager {
  const {commands, shell} = app;
  const manager = new GraphQLManager();
  const factory = new GraphQLFactory({
    name: FACTORY_GRAPHQL,
    fileTypes: ['graphql'],
    defaultFor: ['graphql'],
    commands,
    manager
  });
  const tracker = new InstanceTracker<IDocumentWidget<GraphQLEditor>>({
    namespace: 'graphql',
  });

  restorer.restore(tracker, {
    command: 'docmanager:open',
    args: (widget) => ({path: widget.context.path, factory: FACTORY_GRAPHQL}),
    name: (widget) => widget.context.path,
  });

  for (let type of Object.keys(TYPES)) {
    app.docRegistry.addFileType((TYPES as any)[type]);
  }

  app.docRegistry.addWidgetFactory(factory);
  let ft = app.docRegistry.getFileType('graphql');
  factory.widgetCreated.connect((_, widget) => {
    tracker.add(widget);
    widget.context.pathChanged.connect(() => {
      tracker.save(widget);
    });

    if (ft) {
      widget.title.iconClass = ft.iconClass;
      widget.title.iconLabel = ft.iconLabel;
    }
  });

  commands.addCommand(CMD.GQL_DOCS, {
    execute: (args) => {
      const {model} = args;
      const content = new GraphQLDocs(model as any);
      const widget = new MainAreaWidget({content});
      widget.title.iconClass = CSS.ICON;
      widget.title.label = 'Docs';
      shell.addToMainArea(widget, {mode: 'split-right'});
    }
  });

  commands.addCommand(CMD.GQL_SCHEMA, {
    execute: (args) => {
      const {model} = args;
      const content = new GraphQLSchema(model as any);
      const widget = new MainAreaWidget({content});
      widget.title.iconClass = CSS.ICON;
      widget.title.label = 'Schema';
      shell.addToMainArea(widget, {mode: 'split-right'});
    }
  });

  return manager;
}

const plugins: JupyterLabPlugin<any>[] = [graphqlPlugin];
export default plugins;
