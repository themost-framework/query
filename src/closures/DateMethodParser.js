// MOST Web Framework Codename Zero Gravity Copyright (c) 2017-2022, THEMOST LP All rights reserved

import { SimpleMethodCallExpression } from '../expressions';
import { PrototypeMethodParser } from './PrototypeMethodParser';

/**
 * @class
 * @constructor
 */
class DateMethodParser extends PrototypeMethodParser {
    constructor() {
        super();
    }
    getFullYear(args) {
        return new SimpleMethodCallExpression('year', args);
    }
    getYear(args) {
        return new SimpleMethodCallExpression('year', args);
    }
    getMonth(args) {
        return new SimpleMethodCallExpression('month', args);
    }
    getDate(args) {
        return new SimpleMethodCallExpression('dayOfMonth', args);
    }
    toDate(args) {
        return new SimpleMethodCallExpression('date', args);
    }
    getHours(args) {
        return new SimpleMethodCallExpression('hour', args);
    }
    getMinutes(args) {
        return new SimpleMethodCallExpression('minute', args);
    }
    getSeconds(args) {
        return new SimpleMethodCallExpression('second', args);
    }
}

export {
    DateMethodParser
};
