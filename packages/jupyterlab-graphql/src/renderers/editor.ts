import CodeMirror from 'codemirror';
import {CommandRegistry} from '@phosphor/commands';

import {DocumentRegistry} from '@jupyterlab/docregistry';

import {Widget, SplitPanel, SplitLayout} from '@phosphor/widgets';

import * as C from '..';
import {GraphQLModel} from '../models';

export class GraphQLEditor extends SplitPanel {
  model: GraphQLModel;

  private _editor: CodeMirror.Editor;
  private _results: CodeMirror.Editor;

  _context: DocumentRegistry.Context;
  constructor(options: GraphQLEditor.IOptions) {
    super();
    let {context, model} = options;
    this.model = model;
    this._context = context;

    let editor = this.makeEditor();
    let results = this.makeResultViewer();

    let layout = this.layout as SplitLayout;
    layout.orientation = 'horizontal';

    layout.addWidget(editor);
    layout.addWidget(results);

    this._context.model.contentChanged.connect(this.onContentChanged, this);
    this._editor.on('change', this.onEditorChanged);
    this.model.stateChanged.connect(this.onStateChanged, this);
  }

  onEditorChanged = () => {
    let strVal = this._editor.getValue();
    if (strVal !== this._context.model.toString()) {
      this._context.model.fromString(this._editor.getValue());
      this.model.graphql = strVal;
    }
  };

  onContentChanged() {
    let strVal = this._context.model.toString();
    if (strVal !== this._editor.getValue()) {
      this._editor.setValue(this._context.model.toString());
      this.model.graphql = strVal;
    }
  }

  onStateChanged() {
    let schema = this.model.schema;
    if (schema != null) {
      this._editor.setOption('lint', this.lintOptions(schema));
      this._editor.setOption('hintOptions', this.hintOptions(schema));
      this._editor.setOption('info', this.infoOptions(schema));
      this._editor.setOption('jump', this.jumpOptions(schema));
    }
    this._results.setValue(JSON.stringify(this.model.results || {}, null, 2));
  }

  makeEditor() {
    let widget = new Widget();
    widget.addClass(C.CSS.EDIT);
    this._editor = CodeMirror(widget.node, this.editorOptions() as any);
    return widget;
  }

  makeResultViewer() {
    let widget = new Widget();
    widget.addClass(C.CSS.EDIT);
    this._results = CodeMirror(widget.node, this.resultViewerOptions() as any);
    return widget;
  }

  editorOptions() {
    return {
      mode: 'graphql',
      theme: 'material',
      gutters: [
        'CodeMirror-line-numbers',
        'CodeMirror-lint-markers',
        'CodeMirror-foldgutter',
      ],
      extraKeys: {
        'Cmd-Space': () => (this._editor as any).showHint({completeSingle: true}),
        'Ctrl-Space': () => (this._editor as any).showHint({completeSingle: true}),
        'Alt-Space': () => (this._editor as any).showHint({completeSingle: true}),
        'Shift-Space': () => (this._editor as any).showHint({completeSingle: true}),

        'Ctrl-Left': 'goSubwordLeft',
        'Ctrl-Right': 'goSubwordRight',
        'Alt-Left': 'goGroupLeft',
        'Alt-Right': 'goGroupRight',
      },
      lineNumbers: true,
      lineWrapping: true,
      foldGutter: true,
      autoCloseBrackets: true,
      matchBrackets: true,
      hintOptions: this.hintOptions(null),
      lint: this.lintOptions(null),
      info: this.infoOptions(null),
      jump: this.jumpOptions(null),
    };
  }

  jumpOptions(schema: any) {
    return {
      schema,
      onClick: (reference: any) => {
        this.model.reference = reference;
      },
    };
  }

  infoOptions(schema: any) {
    return {
      schema,
      renderDescription: (text: any) => {
        console.log('description', text);
      },
      onClick: (reference: any) => {
        console.log('info', reference);
      },
    };
  }

  hintOptions(schema: any) {
    return {
      closeOnUnfocus: false,
      completeSingle: false,
      schema,
    };
  }

  lintOptions(schema: any) {
    return {
      closeOnUnfocus: false,
      completeSingle: false,
      schema,
    };
  }

  resultViewerOptions() {
    return {
      mode: 'application/ld+json',
      theme: 'material',
      lineWrapping: true,
      foldGutter: true,
      readOnly: true,
      gutters: ['CodeMirror-foldgutter'],
    };
  }
}

export namespace GraphQLEditor {
  export interface IOptions {
    context: DocumentRegistry.Context;
    model: GraphQLModel;
    commands: CommandRegistry;
    manager: C.IGraphQLManager;
  }
}
