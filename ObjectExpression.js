/* eslint-env node, es6 */
class ObjectExpression {
    constructor() {
        //
    }
    exprOf() {
        let finalResult = {};
        let thisArg = this;
        Object.keys(this).forEach(function (key) {
            if (typeof thisArg[key].exprOf === 'function') {
                Object.defineProperty(finalResult, key, {
                    value: thisArg[key].exprOf(),
                    enumerable: true,
                    configurable: true
                });
                return;
            }
            throw new Error('Object expression is invalid or has a member which its type has not implemented yet');
        });
        return finalResult;
    }
}

module.exports = {
    ObjectExpression
}
