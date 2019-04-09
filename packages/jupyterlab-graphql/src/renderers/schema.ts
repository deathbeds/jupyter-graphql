import CodeMirror from 'codemirror';
import {Widget} from '@phosphor/widgets';

import * as graphql from 'graphql';

import * as C from '..';
import {GraphQLDocumentWidget} from '../renderer';

export class GraphQLSchema extends Widget {
  private _model: GraphQLDocumentWidget.Model;
  private _editor: CodeMirror.Editor;

  constructor(model: GraphQLDocumentWidget.Model) {
    super();
    this._model = model;
    this.addClass(C.CSS.SCHEMA);

    this._editor = CodeMirror(this.node, this.codemirrorOptions());
    this._model.stateChanged.connect(this.onModelChanged, this);
    setTimeout(() => this.onModelChanged(), 100);
  }

  onModelChanged() {
    this._editor.setValue(graphql.printSchema(this._model.schema));
  }

  codemirrorOptions() {
    return {
      mode: 'graphql',
      theme: 'material',
      gutters: ['CodeMirror-line-numbers', 'CodeMirror-foldgutter'],
      lineNumbers: true,
      lineWrapping: true,
      foldGutter: true,
    };
  }
}
