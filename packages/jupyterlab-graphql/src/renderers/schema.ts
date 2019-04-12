import CodeMirror from 'codemirror';
import {Widget} from '@phosphor/widgets';

import * as graphql from 'graphql';

import * as C from '..';
import {GraphQLModel} from '../models';

export class GraphQLSchema extends Widget {
  private _model: GraphQLModel;
  private _editor: CodeMirror.Editor;

  constructor(model: GraphQLModel) {
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
