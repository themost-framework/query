// MOST Web Framework Codename Blueshift Copyright (c) 2017-2022, THEMOST LP All rights reserved
var _ = require('lodash');
var {LangUtils} = require("@themost/common");

/**
 * @class
 */
function Expression() {
    //
}

/**
 * @abstract
 */
Expression.prototype.exprOf = function() {
    throw new Error('Class does not implement inherited abstract method.');
}

/**
 * @class
 * @param {*=} p0 The left operand
 * @param {String=} oper The operator
 * @param {*=} p1 The right operand
 * @constructor
 */
function ArithmeticExpression(p0, oper, p1)
{
    // noinspection JSUnresolvedReference
    ArithmeticExpression.super_.call(this);
    this.left = p0;
    this.operator = oper || '$add';
    this.right = p1;
}
LangUtils.inherits(ArithmeticExpression, Expression);

ArithmeticExpression.OperatorRegEx = /^(\$add|\$sub|\$mul|\$div|\$mod)$/g;

ArithmeticExpression.prototype.exprOf = function()
{
    if (this.left == null) {
        throw new Error('Expected left operand');
    }
    if (this.operator == null)
        throw new Error('Expected arithmetic operator.');
    if (this.operator.match(ArithmeticExpression.OperatorRegEx) == null) {
        throw new Error('Invalid arithmetic operator.');
    }
    //build right operand e.g. { $add:[ 5 ] }
    var result = {};
    Object.defineProperty(result, this.operator, {
        value: [
            (this.left != null) ? (typeof this.left.exprOf === 'function' ? this.left.exprOf() : this.left) : null,
            (this.right != null) ? (typeof this.right.exprOf === 'function' ? this.right.exprOf() : this.right) : null,
        ],
        enumerable: true,
        configurable: true
    });
    //return query expression
    return result;
};

/**
 * @class
 * @param {String} name The name of the current member
 * @constructor
 */
function MemberExpression(name) {
    // noinspection JSUnresolvedReference
    MemberExpression.super_.call(this);
    this.name = name;
}
LangUtils.inherits(MemberExpression, Expression);

MemberExpression.prototype.exprOf = function() {
    return {
        $name: this.name
    };
};


/**
 * @class
 * @constructor
 * @param {string} oper
 * @param {*} args
 */
function LogicalExpression(oper, args) {
    // noinspection JSUnresolvedReference
    LogicalExpression.super_.call(this);
    this.operator = oper || '$and' ;
    this.args = args || [];
}
LangUtils.inherits(LogicalExpression, Expression);

LogicalExpression.OperatorRegEx = /^(\$and|\$or|\$not|\$nor)$/g;

LogicalExpression.prototype.exprOf = function() {
    if (this.operator.match(LogicalExpression.OperatorRegEx)===null)
        throw new Error('Invalid logical operator.');
    if (!_.isArray(this.args))
        throw new Error('Logical expression arguments cannot be null at this context.');
    if (this.args.length===0)
        throw new Error('Logical expression arguments cannot be empty.');
    var p = {};
    p[this.operator] = [];
    for (var i = 0; i < this.args.length; i++) {
        var arg = this.args[i];
        if (typeof arg === 'undefined' || arg===null)
            p[this.operator].push(null);
        else if (typeof arg.exprOf === 'function')
            p[this.operator].push(arg.exprOf());
        else
            p[this.operator].push(arg);
    }
    return p;
};

/**
 * @class
 * @param {*} value The literal value
 * @constructor
 */
function LiteralExpression(value) {
    // noinspection JSUnresolvedReference
    LiteralExpression.super_.call(this);
    this.value = value;
}
LangUtils.inherits(LiteralExpression, Expression);

LiteralExpression.prototype.exprOf = function() {
    if (typeof this.value === 'undefined')
        return null;
    return this.value;
};


/**
 * @class
 * @param {*} left
 * @param {string=} op
 * @param {*=} right
 * @constructor
 */
function ComparisonExpression(left, op, right)
{
    // noinspection JSUnresolvedReference
    ComparisonExpression.super_.call(this);
    this.left = left;
    this.operator = op || '$eq';
    this.right = right;
}

ComparisonExpression.OperatorRegEx = /^(\$eq|\$ne|\$lte|\$lt|\$gte|\$gt|\$in|\$nin|\$bit)$/g;

ComparisonExpression.prototype.exprOf = function()
{
    if (typeof this.operator === 'undefined' || this.operator===null)
        throw new Error('Expected comparison operator.');

    var result = {};
    Object.defineProperty(result, this.operator, {
        configurable: true,
        enumerable: true,
        value: [
            (this.left != null) ? (typeof this.left.exprOf === 'function' ? this.left.exprOf() : this.left) : null,
            (this.right != null) ? (typeof this.right.exprOf === 'function' ? this.right.exprOf() : this.right) : null
        ]
    });
    return result;
};
LangUtils.inherits(ComparisonExpression, Expression);

/**
 * Creates a method call expression
 * @class
 * @constructor
 */
