require('source-map-support/register');
require('ts-node/register');
require('axios').default.defaults.adapter = require("axios/lib/adapters/http");
require('chai').use(require('chai-as-promised'));
