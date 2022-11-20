// MOST Web Framework Codename Zero Gravity Copyright (c) 2017-2022, THEMOST LP All rights reserved

import { SimpleMethodCallExpression } from '@themost/query';
import { MethodCallExpression } from '@themost/query';

class MathMethodParser {
    constructor() {
        this.prefix = [new RegExp('^Math\\.(\\w+)', 'g')];
    }
    test(name) {
        let findPrefix = this.prefix.find(function (prefix) {
            return prefix.test(name);
        });
        if (findPrefix) {
            let method = name.replace(findPrefix, '$1');
            if (typeof MathMethodParser[method] === 'function') {
                return MathMethodParser[method];
            }
        }
    }
    static floor(args) {
        return new SimpleMethodCallExpression('floor', args);
    }
    static ceil(args) {
        return new SimpleMethodCallExpression('ceiling', args);
    }
    static round(args) {
        return new MethodCallExpression('round', args);
    }
    static min(args) {
        return new SimpleMethodCallExpression('min', args);
    }
    static max(args) {
        return new SimpleMethodCallExpression('max', args);
    }
    static mean(args) {
        return new SimpleMethodCallExpression('avg', args);
    }
    static avg(args) {
        return new SimpleMethodCallExpression('avg', args);
    }
}
export {
    MathMethodParser
};
