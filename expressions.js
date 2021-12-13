// MOST Web Framework 2.0 Codename Blueshift Copyright (c) 2017-2021, THEMOST LP All rights reserved

class ArithmeticExpression {
    constructor(p0, operator, p1) {
        this.left = p0;
        this.operator = operator || '$add';
        this.right = p1;
    }
    exprOf() {
        if (this.left == null) {
            throw new Error('Expected left operand');
        }
        if (this.operator == null)
            throw new Error('Expected arithmetic operator.');
        if (this.operator.match(ArithmeticExpression.OperatorRegEx) == null) {
            throw new Error('Invalid arithmetic operator.');
        }
        //build right operand e.g. { $add:[ 5 ] }
        let result = {};
        Object.defineProperty(result, this.operator, {
            value: [this.left.exprOf(), this.right.exprOf()],
            enumerable: true,
            configurable: true
        });
        if (this.right == null) {
            result[this.operator] = [null];
        }
        //return query expression
        return result;
    }
    static isArithmeticOperator(op) {
        if (typeof op === 'string')
            return (op.match(ArithmeticExpression.OperatorRegEx) !== null);
        return false;
    }
}

ArithmeticExpression.OperatorRegEx = /^(\$add|\$sub|\$mul|\$div|\$mod|\$bit)$/g;


class MemberExpression {
    constructor(name) {
        this.name = name;
    }
    exprOf() {
        return {
            $name: this.name
        };
    }
}

class LogicalExpression {
    constructor(operator, args) {
        this.operator = operator || '$and';
        this.args = args || [];
    }
    exprOf() {
        if (this.operator.match(LogicalExpression.OperatorRegEx) === null)
            throw new Error('Invalid logical operator.');
        if (!Array.isArray(this.args))
            throw new Error('Logical expression arguments cannot be null at this context.');
        if (this.args.length === 0)
            throw new Error('Logical expression arguments cannot be empty.');
        let p = {};
        p[this.operator] = [];
        for (let i = 0; i < this.args.length; i++) {
            let arg = this.args[i];
            if (typeof arg === 'undefined' || arg === null)
                p[this.operator].push(null);
            else if (typeof arg.exprOf === 'function')
                p[this.operator].push(arg.exprOf());

            else
                p[this.operator].push(arg);
        }
        return p;
    }
    static isLogicalOperator(op) {
        if (typeof op === 'string')
            return (op.match(LogicalExpression.OperatorRegEx) !== null);
        return false;
    }
}

LogicalExpression.OperatorRegEx = /^(\$and|\$or|\$not|\$nor)$/g;

class LiteralExpression {
    constructor(value) {
        this.value = value;
    }
    exprOf() {
        if (typeof this.value === 'undefined')
            return null;
        return this.value;
    }
}

class ComparisonExpression {
    constructor(left, op, right) {
        this.left = left;
        this.operator = op || '$eq';
        this.right = right;
    }
    exprOf() {
        if (typeof this.operator === 'undefined' || this.operator === null)
            throw new Error('Expected comparison operator.');

        let p, expr, name;
        if (this.left instanceof MethodCallExpression) {
            p = {};
            if (typeof this.right === 'undefined' || this.right === null)
                p[this.operator] = null;
            else if (typeof this.right.exprOf === 'function')
                p[this.operator] = (this.right instanceof MemberExpression) ? { $name: this.right.exprOf() } : this.right.exprOf();

            else
                p[this.operator] = this.right;

            if (this.operator === '$eq')
                this.left.args.push(p.$eq);

            else
                this.left.args.push(p);
            //return query expression
            return this.left.exprOf();
        }
        else if (this.left instanceof ArithmeticExpression) {
            p = {};
            //build comparison expression e.g. { $gt:10 }
            if (typeof this.right === 'undefined' || this.right === null)
                p[this.operator] = null;
            else if (typeof this.right.exprOf === 'function')
                p[this.operator] = (this.right instanceof MemberExpression) ? { $name: this.right.exprOf() } : this.right.exprOf();

            else
                p[this.operator] = this.right;

            //get left expression
            expr = this.left.exprOf();
            //find argument list
            name = Object.keys(expr)[0];
            if (this.operator === '$eq')
                expr[name][this.left.operator].push(p.$eq);

            else
                expr[name][this.left.operator].push(p);
            //return query expression
            return expr;
        }
        else if (this.left instanceof MemberExpression) {
            p = {};
            //build comparison expression e.g. { $gt:10 }
            if (typeof this.right === 'undefined' || this.right === null)
                p[this.operator] = null;
            else if (typeof this.right.exprOf === 'function') {
                p[this.operator] = (this.right instanceof MemberExpression) ? { $name: this.right.exprOf() } : this.right.exprOf();
            }

            else
                p[this.operator] = this.right;
            name = this.left.name;
            expr = {};
            if (this.operator === '$eq' && !(this.right instanceof MemberExpression))
                expr[name] = p.$eq;

            else
                expr[name] = p;
            //return query expression
            return expr;
        }
    }
    static isComparisonOperator(op) {
        if (typeof op === 'string')
            return (op.match(ComparisonExpression.OperatorRegEx) !== null);
        return false;
    }
}

ComparisonExpression.OperatorRegEx = /^(\$eq|\$ne|\$lte|\$lt|\$gte|\$gt|\$in|\$nin)$/g;

class MethodCallExpression {
    constructor(name, args) {
        /**
         * Gets or sets the name of this method
         * @type {String}
         */
        this.name = name;
        /**
         * Gets or sets an array that represents the method arguments
         * @type {Array}
         */
        this.args = [];
        if (Array.isArray(args))
            this.args = args;
    }
    /**
     * Converts the current method to the equivalent query expression e.g. { orderDate: { $year: [] } } which is equivalent with year(orderDate)
     * @returns {*}
     */
    exprOf() {
        let method = {};
        let name = '$'.concat(this.name);
        //set arguments array
        method[name] = [];
        if (this.args.length === 0)
            throw new Error('Unsupported method expression. Method arguments cannot be empty.');
        //get first argument
        if (this.args[0] instanceof MemberExpression) {
            for (let i = 0; i < this.args.length; i++) {
                let arg = this.args[i];
                if (typeof arg === 'undefined' || arg === null)
                    method[name].push(null);
                else if (typeof arg.exprOf === 'function')
                    method[name].push((arg instanceof MemberExpression) ? { $name: arg.exprOf() } : arg.exprOf());

                else
                    method[name].push(arg);
            }
        }
        else {
            method[name].push.apply(method[name], this.args.map(function (arg) {
                if (typeof arg.exprOf === 'function') {
                    return arg.exprOf();
                }
                return arg;
            }));
        }
        return method;

    }
}

/**
 * @enum
 */
const Operators = {
    Not: '$not',
    Mul: '$mul',
    Div: '$div',
    Mod: '$mod',
    Add: '$add',
    Sub: '$sub',
    Lt: '$lt',
    Gt: '$gt',
    Le: '$lte',
    Ge: '$gte',
    Eq: '$eq',
    Ne: '$ne',
    In: '$in',
    NotIn: '$nin',
    And: '$and',
    Or: '$or',
    BitAnd: '$bit',
};

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
    Operators,
    ArithmeticExpression,
    MemberExpression,
    MethodCallExpression,
    ComparisonExpression,
    LiteralExpression,
    LogicalExpression,
    SequenceExpression,
    ObjectExpression,
    SimpleMethodCallExpression,
    AggregateComparisonExpression,
    SelectAnyExpression,
    OrderByAnyExpression
}

