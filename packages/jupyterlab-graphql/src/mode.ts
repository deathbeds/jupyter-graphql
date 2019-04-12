// tslint:disable-next-line
/// <reference path="./mode.d.ts"/>
import CodeMirror from 'codemirror';

import 'codemirror-graphql/mode';

import 'codemirror/addon/lint/lint';
import 'codemirror-graphql/lint';
import 'codemirror/addon/lint/lint.css';

import 'codemirror/addon/hint/show-hint';
import 'codemirror-graphql/hint';
import 'codemirror/addon/hint/show-hint.css';

import 'codemirror-graphql/info';
import 'codemirror-graphql/jump';

import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/foldgutter.css';

(CodeMirror as any).defineMIME('application/graphql', 'graphql');
(CodeMirror as any).modeInfo.push({
  ext: ['graphql', '.graphql'],
  mime: 'application/graphql',
  mode: 'graphql',
  name: 'GraphQL',
});
