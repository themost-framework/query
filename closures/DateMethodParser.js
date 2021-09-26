// MOST Web Framework 2.0 Codename Blueshift Copyright (c) 2017-2020, THEMOST LP All rights reserved

var MethodCallExpression = require('../expressions').MethodCallExpression;
var SimpleMethodCallExpression = require('../expressions').SimpleMethodCallExpression;
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
    return new SimpleMethodCallExpression('year', args);
}

DateMethodParser.prototype.getYear = function(args) {
    return new SimpleMethodCallExpression('year', args);
}

DateMethodParser.prototype.getMonth = function(args) {
    return new SimpleMethodCallExpression('month', args);
}

DateMethodParser.prototype.getDate = function(args) {
    return new SimpleMethodCallExpression('dayOfMonth', args);
}

DateMethodParser.prototype.toDate = function(args) {
    return new SimpleMethodCallExpression('date', args);
}

DateMethodParser.prototype.getHours = function(args) {
    return new SimpleMethodCallExpression('hour', args);
}

DateMethodParser.prototype.getMinutes = function(args) {
    return new SimpleMethodCallExpression('minute', args);
}

DateMethodParser.prototype.getSeconds = function(args) {
    return new SimpleMethodCallExpression('second', args);
}

module.exports.DateMethodParser = DateMethodParser;
