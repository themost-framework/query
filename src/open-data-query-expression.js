import {QueryExpression} from './query';

class UnsupportedQueryExpression extends Error {
    constructor() {
        super('Unsupported query expression');
        this.code = 'ERR_EXPRESSION';
    }
}

class OpenDataQueryExpression extends QueryExpression {
    constructor() {
        super();
    }

    // eslint-disable-next-line no-unused-vars
    join(entity, props, alias) {
        throw new UnsupportedQueryExpression();
    }

    // eslint-disable-next-line no-unused-vars
    leftJoin(entity, props, alias) {
        throw new UnsupportedQueryExpression();
    }

    // eslint-disable-next-line no-unused-vars
    rightJoin(entity, props, alias) {
        throw new UnsupportedQueryExpression();
    }

    // eslint-disable-next-line no-unused-vars
    delete(entity) {
        throw new UnsupportedQueryExpression();
    }

    // eslint-disable-next-line no-unused-vars
    update(entity) {
        throw new UnsupportedQueryExpression();
    }

    // eslint-disable-next-line no-unused-vars
    insert(obj) {
        throw new UnsupportedQueryExpression();
    }
}

export {
    OpenDataQueryExpression,
    UnsupportedQueryExpression
}