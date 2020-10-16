import TsNode from 'ts-node';
import SourceMapSupport from 'source-map-support';
import globalJsDom from 'global-jsdom';

SourceMapSupport.install();
TsNode.register({compilerOptions : {"module":"commonjs"}});
globalJsDom();

import 'mock-local-storage';
