// MOST Web Framework 2.0 Codename Blueshift Copyright (c) 2017-2020, THEMOST LP All rights reserved

const {SimpleMethodCallExpression} = require('../expressions');
const {PrototypeMethodParser} = require('./PrototypeMethodParser');

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

module.exports = {
    StringMethodParser
};
