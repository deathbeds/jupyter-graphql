import React from 'react';
import {VDomRenderer} from '@jupyterlab/apputils';
import {PageConfig} from '@jupyterlab/coreutils';
import {CommandRegistry} from '@phosphor/commands';

const DEFAULT_GRAPHQL_URL = `${PageConfig.getBaseUrl()}graphql`;

import * as C from '..';
import {GraphQLModel} from '../models';

const h = React.createElement;

export class GraphQLURL extends VDomRenderer<GraphQLModel> {
  private _commands: CommandRegistry;

  constructor(model: GraphQLModel, commands: CommandRegistry) {
    super();
    this._commands = commands;
    this.model = model;
    this.addClass(C.CSS.URL);
  }

  render() {
    const m = this.model;

    if (!m) {
      return null;
    }

    let handlers = {
      Schema: C.CMD.GQL_SCHEMA,
      Docs: C.CMD.GQL_DOCS,
      ...m.manager.docToolbarItems(),
    } as {[key: string]: string};

    return h(
      'div',
      {},
      h('input', {
        placeholder: 'GraphQL URL',
        onChange: this.handleUrlChange,
        spellCheck: false,
        defaultValue: m.url || DEFAULT_GRAPHQL_URL,
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
      m.subscribed
        ? h('button', {
            className: `jp-GraphQL-socket jp-GraphQL-socket-${m.socketStatus}`,
            onClick: () => {
              this.model.restartClient();
            },
          })
        : h('label', {}, m.requestDuration ? `${m.requestDuration} ms` : '~')
    );
  }

  handleUrlChange = (evt: Event) => {
    this.model.url = (evt.target as HTMLInputElement).value;
  };
}
