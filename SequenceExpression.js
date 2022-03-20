/* eslint-env node, es6 */
const { MethodCallExpression,MemberExpression } = require('./expressions');
class SequenceExpression {
    constructor() {
        this.value = [];
    }
    exprOf() {
        return this.value.reduce(function (previousValue, currentValue, currentIndex) {
            if (currentValue instanceof MemberExpression) {
                Object.defineProperty(previousValue, currentValue.name, {
                    value: 1,
                    enumerable: true,
                    configurable: true
                });
                return previousValue;
            }
            else if (currentValue instanceof MethodCallExpression) {
                // validate method name e.g. Math.floor and get only the last part
                let name = currentValue.name.split('.');
                let previousName = name[name.length - 1] + currentIndex.toString();
                Object.defineProperty(previousValue, previousName, {
                    value: currentValue.exprOf(),
                    enumerable: true,
                    configurable: true
                });
                return previousValue;
            }
            throw new Error('Sequence expression is invalid or has a member which its type has not implemented yet');
        }, {});
    }
}

module.exports = {
    SequenceExpression
}
