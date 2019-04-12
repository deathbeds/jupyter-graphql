import CodeMirror from 'codemirror';
import {PageConfig} from '@jupyterlab/coreutils';
import {CommandRegistry} from '@phosphor/commands';

import {DocumentRegistry, DocumentWidget} from '@jupyterlab/docregistry';

import * as C from '..';
import {GraphQLModel} from '../models';
import {GraphQLURL} from './url';
import {GraphQLEditor} from './editor';

const DEFAULT_GRAPHQL_URL = `${PageConfig.getBaseUrl()}graphql`;

export class GraphQLDocument extends DocumentWidget<GraphQLEditor> {
  model: GraphQLModel;
  private _editor: CodeMirror.Editor;
  private _commands: CommandRegistry;

  constructor(options: GraphQLDocument.IOptions) {
    let {content, context, reveal, commands, manager, ...other} = options;
    let model = new GraphQLModel();
    model.manager = manager;
    content = content || Private.createContent(context, model, commands, manager);
    super({content, context, reveal, ...other});
    this.title.iconClass = C.CSS.ICON;
    this.addClass(C.CSS.DOC);
    this._commands = commands;
    this.model = model;
    this.toolbar.addItem('graphql-url', new GraphQLURL(model, this._commands));
    model.url = DEFAULT_GRAPHQL_URL;
  }

  onStateChanged() {
    let schema = this.model.schema;
    if (schema != null) {
      let opts = {schema};
      this._editor.setOption('lint', opts);
      this._editor.setOption('hintOptions', opts);
    }
  }
}

namespace Private {
  export function createContent(
    context: DocumentRegistry.IContext<DocumentRegistry.IModel>,
    model: GraphQLModel,
    commands: CommandRegistry,
    manager: C.IGraphQLManager
  ) {
    return new GraphQLEditor({context, model, commands, manager});
  }
}

export namespace GraphQLDocument {
  export interface IOptions
    extends DocumentWidget.IOptionsOptionalContent<GraphQLEditor> {
    commands: CommandRegistry;
    manager: C.IGraphQLManager;
  }
}
