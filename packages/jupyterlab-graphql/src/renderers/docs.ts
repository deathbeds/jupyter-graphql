import React from 'react';
import {VDomRenderer} from '@jupyterlab/apputils';

import * as graphql from 'graphql';

import * as C from '..';
import {GraphQLModel} from '../models';

const h = React.createElement;

interface IFieldMap {
  [key: string]: graphql.GraphQLNamedType;
}

export class GraphQLDocs extends VDomRenderer<GraphQLModel> {
  constructor(model: GraphQLModel) {
    super();
    this.model = model;
    this.addClass(C.CSS.DOCS);
  }

  render() {
    if (!this.model) {
      return null;
    }

    let qt = this.model.schema.getQueryType();

    return h(
      'div',
      {},
      h(
        'details',
        {},
        h('summary', {}, 'Query'),
        this.renderTypes((qt as any)._fields)
      ),
      h('details', {}, h('summary', {}, 'Types'), this.renderTypes())
    );
  }

  renderTypes(tm?: IFieldMap) {
    tm = tm || this.model.schema.getTypeMap();
    let types: React.ReactElement<any>[] = [];
    let keys = Object.keys(tm);
    keys.sort((a, b) => a.localeCompare(b));
    for (let key of keys) {
      let t = tm[key];
      let fieldMap = (t as any)._fields as IFieldMap;
      types.push(
        h(
          'div',
          {key},
          h('h5', {}, t.name),
          h('blockquote', {}, t.description),
          h('ul', {}, this.renderFields(fieldMap))
        )
      );
    }
    return types;
  }

  renderFields(fieldMap: IFieldMap) {
    if (fieldMap == null) {
      return [];
    }
    let names = Object.keys(fieldMap);
    names.sort((a, b) => a.localeCompare(b));
    let fields: React.ReactElement<any>[] = [];
    for (const key of names) {
      let field = fieldMap[key];
      let args = (field as any).args;
      fields.push(
        h('li', {key}, key, args && args.length ? this.renderArgs(args) : null)
      );
    }
    return fields;
  }

  renderArgs(args: any[]) {
    return h(
      'label',
      {},
      '(',
      args.map((a, i) => {
        return h(
          'span',
          {key: a.name},
          i ? ',' : '',
          a.name,
          (a.type || {}).name || ''
        );
      }),
      ')'
    );
  }
}
