const path = require('path');
let configFile = path.resolve(process.cwd(), 'babel.config.js');
if (process.env.BABEL_CONFIG) {
    configFile = path.resolve(process.cwd(), process.env.BABEL_CONFIG);
}
require('@babel/register')({
    configFile
});