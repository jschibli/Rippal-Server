let express = require('express');
let config = require('./config/config');
let setup = require('./config/setup');

const app = express();
setup(app, config);

module.exports = app;