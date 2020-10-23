import Axios from 'axios';
import httpAdapter from "axios/lib/adapters/http.js";
import Chai from "chai";
import ChaiAsPromised from "chai-as-promised";
import TsNode from 'ts-node';
import SourceMapSupport from 'source-map-support';

SourceMapSupport.install();
TsNode.register();
import 'mock-local-storage';
Axios.defaults.adapter = httpAdapter;
Chai.use(ChaiAsPromised);
