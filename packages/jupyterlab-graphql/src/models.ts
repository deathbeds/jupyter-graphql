import {VDomModel} from '@jupyterlab/apputils';
import * as graphql from 'graphql';
import {SubscriptionClient} from 'subscriptions-transport-ws';
import {Signal} from '@phosphor/signaling';

import * as C from '.';

const SUB_EVENTS = [
  'connected',
  'connecting',
  'disconnecting',
  'disconnected',
  'reconnecting',
  'reconnected',
  'error'
];

const headers = {
  'Content-Type': 'application/json',
};

export class GraphQLModel extends VDomModel {
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
  private _reference: any;

  private _referenceChanged = new Signal<this, any>(this);

  get referenceChanged() {
    return this._referenceChanged;
  }

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

  get reference() {
    return this._reference;
  }

  set reference(reference) {
    this._reference = reference;
    this.stateChanged.emit(void 0);
    this._referenceChanged.emit(void 0);
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
