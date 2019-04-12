import CodeMirror from 'codemirror';
import {VDomModel} from '@jupyterlab/apputils';
import {PageConfig} from '@jupyterlab/coreutils';
import {CommandRegistry} from '@phosphor/commands';
import * as graphql from 'graphql';
import {SubscriptionClient} from 'subscriptions-transport-ws';

import {
  ABCWidgetFactory,
  DocumentRegistry,
  IDocumentWidget,
  DocumentWidget,
} from '@jupyterlab/docregistry';

const DEFAULT_GRAPHQL_URL = `${PageConfig.getBaseUrl()}graphql`;
const SUB_EVENTS = [
  'connected',
  'connecting',
  'disconnecting',
  'disconnected',
  'reconnecting',
  'reconnected',
  'error'
];

import {Widget, SplitPanel, SplitLayout} from '@phosphor/widgets';

import * as C from '.';
import {GraphQLURL} from './renderers/url';

const headers = {
  'Content-Type': 'application/json',
};

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
    return new GraphQLDocumentWidget({context, commands: this._commands, manager: this._manager});
  }
}

export namespace GraphQLFactory {
  export interface IOptions extends DocumentRegistry.IWidgetFactoryOptions {
    commands: CommandRegistry;
    manager: C.IGraphQLManager;
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
      gutters: [
        'CodeMirror-line-numbers',
        'CodeMirror-lint-markers',
        'CodeMirror-foldgutter'
      ],
      extraKeys: {
        'Ctrl-Space': 'autocomplete',
      },
      lineNumbers: true,
      lineWrapping: true,
      foldGutter: true,
    };
  }

  resultViewerOptions() {
    return {
      mode: 'application/ld+json',
      theme: 'material',
      lineWrapping: true,
      foldGutter: true,
      gutters: ['CodeMirror-foldgutter'],
    };
  }
}

export namespace GraphQLEditor {
  export interface IOptions {
    context: DocumentRegistry.Context;
    model: GraphQLDocumentWidget.Model;
    commands: CommandRegistry;
    manager: C.IGraphQLManager;
  }
}

export class GraphQLDocumentWidget extends DocumentWidget<GraphQLEditor> {
  model: GraphQLDocumentWidget.Model;
  private _editor: CodeMirror.Editor;
  private _commands: CommandRegistry;

  constructor(options: GraphQLDocumentWidget.IOptions) {
    let {content, context, reveal, commands, manager, ...other} = options;
    let model = new GraphQLDocumentWidget.Model();
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
    model: GraphQLDocumentWidget.Model,
    commands: CommandRegistry,
    manager: C.IGraphQLManager
  ) {
    return new GraphQLEditor({context, model, commands, manager});
  }
}



export namespace GraphQLDocumentWidget {
  export interface IOptions
    extends DocumentWidget.IOptionsOptionalContent<GraphQLEditor> {
      commands: CommandRegistry;
      manager: C.IGraphQLManager
    }

  export class Model extends VDomModel {
    private _graphql: string;
    private _url: string;
    private _schema: graphql.GraphQLSchema;
    private _introspection: any;
    private _results: object;
    private _requestStarted: Date;
    private _requestCompleted: Date;
    private _requestDuration: number;
    private _manager: C.IGraphQLManager;
    private _subscriptions: SubscriptionClient;
    private _subscribed = false;
    private _debounce: any;
    private _socketStatus = '';

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

    makeSubscriptionClient() {
      const client = new SubscriptionClient(this.wsUrl, {reconnect: true});
      SUB_EVENTS.map((e) => client.on(e, () => this.socketStatus = e));
      return client;
    }

    async fetchSchema(url: string) {
      let r = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({query: graphql.introspectionQuery}),
      });

      let response = await r.json();

      this._introspection = response;
      this._subscriptions = this.makeSubscriptionClient();

      this.schema = graphql.buildClientSchema(response.data);
    }

    get wsUrl() {
      return this.url.replace(/^http/, 'ws') + '/subscriptions';
    }

    get subscriptions() {
      return this._subscriptions;
    }

    get socketStatus() {
      return this._socketStatus;
    }
    set socketStatus(socketStatus) {
      this._socketStatus = socketStatus;
      this.stateChanged.emit(void 0);
    }

    async fetchQuery(query: string) {
      if(this._debounce) {
        clearTimeout(this._debounce);
      }

      this._debounce = setTimeout(async () => {
        let r = await fetch(this.url, {
          method: 'POST',
          headers,
          body: JSON.stringify({query}),
        });
        let results = await r.json();
        if(!this._subscribed) {
          this.results = results['data'];
        }
        this._debounce = null;
      }, 200);
    }

    get results() {
      return this._results;
    }

    set results(results) {
      this._results = results;
      this.requestCompleted = new Date();
      this.stateChanged.emit(void 0);
    }

    get schema() {
      return this._schema;
    }

    set schema(schema) {
      this._schema = schema;
      this.stateChanged.emit(void 0);
      if (this.graphql) {
        this.fetchQuery(this.graphql);
      }
    }

    get graphql() {
      return this._graphql;
    }
    set graphql(rawGraphql) {
      let node: graphql.DocumentNode;

      try {
        node = graphql.parse(rawGraphql);
      } catch {
        return;
      }

      this._graphql = rawGraphql;

      this.requestStarted = new Date();

      if (hasSubscriptionOperation(node)) {
        this.handleSubscription();
      } else if (this.url && this._graphql) {
        this._subscribed = false;
        this.fetchQuery(this._graphql);
      }
    }

    get subscribed() {
      return this._subscribed;
    }

    handleSubscription() {
      this._subscriptions.unsubscribeAll();
      this._subscribed = false;
      this._subscriptions.request({
        query: this._graphql
      }).subscribe({
        next: (value: any) => {
          this._subscribed = true;
          this.results = value['data']
        }
      });
    }

    restartClient() {
      let s = this._subscriptions;
      s.unsubscribeAll();
      s.close();

      this._subscriptions = this.makeSubscriptionClient();
    }

    get requestStarted() {
      return this._requestStarted;
    }
    set requestStarted(requestStarted) {
      this._requestStarted = requestStarted;
      this._requestCompleted = null;
      this.stateChanged.emit(void 0);
    }

    get requestCompleted() {
      return this._requestStarted;
    }
    set requestCompleted(requestCompleted) {
      this._requestCompleted = requestCompleted;
      if (this._requestStarted) {
        this._requestDuration = this._requestCompleted.getTime() - this._requestStarted.getTime();
      }
      this.stateChanged.emit(void 0);
    }

    get requestDuration() {
      return !this._subscribed && this._requestDuration ? this._requestDuration : 0;
    }

    get manager() {
      return this._manager;
    }
    set manager(manager) {
      this._manager = manager;
      this.stateChanged.emit(void 0);
    }

    get introspection() {
      return this._introspection;
    }

    set introspection(introspection) {
      this._introspection = introspection;
      this.stateChanged.emit(void 0);
    }
  }
}


const hasSubscriptionOperation = (queryDoc: graphql.DocumentNode) => {
  for (let definition of queryDoc.definitions) {
    if (definition.kind === 'OperationDefinition') {
      const operation = definition.operation;
      if (operation === 'subscription') {
        return true;
      }
    }
  }

  return false;
};
