import {JupyterLab, JupyterLabPlugin} from '@jupyterlab/application';

import '../style/index.css';
import { Voyageur } from './renderers/voyageur';

import {PLUGIN_ID as id} from '.';


const graphqlPlugin: JupyterLabPlugin<void> = {
  activate: (_: JupyterLab): void => {
    const {shell} = _;
    // TODO: command, but probably register callback
    let widget = new Voyageur({});
    shell.addToMainArea(widget);
  },
  id,
  autoStart: true,
};

const plugins: JupyterLabPlugin<any>[] = [graphqlPlugin];
export default plugins;
