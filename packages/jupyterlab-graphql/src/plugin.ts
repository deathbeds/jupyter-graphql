import {ILayoutRestorer, JupyterLab, JupyterLabPlugin} from '@jupyterlab/application';

import './mode';
import '../style/index.css';

import {InstanceTracker} from '@jupyterlab/apputils';

import {IDocumentWidget} from '@jupyterlab/docregistry';

import {GraphQLFactory, GraphQLEditor} from './renderer';

import {PLUGIN_ID as id, FACTORY_GRAPHQL, TYPES} from '.';

const graphql: JupyterLabPlugin<void> = {
  activate: activateGraphql,
  id,
  requires: [ILayoutRestorer],
  autoStart: true,
};

function activateGraphql(app: JupyterLab, restorer: ILayoutRestorer): void {
  const factory = new GraphQLFactory({
    name: FACTORY_GRAPHQL,
    fileTypes: ['graphql'],
    defaultFor: ['graphql'],
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
}

const plugins: JupyterLabPlugin<any>[] = [graphql];
export default plugins;
