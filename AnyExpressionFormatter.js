/* eslint-env node, es6 */
class AnyExpressionFormatter {
    constructor() {
        //
    }
    /**
     * @type {ExpressionBase}
     */
    format(expr) {
        return expr.exprOf();
    }
    /**
     * @type {Array<ExpressionBase>}
     */
    formatMany(expr) {
        return expr.map(function (item) {
            return item.exprOf();
        });
    }
}

module.exports = {
    AnyExpressionFormatter
}