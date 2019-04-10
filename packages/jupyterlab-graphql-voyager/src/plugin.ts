import {JupyterLab, JupyterLabPlugin} from '@jupyterlab/application';

import './mode';
import '../style/index.css';
import {GraphQLVoyager} from 'graphql-voyager';

import {PLUGIN_ID as id} from '.';


const graphqlPlugin: JupyterLabPlugin<void> = {
  activate: (_: JupyterLab): void => {
    console.log(_, `let's explore!`, GraphQLVoyager);
  },
  id,
  autoStart: true,
};

const plugins: JupyterLabPlugin<any>[] = [graphqlPlugin];
export default plugins;
