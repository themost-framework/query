/* eslint-env node, es6 */
const { ComparisonExpression } = require('./expressions');
class AggregateComparisonExpression extends ComparisonExpression {
    constructor(left, op, right) {
        super(left, op, right);
    }
    /**
     * Converts the current method to the equivalent query expression e.g. { orderDate: { $year: [] } } which is equivalent with year(orderDate)
     * @returns {*}
     */
    exprOf() {
        let result = {};
        result[this.operator] = [
            (typeof this.left.exprOf === 'function') ? this.left.exprOf() : this.left,
            (typeof this.right.exprOf === 'function') ? this.right.exprOf() : this.right
        ];
        return result;
    }
}

module.exports = {
    AggregateComparisonExpression
}
