import React from 'react';
import {VDomRenderer} from '@jupyterlab/apputils';
import {PageConfig} from '@jupyterlab/coreutils';
import {CommandRegistry} from '@phosphor/commands';

const DEFAULT_GRAPHQL_URL = `${PageConfig.getBaseUrl()}graphql`;

import * as C from '..';
import {GraphQLDocumentWidget} from '../renderer';

const h = React.createElement;

export class GraphQLURL extends VDomRenderer<GraphQLDocumentWidget.Model> {
  private _commands: CommandRegistry;

  constructor(model: GraphQLDocumentWidget.Model, commands: CommandRegistry) {
    super();
    this._commands = commands;
    this.model = model;
    this.addClass(C.CSS.URL);
  }

  render() {
    if (!this.model) {
      return null;
    }

    let handlers = {
      Schema: C.CMD.GQL_SCHEMA,
      Docs: C.CMD.GQL_DOCS,
      ...this.model.manager.docToolbarItems(),
    } as {[key: string]: string};

    return h(
      'div',
      {},
      h('input', {
        placeholder: 'GraphQL URL',
        onChange: this.handleUrlChange,
        spellCheck: false,
        defaultValue: this.model.url || DEFAULT_GRAPHQL_URL,
      }),
      Object.keys(handlers).map((key) => {
        return h(
          'button',
          {
            key,
            onClick: () => {
              this._commands.execute(handlers[key], {model: this.model as any});
            },
          },
          key
        );
      }),
      h(
        'label',
        {},
        this.model.requestDuration ? `${this.model.requestDuration} ms` : '~'
      )
    );
  }

  handleUrlChange = (evt: Event) => {
    this.model.url = (evt.target as HTMLInputElement).value;
  };
}