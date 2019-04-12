import {CommandRegistry} from '@phosphor/commands';

import {
  ABCWidgetFactory,
  DocumentRegistry,
  IDocumentWidget,
} from '@jupyterlab/docregistry';

import * as C from '.';
import {GraphQLDocument} from './renderers/document';
import {GraphQLEditor} from './renderers/editor';

export class GraphQLFactory extends ABCWidgetFactory<IDocumentWidget<GraphQLEditor>> {
  private _commands: CommandRegistry;
  private _manager: C.IGraphQLManager;

  constructor(options: GraphQLFactory.IOptions) {
    super(options);
    this._commands = options.commands;
    this._manager = options.manager;
  }
  protected createNewWidget(
    context: DocumentRegistry.Context
  ): IDocumentWidget<GraphQLEditor> {
    return new GraphQLDocument({context, commands: this._commands, manager: this._manager});
  }
}

export namespace GraphQLFactory {
  export interface IOptions extends DocumentRegistry.IWidgetFactoryOptions {
    commands: CommandRegistry;
    manager: C.IGraphQLManager;
  }
}
