// MOST Web Framework Codename Zero Gravity Copyright (c) 2017-2022, THEMOST LP All rights reserved

import { SimpleMethodCallExpression } from '../expressions';
import { MethodCallExpression } from '../expressions';

class FallbackMethodParser {
    constructor() {
        //
    }
    test(name) {
        let matches = /(\w+)$/g.exec(name);
        if (matches == null) {
            return;
        }
        let method = matches[1];
        if (typeof FallbackMethodParser[method] === 'function') {
            return FallbackMethodParser[method];
        }
    }
    static count(args) {
        return new SimpleMethodCallExpression('count', args);
    }
    static round(args) {
        return new MethodCallExpression('round', args);
    }
    static floor(args) {
        return new SimpleMethodCallExpression('floor', args);
    }
    static ceil(args) {
        return new SimpleMethodCallExpression('ceil', args);
    }
    static mod(args) {
        return new SimpleMethodCallExpression('mod', args);
    }
    static add(args) {
        return new SimpleMethodCallExpression('add', args);
    }
    static subtract(args) {
        return new SimpleMethodCallExpression('subtract', args);
    }
    static multiply(args) {
        return new SimpleMethodCallExpression('multiply', args);
    }
    static divide(args) {
        return new SimpleMethodCallExpression('divide', args);
    }
    static bitAnd(args) {
        return new SimpleMethodCallExpression('bit', args);
    }
    static mean(args) {
        return new SimpleMethodCallExpression('avg', args);
    }
    static avg(args) {
        return new SimpleMethodCallExpression('avg', args);
    }
    static sum(args) {
        return new SimpleMethodCallExpression('sum', args);
    }
    static min(args) {
        return new SimpleMethodCallExpression('min', args);
    }
    static max(args) {
        return new SimpleMethodCallExpression('max', args);
    }
    static me() {
        return new SimpleMethodCallExpression('me', []);
    }
    static today() {
        return new SimpleMethodCallExpression('today', []);
    }
    static whoami() {
        return new SimpleMethodCallExpression('today', []);
    }
    static now() {
        return new SimpleMethodCallExpression('now', []);
    }
    static parseInt(args) {
        return new SimpleMethodCallExpression('toInt', args);
    }
    static parseFloat(args) {
        return new SimpleMethodCallExpression('toDouble', args);
    }
}

export {
    FallbackMethodParser
};
