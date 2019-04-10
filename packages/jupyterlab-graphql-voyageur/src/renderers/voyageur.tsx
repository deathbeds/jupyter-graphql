import React from 'react';

import { VDomModel, VDomRenderer } from '@jupyterlab/apputils';

import { GraphQLVoyager } from 'graphql-voyager';


namespace VoyageurComponent {
  export interface IProps {
  }
}

function VoyageurComponent(_: VoyageurComponent.IProps): React.ReactElement<VoyageurComponent.IProps> {
  return <GraphQLVoyager introspection={null} />;
}

export class Voyageur extends VDomRenderer<Voyageur.Model> {
  constructor(_: Voyageur.IOptions) {
    super();
    this.model = new Voyageur.Model();
    this.node.title = 'Voyageur';
  }
  render() {
    return (
      <VoyageurComponent />
    );
  }
}

export namespace Voyageur {
  export class Model extends VDomModel {
    constructor() {
      super();
    }
  }

  export interface IOptions {}
}
