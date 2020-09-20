// MOST Web Framework 2.0 Codename Blueshift Copyright (c) 2017-2020, THEMOST LP All rights reserved

var MethodCallExpression = require("../expressions").MethodCallExpression;

/**
 * @class
 * @constructor
 */
function MathMethodParser() {
    this.prefix = [ new RegExp('^Math\\.(\\w+)', 'g') ];
}

MathMethodParser.prototype.test = function(name) {
    var findPrefix = this.prefix.find( function(prefix) {
        return prefix.test(name);
    });
    if (findPrefix) {
        var method = name.replace(findPrefix, '$1');
        if (typeof MathMethodParser[method] === 'function') {
            return MathMethodParser[method];
        }
    }
}

MathMethodParser.floor = function(args) {
    return new MethodCallExpression('floor', args);
}

MathMethodParser.ceil = function(args) {
    return new MethodCallExpression('ceil', args);
}
MathMethodParser.round = function(args) {
    return new MethodCallExpression('round', args);
}
MathMethodParser.min = function(args) {
    return new MethodCallExpression('min', args);
}
MathMethodParser.max = function(args) {
    return new MethodCallExpression('max', args);
}

module.exports.MathMethodParser = MathMethodParser;
