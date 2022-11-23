const {addAliases} = require('module-alias');
const path = require('path');
addAliases({
    '@themost/query': path.resolve(process.cwd(), 'src/index'),
    '@themost/query/closures': path.resolve(process.cwd(), 'closures/src/index')
});