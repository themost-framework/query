/* eslint-env node, es6 */
class SelectAnyExpression {
    constructor(expr, alias) {
        this.expression = expr;
        this.as = alias;
    }
    exprOf() {
        if (this.as != null) {
            const res = {};
            Object.defineProperty(res, this.as, {
                configurable: true,
                enumerable: true,
                writable: true,
                value: this.expression.exprOf()
            });
            return res;
        }
        throw new Error('Expression alias cannot be empty');
    }
}

module.exports = {
    SelectAnyExpression
}