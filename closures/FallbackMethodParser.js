// MOST Web Framework 2.0 Codename Blueshift Copyright (c) 2017-2020, THEMOST LP All rights reserved

var MethodCallExpression = require('../expressions').MethodCallExpression;

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
    return new MethodCallExpression('count', args);
}
FallbackMethodParser.round = function(args) {
    return new MethodCallExpression('round', args);
}

FallbackMethodParser.floor = function(args) {
    return new MethodCallExpression('floor', args);
}

FallbackMethodParser.ceil = function(args) {
    return new MethodCallExpression('ceil', args);
}

FallbackMethodParser.mod = function(args) {
    return new MethodCallExpression('mod', args);
}

FallbackMethodParser.add = function(args) {
    return new MethodCallExpression('add', args);
}

FallbackMethodParser.subtract = function(args) {
    return new MethodCallExpression('subtract', args);
}

FallbackMethodParser.multiply = function(args) {
    return new MethodCallExpression('multiply', args);
}

FallbackMethodParser.divide = function(args) {
    return new MethodCallExpression('divide', args);
}

FallbackMethodParser.bitAnd = function(args) {
    return new MethodCallExpression('bit', args);
}
FallbackMethodParser.mean = function(args) {
    return new MethodCallExpression('avg', args);
}
FallbackMethodParser.sum = function(args) {
    return new MethodCallExpression('sum', args);
}
FallbackMethodParser.min = function(args) {
    return new MethodCallExpression('min', args);
}
FallbackMethodParser.max = function(args) {
    return new MethodCallExpression('max', args);
}

module.exports.FallbackMethodParser = FallbackMethodParser;
