// MOST Web Framework Codename Zero Gravity Copyright (c) 2017-2022, THEMOST LP All rights reserved

import { SimpleMethodCallExpression } from '@themost/query';
import { PrototypeMethodParser } from './PrototypeMethodParser';

class StringMethodParser extends PrototypeMethodParser {
    constructor() {
        super();
    }
    startsWith(args) {
        return new SimpleMethodCallExpression('startsWith', args);
    }
    endsWith(args) {
        return new SimpleMethodCallExpression('endsWith', args);
    }
    toLowerCase(args) {
        return new SimpleMethodCallExpression('toLower', args);
    }
    toLocaleLowerCase(args) {
        return new SimpleMethodCallExpression('toLower', args);
    }
    toUpperCase(args) {
        return new SimpleMethodCallExpression('toUpper', args);
    }
    toLocaleUpperCase(args) {
        return new SimpleMethodCallExpression('toUpper', args);
    }
    indexOf(args) {
        return new SimpleMethodCallExpression('indexOfBytes', args);
    }
    substr(args) {
        return new SimpleMethodCallExpression('substr', args);
    }
    trim(args) {
        return new SimpleMethodCallExpression('trim', args);
    }
    concat(args) {
        return new SimpleMethodCallExpression('concat', args);
    }
    includes(args) {
        return new SimpleMethodCallExpression('contains', args);
    }
}

export {
    StringMethodParser
};