function MethodCallExpression(name, args) {
    // noinspection JSUnresolvedReference
    MethodCallExpression.super_.call(this);
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
    if (_.isArray(args))
        this.args = args;
}
LangUtils.inherits(MethodCallExpression, Expression);
/**
 * Converts the current method to the equivalent query expression e.g. { orderDate: { $year: [] } } which is equivalent with year(orderDate)
 * @returns {*}
 */
MethodCallExpression.prototype.exprOf = function() {
    var method = {};
    var name = '$'.concat(this.name);
    //set arguments array
    method[name] = [] ;
    if (this.args.length===0)
        throw new Error('Unsupported method expression. Method arguments cannot be empty.');
    method[name].push.apply(method[name], this.args.map(function (arg) {
        if (typeof arg.exprOf === 'function') {
            return arg.exprOf();
        }
        return arg;
    }));
    return method;
};

/**
 * @enum
 */
function Operators() {

}

Operators.Not = '$not';
Operators.Mul = '$mul';
Operators.Div = '$div';
Operators.Mod = '$mod';
Operators.Add = '$add';
Operators.Sub = '$sub';
Operators.Lt = '$lt';
Operators.Gt = '$gt';
Operators.Le = '$lte';
Operators.Ge = '$gte';
Operators.Eq = '$eq';
Operators.Ne = '$ne';
Operators.In = '$in';
Operators.NotIn = '$nin';
Operators.And = '$and';
Operators.Or = '$or';
Operators.BitAnd = '$bit';

function SequenceExpression() {
    // noinspection JSUnresolvedReference
    SequenceExpression.super_.call(this);
    this.value = [];
}
LangUtils.inherits(SequenceExpression, Expression);

