/* eslint-env node, es6 */
class OrderByAnyExpression {
    constructor(expr, direction) {
        this.expression = expr;
        this.direction = direction || 'asc';
    }
    exprOf() {
        const res = {};
        Object.defineProperty(res, '$' + (this.direction || 'asc'), {
            configurable: true,
            enumerable: true,
            writable: true,
            value: this.expression.exprOf()
        });
        return res;
    }
}

module.exports = {
    OrderByAnyExpression
}