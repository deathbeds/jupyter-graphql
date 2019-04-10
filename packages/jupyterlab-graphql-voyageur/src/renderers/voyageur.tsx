import React from 'react';

import {VDomModel, VDomRenderer} from '@jupyterlab/apputils';

import {GraphQLVoyager} from 'graphql-voyager';

import 'graphql-voyager/dist/voyager.css';

const DEBUG = false;

namespace VoyageurComponent {
  export interface IProps {
    introspection: any;
  }
}

function VoyageurComponent(
  _: VoyageurComponent.IProps
): React.ReactElement<VoyageurComponent.IProps> {
  return (
    <GraphQLVoyager introspection={_.introspection} loadWorker={Private.loadWorker} />
  );
}

export class Voyageur extends VDomRenderer<Voyageur.Model> {
  constructor(options: Voyageur.IOptions) {
    super();
    this.model = new Voyageur.Model(options);
    this.node.title = 'Voyageur';
  }
  render() {
    return <VoyageurComponent introspection={this.model.introspection} />;
  }
}

export namespace Voyageur {
  export class Model extends VDomModel {
    private _introspection: any;

    get introspection() {
      return this._introspection;
    }

    set introspection(introspection) {
      this._introspection = introspection;
      this.stateChanged.emit(void 0);
    }

    constructor(options: IOptions) {
      super();
      this._introspection = options.introspection;
    }
  }

  export interface IOptions {
    introspection: any;
  }
}

namespace Private {
  export async function loadWorker(path: string, relative: boolean): Promise<Worker> {
    if (DEBUG) {
      console.debug(path, relative);
    }
    let payload = require('!!raw-loader!graphql-voyager/dist/voyager.worker.js');
    payload = payload.replace('||16777216;', '||134217728;');
    const script = new Blob([payload], {type: 'application/javascript'});
    const url = URL.createObjectURL(script);
    return new Worker(url);
  }
}
