// MOST Web Framework 2.0 Codename Blueshift Copyright (c) 2017-2020, THEMOST LP All rights reserved

var MethodCallExpression = require('../expressions').MethodCallExpression;
var PrototypeMethodParser = require('./PrototypeMethodParser').PrototypeMethodParser;
var LangUtils = require('@themost/common').LangUtils;

/**
 * @class
 * @constructor
 */
function DateMethodParser() {
    PrototypeMethodParser.call(this);
}
LangUtils.inherits(DateMethodParser, PrototypeMethodParser);

DateMethodParser.prototype.getFullYear = function(args) {
    return new MethodCallExpression('year', args);
}

DateMethodParser.prototype.getYear = function(args) {
    return new MethodCallExpression('year', args);
}

DateMethodParser.prototype.getMonth = function(args) {
    return new MethodCallExpression('month', args);
}

DateMethodParser.prototype.getDate = function(args) {
    return new MethodCallExpression('dayOfMonth', args);
}

DateMethodParser.prototype.toDate = function(args) {
    return new MethodCallExpression('date', args);
}

DateMethodParser.prototype.getHours = function(args) {
    return new MethodCallExpression('hour', args);
}

DateMethodParser.prototype.getMinutes = function(args) {
    return new MethodCallExpression('minute', args);
}

DateMethodParser.prototype.getSeconds = function(args) {
    return new MethodCallExpression('second', args);
}

module.exports.DateMethodParser = DateMethodParser;
