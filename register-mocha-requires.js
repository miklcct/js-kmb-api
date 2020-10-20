import TsNode from 'ts-node';
import SourceMapSupport from 'source-map-support';

SourceMapSupport.install();
TsNode.register({compilerOptions : {"module":"commonjs"}});
import 'mock-local-storage';
