// MOST Web Framework Codename Blueshift Copyright (c) 2017-2022, THEMOST LP All rights reserved
var _ = require('lodash');
var LangUtils = require("@themost/common").LangUtils;
/**
 * @class
 * @param {*=} p0 The left operand
 * @param {String=} oper The operator
 * @param {*=} p1 The right operand
 * @constructor
 */
function ArithmeticExpression(p0, oper, p1)
{
    this.left = p0;
    this.operator = oper || '$add';
    this.right = p1;
}

ArithmeticExpression.OperatorRegEx = /^(\$add|\$sub|\$mul|\$div|\$mod)$/g;

ArithmeticExpression.prototype.exprOf = function()
{
    var p;
    if (typeof this.left === 'undefined' || this.left===null)
        throw new Error('Expected left operand');
    else if (typeof this.left.exprOf === 'function')
        p = this.left.exprOf();
    else
        p = this.left;
    if (typeof this.operator === 'undefined' || this.operator===null)
        throw new Error('Expected arithmetic operator.');
    if (this.operator.match(ArithmeticExpression.OperatorRegEx)===null)
        throw new Error('Invalid arithmetic operator.');
    //build right operand e.g. { $add:[ 5 ] }
    var r = {};
    if (typeof this.right === 'undefined' || this.right===null) {
        r[this.operator]=[null];
    }
    else if (typeof this.right.exprOf === 'function') {
        if (this.right instanceof MemberExpression) {
            r[this.operator] = [{ "$name": this.right.exprOf() }];
        }
        else {
            r[this.operator] = [this.right.exprOf()];
        }

    }
    else {
        r[this.operator]=[this.right];
    }
    //add left operand e.g { Price: { $add:[ 5 ] } }
    var result = {};
    result[p] = r;
    //return query expression
    return result;
};


/**
 * @class
 * @param {String} name The name of the current member
 * @constructor
 */
function MemberExpression(name) {
    this.name = name;
}
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
    this.operator = oper || '$and' ;
    this.args = args || [];
}

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
    this.value = value;
}
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
    this.left = left;
    this.operator = op || '$eq';
    this.right = right;
}

ComparisonExpression.OperatorRegEx = /^(\$eq|\$ne|\$lte|\$lt|\$gte|\$gt|\$in|\$nin)$/g;

ComparisonExpression.prototype.exprOf = function()
{
    if (typeof this.operator === 'undefined' || this.operator===null)
        throw new Error('Expected comparison operator.');

    var p, expr, name;
    if (this.left instanceof MethodCallExpression)
    {
        p = {};
        if (typeof this.right === 'undefined' || this.right===null)
            p[this.operator]=null;
        else if (typeof this.right.exprOf === 'function')
            p[this.operator] = (this.right instanceof MemberExpression) ? { $name:this.right.exprOf() } : this.right.exprOf();
        else
            p[this.operator]=this.right;

        if (this.operator==='$eq')
            this.left.args.push(p.$eq);
        else
            this.left.args.push(p);
        //return query expression
        return this.left.exprOf();
    }
    else if (this.left instanceof ArithmeticExpression)
    {
        p = {};
        //build comparison expression e.g. { $gt:10 }
        if (typeof this.right === 'undefined' || this.right===null)
            p[this.operator]=null;
        else if (typeof this.right.exprOf === 'function')
            p[this.operator] = (this.right instanceof MemberExpression) ? { $name:this.right.exprOf() } : this.right.exprOf();
        else
            p[this.operator]=this.right;

        //get left expression
        expr = this.left.exprOf();
        //find argument list
        name = Object.keys(expr)[0];
        if (this.operator==='$eq')
            expr[name][this.left.operator].push(p.$eq);
        else
            expr[name][this.left.operator].push(p);
        //return query expression
        return expr;
    }
    else if (this.left instanceof MemberExpression)
    {
        p = {};
        //build comparison expression e.g. { $gt:10 }
        if (typeof this.right === 'undefined' || this.right===null)
            p[this.operator]=null;
        else if (typeof this.right.exprOf === 'function') {
            p[this.operator] = (this.right instanceof MemberExpression) ? { $name:this.right.exprOf() } : this.right.exprOf();
        }
        else
            p[this.operator]=this.right;
        name = this.left.name;
        expr = {};
        if (this.operator==='$eq' && !(this.right instanceof MemberExpression))
            expr[name]=p.$eq;
        else
            expr[name] = p;
        //return query expression
        return expr;
    }
};

/**
 * Creates a method call expression
 * @class
 * @constructor
 */
function MethodCallExpression(name, args) {
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
/**
 * Converts the current method to the equivalent query expression e.g. { orderDate: { $year: [] } } which is equivalent with year(orderDate)
 * @returns {*}
 */
MethodCallExpression.prototype.exprOf = function() {
    var method = {};
    var result = {};
    var name = '$'.concat(this.name);
    //set arguments array
    method[name] = [] ;
    if (this.args.length===0)
        throw new Error('Unsupported method expression. Method arguments cannot be empty.');
    //get first argument
    if (this.args[0] instanceof MemberExpression) {
        var member = this.args[0].name;
        for (var i = 1; i < this.args.length; i++)
        {
            var arg = this.args[i];
            if (typeof arg === 'undefined' || arg===null)
                method[name].push(null);
            else if (typeof arg.exprOf === 'function')
                method[name].push((arg instanceof MemberExpression) ? { $name:arg.exprOf() } : arg.exprOf());
            else
                method[name].push(arg);
        }
        result[member] = method;
        return result;
    }
    else {
        throw new Error('Unsupported method expression. The first argument of a method expression must be always a MemberExpression.');
    }

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

function SequenceExpression() {
    this.value = [];
}

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
    //
}
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
    this.expression = expr;
    this.as = alias;
}
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
    this.expression = expr;
    this.direction = direction || 'asc';
}
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

