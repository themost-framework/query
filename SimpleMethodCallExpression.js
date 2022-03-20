/* eslint-env node, es6 */
const { MethodCallExpression } = require('./expressions');

class SimpleMethodCallExpression extends MethodCallExpression {
    constructor(name, args) {
        super(name, args);
    }
    /**
     * Converts the current method to the equivalent query expression e.g. { orderDate: { $year: [] } } which is equivalent with year(orderDate)
     * @returns {*}
     */
    exprOf() {
        let method = {};
        let name = '$'.concat(this.name);
        //set arguments array
        if (this.args.length === 0)
            throw new Error('Unsupported method expression. Method arguments cannot be empty.');
        if (this.args.length === 1) {
            method[name] = {};
            let arg = null;
            if (typeof this.args[0].exprOf === 'function') {
                arg = this.args[0].exprOf();
            } else {
                arg = this.args[0];
            }
            Object.assign(method[name], arg);
            return method;
        } else {
            method[name] = this.args.map(function (item) {
                if (typeof item.exprOf === 'function') {
                    return item.exprOf();
                } else {
                    return item;
                }
            });
            return method;
        }

    }
}

module.exports = {
    SimpleMethodCallExpression
}
