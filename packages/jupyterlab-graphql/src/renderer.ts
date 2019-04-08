import React from 'react';
import CodeMirror from 'codemirror';
import {VDomRenderer, VDomModel} from '@jupyterlab/apputils';
import * as graphql from 'graphql';

import {
  ABCWidgetFactory,
  DocumentRegistry,
  IDocumentWidget,
  DocumentWidget,
} from '@jupyterlab/docregistry';

import {Widget, SplitPanel, SplitLayout} from '@phosphor/widgets';

import * as C from '.';

const h = React.createElement;

const headers = {
  'Content-Type': 'application/json',
};

export class GraphQLFactory extends ABCWidgetFactory<IDocumentWidget<GraphQLEditor>> {
  protected createNewWidget(
    context: DocumentRegistry.Context
  ): IDocumentWidget<GraphQLEditor> {
    return new GraphQLDocumentWidget({context});
  }
}

export class GraphQLEditor extends SplitPanel {
  model: GraphQLDocumentWidget.Model;

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
      let opts = {schema};
      this._editor.setOption('lint', opts);
      this._editor.setOption('hintOptions', opts);
    }
    this._results.setValue(JSON.stringify(this.model.results || {}, null, 2));
  }

  makeEditor() {
    let widget = new Widget();
    widget.addClass(C.CSS.EDIT);
    this._editor = CodeMirror(widget.node, this.editorOptions());
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
      gutters: ['CodeMirror-line-numbers', 'CodeMirror-lint-markers'],
      extraKeys: {
        'Ctrl-Space': 'autocomplete',
      },
      lineNumbers: true,
      lineWrapping: true,
    };
  }

  resultViewerOptions() {
    return {
      mode: 'application/ld+json',
      theme: 'material',
      lineWrapping: true,
      extraKeys: {
        'Ctrl-Q': (cm: CodeMirror.Doc) => (cm as any).foldCode(cm.getCursor()),
      },
      foldGutter: true,
      gutters: ['CodeMirror-foldgutter'],
    };
  }
}

export namespace GraphQLEditor {
  export interface IOptions {
    context: DocumentRegistry.Context;
    model: GraphQLDocumentWidget.Model;
  }
}

export class GraphQLDocumentWidget extends DocumentWidget<GraphQLEditor> {
  model: GraphQLDocumentWidget.Model;
  private _editor: CodeMirror.Editor;

  constructor(options: GraphQLDocumentWidget.IOptions) {
    let {content, context, reveal, ...other} = options;
    let model = new GraphQLDocumentWidget.Model();
    content = content || Private.createContent(context, model);
    super({content, context, reveal, ...other});
    this.title.iconClass = C.CSS.ICON;
    this.addClass(C.CSS.DOC);

    this.model = model;
    this.toolbar.addItem('graphql-url', new GraphQLURL(model));
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
    model: GraphQLDocumentWidget.Model
  ) {
    return new GraphQLEditor({context, model});
  }
}

export class GraphQLURL extends VDomRenderer<GraphQLDocumentWidget.Model> {
  constructor(model: GraphQLDocumentWidget.Model) {
    super();
    this.model = model;
    this.addClass(C.CSS.URL);
  }

  render() {
    if (!this.model) {
      return null;
    }

    return h(
      'label',
      {},
      h('input', {placeholder: 'GraphQL URL', onChange: this.handleUrlChange})
    );
  }

  handleUrlChange = (evt: Event) => {
    this.model.url = (evt.target as HTMLInputElement).value;
  };
}

export class GraphQLExplorer extends VDomRenderer<GraphQLDocumentWidget.Model> {
  constructor(model: GraphQLDocumentWidget.Model) {
    super();
    this.model = model;
    this.title.iconClass = C.CSS.ICON;
    this.addClass(C.CSS.DOC);
  }

  render() {
    if (!this.model) {
      return null;
    }

    return h(
      'div',
      {className: C.CSS.DOC_BODY},
      h(
        'div',
        {className: 'jp-GraphQL-Structured'},
        h('pre', {}, JSON.stringify(this.model.results || {}, null, 2))
      )
    );
  }

  handleUrlChange = (evt: Event) => {
    this.model.url = (evt.target as HTMLInputElement).value;
  };
}

export namespace GraphQLDocumentWidget {
  export interface IOptions
    extends DocumentWidget.IOptionsOptionalContent<GraphQLEditor> {}

  export class Model extends VDomModel {
    private _graphql: string;
    private _url: string;
    private _schema: graphql.GraphQLSchema;
    private _results: object;

    get url() {
      return this._url;
    }

    set url(url) {
      this._url = url;
      this.results = null;
      this.schema = null;
      if (url) {
        this.fetchSchema(url);
      }
      this.stateChanged.emit(void 0);
    }

    async fetchSchema(url: string) {
      let r = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({query: graphql.introspectionQuery}),
      });

      let schemaResult = await r.json();

      this.schema = graphql.buildClientSchema(schemaResult.data);
    }

    async fetchQuery(query: string) {
      let r = await fetch(this.url, {
        method: 'POST',
        headers,
        body: JSON.stringify({query}),
      });
      this.results = (await r.json())['data'];
    }

    get results() {
      return this._results;
    }

    set results(results) {
      this._results = results;
      this.stateChanged.emit(void 0);
    }

    get schema() {
      return this._schema;
    }

    set schema(schema) {
      this._schema = schema;
      this.stateChanged.emit(void 0);
      console.log('TODO: register with CodeMirror');
      if (this.graphql) {
        this.fetchQuery(this.graphql);
      }
    }

    get graphql() {
      return this._graphql;
    }
    set graphql(graphql) {
      this._graphql = graphql;
      this.stateChanged.emit(void 0);
      if (this.url && graphql) {
        this.fetchQuery(this.graphql);
      }
    }
  }
}
