// MOST Web Framework 2.0 Codename Blueshift Copyright (c) 2017-2020, THEMOST LP All rights reserved

var SimpleMethodCallExpression = require('../expressions').SimpleMethodCallExpression;

/**
 * @class
 * @constructor
 */
function FallbackMethodParser() {
    //
}
FallbackMethodParser.prototype.test = function (name) {
    var matches = /\.(\w+)$/.exec(name);
    if (matches == null) {
        return;
    }
    var method = matches[1];
    if (typeof FallbackMethodParser[method] === 'function') {
        return FallbackMethodParser[method];
    }
}

FallbackMethodParser.count = function(args) {
    return new SimpleMethodCallExpression('count', args);
}
FallbackMethodParser.round = function(args) {
    return new SimpleMethodCallExpression('round', args);
}

FallbackMethodParser.floor = function(args) {
    return new SimpleMethodCallExpression('floor', args);
}

FallbackMethodParser.ceil = function(args) {
    return new SimpleMethodCallExpression('ceil', args);
}

FallbackMethodParser.mod = function(args) {
    return new SimpleMethodCallExpression('mod', args);
}

FallbackMethodParser.add = function(args) {
    return new SimpleMethodCallExpression('add', args);
}

FallbackMethodParser.subtract = function(args) {
    return new SimpleMethodCallExpression('subtract', args);
}

FallbackMethodParser.multiply = function(args) {
    return new SimpleMethodCallExpression('multiply', args);
}

FallbackMethodParser.divide = function(args) {
    return new SimpleMethodCallExpression('divide', args);
}

FallbackMethodParser.bitAnd = function(args) {
    return new SimpleMethodCallExpression('bit', args);
}
FallbackMethodParser.mean = function(args) {
    return new SimpleMethodCallExpression('avg', args);
}
FallbackMethodParser.avg = function(args) {
    return new SimpleMethodCallExpression('avg', args);
}
FallbackMethodParser.sum = function(args) {
    return new SimpleMethodCallExpression('sum', args);
}
FallbackMethodParser.min = function(args) {
    return new SimpleMethodCallExpression('min', args);
}
FallbackMethodParser.max = function(args) {
    return new SimpleMethodCallExpression('max', args);
}

module.exports.FallbackMethodParser = FallbackMethodParser;