SequenceExpression.prototype.exprOf = function() {
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
            var name = currentValue.name.split('.');
            var previousName = name[name.length - 1] + currentIndex.toString();
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

function ObjectExpression() {
    // noinspection JSUnresolvedReference
    ObjectExpression.super_.call(this);
}
LangUtils.inherits(ObjectExpression, Expression);

ObjectExpression.prototype.exprOf = function() {
    var finalResult = {};
    var thisArg = this;
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


function SimpleMethodCallExpression(name, args) {
    // noinspection JSUnresolvedReference
    SimpleMethodCallExpression.super_.call(this, name, args);
}
LangUtils.inherits(SimpleMethodCallExpression, MethodCallExpression);

/**
 * Converts the current method to the equivalent query expression e.g. { orderDate: { $year: [] } } which is equivalent with year(orderDate)
 * @returns {*}
 */
 SimpleMethodCallExpression.prototype.exprOf = function() {
    var method = {};
    var name = '$'.concat(this.name);
    //set arguments array
    if (this.args.length === 0)
        throw new Error('Unsupported method expression. Method arguments cannot be empty.');
    if (this.args.length === 1) {
        method[name] = {};
        var arg;
        if (typeof this.args[0].exprOf === 'function') {
            arg = this.args[0].exprOf();
        } else {
            arg = this.args[0];
        }
        if (typeof arg === 'string') {
            Object.assign(method[name], {
                $name: arg
            });    
        } else {
            Object.assign(method[name], arg);
        }
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


function AggregateComparisonExpression(left, op, right) {
    // noinspection JSUnresolvedReference
    AggregateComparisonExpression.super_.call(this, left, op, right);
}
LangUtils.inherits(AggregateComparisonExpression, ComparisonExpression)

/**
 * Converts the current method to the equivalent query expression e.g. { orderDate: { $year: [] } } which is equivalent with year(orderDate)
 * @returns {*}
 */
 AggregateComparisonExpression.prototype.exprOf = function() {
    var result = {};
    result[this.operator] = [
        (typeof this.left.exprOf === 'function') ? this.left.exprOf() : this.left,
        (typeof this.right.exprOf === 'function') ? this.right.exprOf() : this.right
    ];
    return result;
}


function SwitchExpression(branches, defaultValue) {
    // noinspection JSUnresolvedReference
    SwitchExpression.super_.call(this, 'switch', [
        {
            branches: branches,
            default: defaultValue
        }
    ]);
}
LangUtils.inherits(SwitchExpression, MethodCallExpression);

SwitchExpression.prototype.exprOf = function() {
    var res = {};
    var name = '$'.concat(this.name);
    Object.defineProperty(res, name, {
        configurable: true,
        enumerable: true,
        writable: true,
        value: this.args[0]
    });
    return res;
}

function SelectAnyExpression(expr, alias) {
    // noinspection JSUnresolvedReference
    SelectAnyExpression.super_.call(this);
    this.expression = expr;
    this.as = alias;
}
LangUtils.inherits(SelectAnyExpression, Expression);

SelectAnyExpression.prototype.exprOf = function() {
    if (this.as != null) {
        var res = {};
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


function AnyExpressionFormatter() {
    //
}
/**
 * @type {ExpressionBase}
 */
 AnyExpressionFormatter.prototype.format = function(expr) {
    return expr.exprOf();
}
/**
 * @type {Array<ExpressionBase>}
 */
 AnyExpressionFormatter.prototype.formatMany = function(expr) {
    return expr.map(function(item) {
        return item.exprOf();
    });
}

function OrderByAnyExpression(expr, direction) {
    // noinspection JSUnresolvedReference
    OrderByAnyExpression.super_.call(this);
    this.expression = expr;
    this.direction = direction || 'asc';
}
LangUtils.inherits(OrderByAnyExpression, Expression);

OrderByAnyExpression.prototype.exprOf = function() {
    var res = {};
    Object.defineProperty(res, '$' + (this.direction || 'asc'), {
        configurable: true,
        enumerable: true,
        writable: true,
        value: this.expression.exprOf()
    });
    return res;
}

/**
 * @param {*=} left The left operand
 * @param {string=} operator The operator
 * @param {*=} right The right operand
 * @returns ArithmeticExpression
 */
function createArithmeticExpression(left, operator, right) {
    return new ArithmeticExpression(left, operator, right);
}

/**
 * @param {*=} left The left operand
 * @param {string=} operator The operator
 * @param {*=} right The right operand
 * @returns ComparisonExpression
 */
function createComparisonExpression(left, operator, right) {
    return new ComparisonExpression(left, operator, right);
}

/**
 * @param {String=} name A string that represents the member's name
 * @returns MemberExpression
 */
function createMemberExpression(name) {
    return new MemberExpression(name);
}

/**
 * @param {*=} value The literal value
 * @returns LiteralExpression
 */
function createLiteralExpression(value) {
    return new LiteralExpression(value);
}

/**
 * Creates a method call expression of the given name with an array of arguments
 * @param {String} name
 * @param {Array} args
 * @returns {MethodCallExpression}
 */
function createMethodCallExpression(name, args) {
    return new MethodCallExpression(name, args);
}
/**
 * Creates a logical expression
 * @param {String} operator The logical operator
 * @param {Array=} args An array that represents the expression's arguments
 * @returns {LogicalExpression}
 */
function createLogicalExpression(operator, args) {
    return new LogicalExpression(operator, args);
}
/**
 * Gets a boolean value that indicates whether the given object is an ArithmeticExpression instance.
 * @param obj
 * @returns boolean
 */
function isArithmeticExpression(obj) {
    return obj instanceof ArithmeticExpression;
}
/**
 * Gets a boolean value that indicates whether the given operator is an arithmetic operator.
 * @param {String} op
 */
function isArithmeticOperator(op) {
    if (typeof op === 'string')
        return (op.match(ArithmeticExpression.OperatorRegEx) !== null);
    return false;
}
/**
 * Gets a boolean value that indicates whether the given operator is an arithmetic operator.
 * @param {string} op
 * @returns boolean
 */
function isComparisonOperator(op) {
    if (typeof op === 'string')
        return (op.match(ComparisonExpression.OperatorRegEx) !== null);
    return false;
}
/**
 * Gets a boolean value that indicates whether the given operator is a logical operator.
 * @param {string} op
 * @returns boolean
 */
function isLogicalOperator(op) {
    if (typeof op === 'string')
        return (op.match(LogicalExpression.OperatorRegEx) !== null);
    return false;
}
/**
 * Gets a boolean value that indicates whether the given object is an LogicalExpression instance.
 * @param {*} obj
 * @returns boolean
 */
function isLogicalExpression(obj) {
    return obj instanceof LogicalExpression;
}
/**
 * Gets a boolean value that indicates whether the given object is an ComparisonExpression instance.
 * @param {*} obj
 * @returns boolean
 */
function isComparisonExpression(obj) {
    return obj instanceof ComparisonExpression;
}
/**
 * Gets a boolean value that indicates whether the given object is an MemberExpression instance.
 * @param {*} obj
 * @returns boolean
 */
function isMemberExpression(obj) {
    return obj instanceof MemberExpression;
}
/**
 * Gets a boolean value that indicates whether the given object is an LiteralExpression instance.
 * @param {*} obj
 * @returns boolean
 */
function isLiteralExpression(obj) {
    return obj instanceof LiteralExpression;
}
/**
 * Gets a boolean value that indicates whether the given object is an MemberExpression instance.
 * @param {*} obj
 * @returns boolean
 */
function isMethodCallExpression(obj) {
    return obj instanceof MethodCallExpression;
}

if (typeof exports !== 'undefined')
{
    module.exports = {
        Expression,
        Operators,
        ArithmeticExpression,
        MemberExpression,
        MethodCallExpression,
        ComparisonExpression,
        LiteralExpression,
        LogicalExpression,
        SwitchExpression,
        SequenceExpression,
        ObjectExpression,
        SimpleMethodCallExpression,
        AggregateComparisonExpression,
        AnyExpressionFormatter,
        SelectAnyExpression,
        OrderByAnyExpression,
        createArithmeticExpression,
        createComparisonExpression,
        createMemberExpression,
        createLiteralExpression,
        createMethodCallExpression,
        createLogicalExpression,
        isArithmeticExpression,
        isArithmeticOperator,
        isComparisonOperator,
        isLogicalOperator,
        isLogicalExpression,
        isComparisonExpression,
        isMemberExpression,
        isLiteralExpression,
        isMethodCallExpression
    }
}
