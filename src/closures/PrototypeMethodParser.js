import { SimpleMethodCallExpression } from '../expressions';

class PrototypeMethodParser {
    constructor() {
    }
    test(name) {
        if (typeof this[name] === 'function') {
            return this[name];
        }
    }
    toString(args) {
        return new SimpleMethodCallExpression('toString', args);
    }
}

export {
    PrototypeMethodParser
};
