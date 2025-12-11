const {TraceUtils} = require('@themost/common');
const { JsonLogger } = require('@themost/json-logger');
// use json logger
TraceUtils.useLogger(new JsonLogger({
    format: 'raw'
}));
process.env.NODE_ENV = 'development';
// use dotenv for environment variables
require('dotenv').config();
// set jest environment timeout
// eslint-disable-next-line no-undef
jest.setTimeout(30000);
