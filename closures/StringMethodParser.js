// MOST Web Framework 2.0 Codename Blueshift Copyright (c) 2017-2020, THEMOST LP All rights reserved

var MethodCallExpression = require('../expressions').MethodCallExpression;
var SimpleMethodCallExpression = require('../expressions').SimpleMethodCallExpression;
var PrototypeMethodParser = require('./PrototypeMethodParser').PrototypeMethodParser;
var LangUtils = require('@themost/common').LangUtils;

/**
 * @class
 * @constructor
 */
function StringMethodParser() {
    PrototypeMethodParser.call(this);
}
LangUtils.inherits(StringMethodParser, PrototypeMethodParser);

StringMethodParser.prototype.startsWith = function(args) {
    return new SimpleMethodCallExpression('startsWith', args);
}

StringMethodParser.prototype.endsWith = function(args) {
    return new SimpleMethodCallExpression('endsWith', args);
}

StringMethodParser.prototype.toLowerCase = function(args) {
    return new SimpleMethodCallExpression('toLower', args);
}

StringMethodParser.prototype.toLocaleLowerCase = function(args) {
    return new SimpleMethodCallExpression('toLower', args);
}

StringMethodParser.prototype.toUpperCase = function(args) {
    return new SimpleMethodCallExpression('toUpper', args);
}

StringMethodParser.prototype.toLocaleUpperCase = function(args) {
    return new SimpleMethodCallExpression('toUpper', args);
}


StringMethodParser.prototype.indexOf = function(args) {
    return new SimpleMethodCallExpression('indexOfBytes', args);
}


StringMethodParser.prototype.substr = function(args) {
    return new SimpleMethodCallExpression('substr', args);
}

StringMethodParser.prototype.substring = function(args) {
    return new SimpleMethodCallExpression('substr', args);
}

StringMethodParser.prototype.trim = function(args) {
    return new SimpleMethodCallExpression('trim', args);
}

StringMethodParser.prototype.concat = function(args) {
    return new SimpleMethodCallExpression('concat', args);
}

StringMethodParser.prototype.includes = function(args) {
    return new SimpleMethodCallExpression('contains', args);
}


module.exports.StringMethodParser = StringMethodParser;