if (typeof exports !== 'undefined')
{
    module.exports.Operators =  Operators;
    module.exports.ArithmeticExpression =  ArithmeticExpression;
    module.exports.MemberExpression =  MemberExpression;
    module.exports.MethodCallExpression =  MethodCallExpression;
    module.exports.ComparisonExpression =  ComparisonExpression;
    module.exports.LiteralExpression =  LiteralExpression;
    module.exports.LogicalExpression =  LogicalExpression;
    module.exports.SwitchExpression =  SwitchExpression;
    module.exports.SequenceExpression =  SequenceExpression;
    module.exports.ObjectExpression =  ObjectExpression;
    module.exports.SimpleMethodCallExpression =  SimpleMethodCallExpression;
    module.exports.AggregateComparisonExpression =  AggregateComparisonExpression;
    module.exports.AnyExpressionFormatter =  AnyExpressionFormatter;
    module.exports.SelectAnyExpression =  SelectAnyExpression;
    module.exports.OrderByAnyExpression =  OrderByAnyExpression;

    /**
     * @param {*=} left The left operand
     * @param {string=} operator The operator
     * @param {*=} right The right operand
     * @returns ArithmeticExpression
     */
    module.exports.createArithmeticExpression = function(left, operator, right) {
        return new ArithmeticExpression(left, operator, right);
    };
    /**
     * @param {*=} left The left operand
     * @param {string=} operator The operator
     * @param {*=} right The right operand
     * @returns ComparisonExpression
     */
    module.exports.createComparisonExpression = function(left, operator, right) {
        return new ComparisonExpression(left, operator, right);
    };
    /**
     * @param {String=} name A string that represents the member's name
     * @returns MemberExpression
     */
    module.exports.createMemberExpression = function(name) {
        return new MemberExpression(name);
    };
    /**
     * @param {*=} value The literal value
     * @returns LiteralExpression
     */
    module.exports.createLiteralExpression = function(value) {
        return new LiteralExpression(value);
    };
    /**
     * Creates a method call expression of the given name with an array of arguments
     * @param {String} name
     * @param {Array} args
     * @returns {MethodCallExpression}
     */
    module.exports.createMethodCallExpression = function(name, args) {
        return new MethodCallExpression(name, args);
    };
    /**
     * Creates a logical expression
     * @param {String} operator The logical operator
     * @param {Array=} args An array that represents the expression's arguments
     * @returns {LogicalExpression}
     */
    module.exports.createLogicalExpression = function(operator, args) {
        return new LogicalExpression(operator, args);
    };
    /**
     * Gets a boolean value that indicates whether or not the given object is an ArithmeticExpression instance.
     * @param obj
     * @returns boolean
     */
    module.exports.isArithmeticExpression = function(obj) {
        return obj instanceof ArithmeticExpression;
    };
    /**
     * Gets a boolean value that indicates whether or not the given operator is an arithmetic operator.
     * @param {String} op
     */
    module.exports.isArithmeticOperator = function(op) {
        if (typeof op === 'string')
            return (op.match(ArithmeticExpression.OperatorRegEx)!==null);
        return false;
    };
    /**
     * Gets a boolean value that indicates whether or not the given operator is an arithmetic operator.
     * @param {string} op
     * @returns boolean
     */
    module.exports.isComparisonOperator = function(op) {
        if (typeof op === 'string')
            return (op.match(ComparisonExpression.OperatorRegEx)!==null);
        return false;
    };
    /**
     * Gets a boolean value that indicates whether or not the given operator is a logical operator.
     * @param {string} op
     * @returns boolean
     */
    module.exports.isLogicalOperator = function(op) {
        if (typeof op === 'string')
            return (op.match(LogicalExpression.OperatorRegEx)!==null);
        return false;
    };
    /**
     * Gets a boolean value that indicates whether or not the given object is an LogicalExpression instance.
     * @param {*} obj
     * @returns boolean
     */
    module.exports.isLogicalExpression = function(obj) {
        return obj instanceof LogicalExpression;
    };
    /**
     * Gets a boolean value that indicates whether or not the given object is an ComparisonExpression instance.
     * @param {*} obj
     * @returns boolean
     */
    module.exports.isComparisonExpression = function(obj) {
        return obj instanceof ComparisonExpression;
    };
    /**
     * Gets a boolean value that indicates whether or not the given object is an MemberExpression instance.
     * @param {*} obj
     * @returns boolean
     */
    module.exports.isMemberExpression = function(obj) {
        return obj instanceof MemberExpression;
    };
    /**
     * Gets a boolean value that indicates whether or not the given object is an LiteralExpression instance.
     * @param {*} obj
     * @returns boolean
     */
    module.exports.isLiteralExpression = function(obj) {
        return obj instanceof LiteralExpression;
    };
    /**
     * Gets a boolean value that indicates whether or not the given object is an MemberExpression instance.
     * @param {*} obj
     * @returns boolean
     */
    module.exports.isMethodCallExpression = function(obj) {
        return obj instanceof MethodCallExpression;
    }

}