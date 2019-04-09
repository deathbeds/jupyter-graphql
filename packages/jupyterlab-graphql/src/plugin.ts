import {ILayoutRestorer, JupyterLab, JupyterLabPlugin} from '@jupyterlab/application';

import './mode';
import '../style/index.css';

import {InstanceTracker, MainAreaWidget} from '@jupyterlab/apputils';

import {IDocumentWidget} from '@jupyterlab/docregistry';

import {GraphQLFactory, GraphQLEditor} from './renderer';
import {GraphQLSchema} from './renderers/schema';
import {GraphQLDocs} from './renderers/docs';

import {PLUGIN_ID as id, FACTORY_GRAPHQL, TYPES, CMD, CSS} from '.';

const graphqlPlugin: JupyterLabPlugin<void> = {
  activate: activateGraphql,
  id,
  requires: [ILayoutRestorer],
  autoStart: true,
};

function activateGraphql(app: JupyterLab, restorer: ILayoutRestorer): void {
  const {commands, shell} = app;
  const factory = new GraphQLFactory({
    name: FACTORY_GRAPHQL,
    fileTypes: ['graphql'],
    defaultFor: ['graphql'],
    commands
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
}

const plugins: JupyterLabPlugin<any>[] = [graphqlPlugin];
export default plugins;
