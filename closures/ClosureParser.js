// MOST Web Framework 2.0 Codename Blueshift Copyright (c) 2017-2020, THEMOST LP All rights reserved
var expressions = require('../expressions');
var LiteralExpression = expressions.LiteralExpression;
var ObjectExpression = expressions.ObjectExpression;
var Operators = expressions.Operators;
var SequenceExpression = expressions.SequenceExpression;
var MemberExpression = expressions.MemberExpression;
var ArithmeticExpression = expressions.ArithmeticExpression;
var LogicalExpression = expressions.LogicalExpression;
var ComparisonExpression = expressions.ComparisonExpression;
var MethodCallExpression = expressions.MethodCallExpression;
var isArithmeticOperator = expressions.isArithmeticOperator;
var isComparisonOperator = expressions.isComparisonOperator;

var parse = require('esprima').parse;
var Args = require('@themost/common').Args;
var DateMethodParser = require('./DateMethodParser').DateMethodParser;
var StringMethodParser = require('./StringMethodParser').StringMethodParser;
var MathMethodParser = require('./MathMethodParser').MathMethodParser;
var FallbackMethodParser = require('./FallbackMethodParser').FallbackMethodParser;


var ExpressionTypes = {
    LogicalExpression : 'LogicalExpression',
    BinaryExpression: 'BinaryExpression',
    MemberExpression: 'MemberExpression',
    MethodExpression: 'MethodExpression',
    Identifier: 'Identifier',
    Literal: 'Literal',
    Program: 'Program',
    ExpressionStatement : 'ExpressionStatement',
    UnaryExpression:'UnaryExpression',
    FunctionExpression:'FunctionExpression',
    BlockStatement:'BlockStatement',
    ReturnStatement:'ReturnStatement',
    CallExpression:'CallExpression',
    ObjectExpression:'ObjectExpression',
    SequenceExpression:'SequenceExpression'
};

// noinspection JSCommentMatchesSignature
/**
 * @param {...*} args
 * @returns {number}
 */
function count() {
    return arguments.length;
}

/**
 *
 * @param {*} n
 * @param {number=} precision
 * @returns {number}
 */
function round(n, precision) {
    if (typeof n !== 'number') {
        return 0;
    }
    if (precision) {
        return parseFloat(n.toFixed(precision))
    }
    return Math.round(n);
}

// noinspection JSCommentMatchesSignature
/**
 * @param {...*} args
 * @returns {number}
 */
function min() {
    var args = Array.from(arguments);
    var sortAsc = function(a, b) {
        if (a < b) {
            return -1;
        }
        if (a > b) {
            return 1;
        }
        return 0;
    }
    if (args.length === 1) {
        if (Array.isArray(args[0])) {
            return args[0].sort(sortAsc)[0];
        }
        return args[0];
    }
    return args.sort(sortAsc)[0];
}

// noinspection JSCommentMatchesSignature
/**
 * @param {...*} args
 * @returns {number}
 */
function max() {
    var args = Array.from(arguments);
    var sortDesc = function(a, b) {
        if (a < b) {
            return 1;
        }
        if (a > b) {
            return -1;
        }
        return 0;
    }
    if (args.length === 1) {
        if (Array.isArray(args[0])) {
            return args[0].sort(sortDesc)[0];
        }
        return args[0];
    }
    return args.sort(sortDesc)[0];
}

// noinspection JSCommentMatchesSignature
/**
 * @param {...*} args
 * @returns {number}
 */
function sum() {

    var reducer = function(accumulator, currentValue) {
        return accumulator + currentValue;
    }
    var args = Array.from(arguments);
    if (args.length === 1) {
        if (Array.isArray(args[0])) {
            return args[0].reduce(reducer);
        }
        return args[0];
    }
    return args.reduce(reducer);
}

// noinspection JSCommentMatchesSignature
/**
 * @param {...*} args
 * @returns {number}
 */
function mean() {

    var reducer = function(accumulator, currentValue) {
        return accumulator + currentValue;
    }
    var args = Array.from(arguments);
    if (args.length === 1) {
        if (Array.isArray(args[0])) {
            if (args[0].length === 0) {
                return 0;
            }
            return args[0].reduce(reducer) / args[0].length;
        }
        return args[0];
    }
    if (args.length === 0) {
        return 0;
    }
    return args.reduce(reducer) / args.length;
}

/**
 * @class
 * @constructor
 */
function ClosureParser() {
    /**
     * @type Array
     */
    this.namedParams = [];
    /**
     * @type {*}
     */
    this.parsers = [
        new MathMethodParser(),
        new DateMethodParser(),
        new StringMethodParser(),
        new FallbackMethodParser()
    ];
    this.params = null;
}

/**
 * Parses a javascript expression and returns the equivalent select expression.
 * @param {Function} func The closure expression to parse
 * @param {*} params An object which represents closure parameters
 */
ClosureParser.prototype.parseSelect = function(func, params) {
    if (func == null) {
        return;
    }
    this.params = params;
    Args.check(typeof func === 'function', new Error('Select closure must a function.'));
    //convert the given function to javascript expression
    var expr = parse('void(' + func.toString() + ')');
    //validate expression e.g. return [EXPRESSION];
    var funcExpr = expr.body[0].expression.argument;
    //get named parameters
    this.namedParams = funcExpr.params;
    var res = this.parseCommon(funcExpr.body);
    if (res && res instanceof SequenceExpression) {
        return res.value.map( function(x) {
            return x.exprOf();
        });
    }
    if (res && res instanceof MemberExpression) {
        return [ res.exprOf() ];
    }
    if (res && res instanceof ObjectExpression) {
        return Object.keys(res).map( function(key) {
            if (Object.prototype.hasOwnProperty.call(res, key)) {
                var result = {};
                Object.defineProperty(result, key, {
                    configurable: true,
                    enumerable: true,
                    writable: true,
                    value: res[key].exprOf()
                })
                return result;
            }
        });
    }
    throw new Error('Invalid select closure');
}

/**
 * Parses a javascript expression and returns the equivalent QueryExpression instance.
 * @param {Function} func The closure expression to parse
 * @param {*} params An object which represents closure parameters
 */
ClosureParser.prototype.parseFilter = function(func, params) {
    var self = this;
    if (func == null) {
        return;
    }
    this.params = params;
    //convert the given function to javascript expression
    var expr = parse('void(' + func.toString() + ')');
    //get FunctionExpression
    var fnExpr = expr.body[0].expression.argument;
    if (fnExpr == null) {
        throw new Error('Invalid closure statement. Closure expression cannot be found.');
    }
    //get named parameters
    self.namedParams = fnExpr.params;
    //validate expression e.g. return [EXPRESSION];
    if (fnExpr.body.type === ExpressionTypes.MemberExpression) {
        return this.parseMember(fnExpr.body);
    }
    //validate expression e.g. return [EXPRESSION];
    if (fnExpr.body.body[0].type!==ExpressionTypes.ReturnStatement) {
        throw new Error('Invalid closure syntax. A closure expression must return a value.');
    }
    var closureExpr =  fnExpr.body.body[0].argument;
    //parse this expression
    var result = this.parseCommon(closureExpr);
    //and finally return the equivalent query expression
    if (result && typeof result.exprOf === 'function') {
        return result.exprOf();
    }
}

ClosureParser.prototype.parseCommon = function(expr) {
    if (expr.type === ExpressionTypes.LogicalExpression) {
        return this.parseLogical(expr);
    }
    else if (expr.type === ExpressionTypes.BinaryExpression) {
        return this.parseBinary(expr);
    }
    else if (expr.type === ExpressionTypes.Literal) {
        return this.parseLiteral(expr);
    }
    else if (expr.type === ExpressionTypes.MemberExpression) {
        return this.parseMember(expr);
    }
    else if (expr.type === ExpressionTypes.CallExpression) {
        return this.parseMethod(expr);
    }
    else if (expr.type === ExpressionTypes.Identifier) {
        return this.parseIdentifier(expr);
    }
    else if (expr.type === ExpressionTypes.BlockStatement) {
        return this.parseBlock(expr);
    }
    throw new Error('The given expression type (' + expr.type + 'is invalid or it has not implemented yet.');
}

/**
 * Parses an object expression e.g. { "createdAt": x.dateCreated }
 * @param {*} objectExpression
 */
ClosureParser.prototype.parseObject = function(objectExpression) {
    var self =this;
    if (objectExpression == null) {
        throw new Error('Object expression may not be null');
    }
    if (objectExpression.type !== ExpressionTypes.ObjectExpression) {
        throw new Error('Invalid expression type. Expected an object expression.');
    }
    if (Array.isArray(objectExpression.properties) === false) {
        throw new Error('Object expression properties must be an array.');
    }
    var finalResult = new ObjectExpression();
    objectExpression.properties.forEach( function(property) {
        var value = self.parseCommon(property.value);
        var name;
        if (property.key == null) {
            throw new Error('Property key may not be null.');
        }
        if (property.key && property.key.type === 'Literal') {
            name = property.key.value;
        }
        else if (property.key && property.key.type === 'Identifier') {
            name = property.key.name;
        }
        else {
            throw new Error('Invalid property key type. Expected Literal or Identifier. Found ' + property.key.type + '.');
        }
        Object.defineProperty(finalResult, name, {
            value: value,
            enumerable: true,
            configurable: true
        });
    });
    return finalResult;
}

/**
 * Parses a sequence expression e.g. { x.id, x.dateCreated }
 * @param {*} sequenceExpression
 */
ClosureParser.prototype.parseSequence = function(sequenceExpression) {
    var self =this;
    if (sequenceExpression == null) {
        throw new Error('Sequence expression may not be null');
    }
    if (sequenceExpression.type !== ExpressionTypes.SequenceExpression) {
        throw new Error('Invalid expression type. Expected an object expression.');
    }
    if (Array.isArray(sequenceExpression.expressions) === false) {
        throw new Error('Sequence expression expressions must be an array.');
    }
    var finalResult = new SequenceExpression();
    sequenceExpression.expressions.forEach( function(expression) {
        finalResult.value.push(self.parseCommon(expression));
    });
    return finalResult;
}


ClosureParser.prototype.parseBlock = function(expr) {
    var self = this;
    // get expression statement
    var bodyExpression = expr.body[0];
    if (bodyExpression.type === ExpressionTypes.ExpressionStatement) {
        if (bodyExpression.expression && bodyExpression.expression.type === 'SequenceExpression') {
            return self.parseSequence(bodyExpression.expression);
        }
        else if (bodyExpression.expression && bodyExpression.expression.type === 'MemberExpression') {
            return self.parseMember(bodyExpression.expression);
        }
    }
    else if (bodyExpression.type === ExpressionTypes.ReturnStatement) {
        // get return statement
        var objectExpression = bodyExpression.argument;
        if (objectExpression && objectExpression.type === ExpressionTypes.ObjectExpression) {
            return self.parseObject(objectExpression);
        }
    }
    throw new Error('The given expression is not yet implemented (' + expr.type + ').');
}

ClosureParser.prototype.parseLogical = function(expr) {
    var self = this;
    var op = (expr.operator === '||') ? Operators.Or : Operators.And;
    // validate operands
    if (expr.left == null || expr.right == null) {
        throw new Error('Invalid logical expression. Left or right operand is missing or undefined.');
    }
    else {
        var left = self.parseCommon(expr.left);
        var right = self.parseCommon(expr.right);
        // create expression
        return new LogicalExpression(op, [left, right]);
    }
}

/**
 * @static
 * @param {string} binaryOperator
 * @returns {*}
 */
ClosureParser.binaryToExpressionOperator = function(binaryOperator) {
    switch (binaryOperator) {
        case '===':
        case '==':
            return Operators.Eq;
        case '!=':
        case '!==':
            return Operators.Ne;
        case '>':
            return Operators.Gt;
        case '>=':
            return Operators.Ge;
        case '<':
            return Operators.Lt;
        case '<=':
            return Operators.Le;
        case '-':
            return Operators.Sub;
        case '+':
            return Operators.Add;
        case '*':
            return Operators.Mul;
        case '/':
            return Operators.Div;
        case '%':
            return Operators.Mod;
        case '&':
            return Operators.BitAnd;
        default:
            return;
    }
}

ClosureParser.prototype.parseBinary = function(expr) {
    var self = this;
    var op = ClosureParser.binaryToExpressionOperator(expr.operator);
    if (op == null) {
        throw new Error('Invalid binary operator.');
    }
    else {

        var left = self.parseCommon(expr.left);
        var right = self.parseCommon(expr.right);
        if (isArithmeticOperator(op)) {
            //validate arithmetic arguments
            if (left instanceof LiteralExpression && right instanceof LiteralExpression) {
                //evaluate expression
                switch (op) {
                    case Operators.Add:
                        return left.value + right.value;
                    case Operators.Sub:
                        return left.value - right.value;
                    case Operators.Div:
                        return left.value / right.value;
                    case Operators.Mul:
                        return left.value * right.value;
                    case Operators.Mod:
                        return left.value % right.value;
                    case Operators.BitAnd:
                        return left.value & right.value;
                    default:
                        throw new Error('Invalid arithmetic operator');
                }
            }
            else {
                var finalExpr = new ArithmeticExpression(left, op, right);
                return finalExpr;
            }
        }
        else if (isComparisonOperator(op)) {
            return new ComparisonExpression(left, op, right);
        }
        else {
            throw new Error('Unsupported binary expression');
        }
    }

}

ClosureParser.prototype.parseMember = function(expr) {
    var self = this;
    if (expr.property) {
        var namedParam = self.namedParams[0];
        if (namedParam == null) {
            throw new Error('Invalid or missing closure parameter');
        }
        if (expr.object.name===namedParam.name) {
            var member = self.resolveMember(expr.property.name);
            return new MemberExpression(member);
        }
        else {
            var value;
            if (expr.object.object == null) {
                //evaluate object member value e.g. item.title or item.status.id
                value = memberExpressionToString(expr);
                return new MemberExpression(value);
            }
            if (expr.object.object.name===namedParam.name) {
                //get closure parameter expression e.g. x.title.length
                var property = expr.property.name;
                var result = self.parseMember(expr.object);
                return new MethodCallExpression(property, [result]);
            }
            else {
                //evaluate object member value e.g. item.title or item.status.id
                value = self.eval(memberExpressionToString(expr));
                return new LiteralExpression(value);
            }

        }
    }
    else {
        throw new Error('Invalid member expression.');
    }
}

/**
 * @private
 * @param {*} expr
 */
ClosureParser.prototype.parseMethodCall = function(expr) {
    var self = this;
    if (expr.callee.object == null) {
        throw new Error('Invalid or unsupported method expression.');
    }
    var method = expr.callee.property.name;
    var result = self.parseMember(expr.callee.object);
    var args = [result];
    expr.arguments.forEach( function(arg) {
        args.push(self.parseCommon(arg));
    });

    var createMethodCall = self.parsers.map( function(parser) {
        return parser.test(method);
    }).find( function(m) {
        return typeof m === 'function';
    });
    if (typeof createMethodCall === 'function') {
        return createMethodCall(args);
    }
    throw new Error('The specified method ('+ method +') is unsupported or is not yet implemented.');
}

ClosureParser.prototype.parseMethod = function(expr) {

    var self = this;
    var name;
    // if callee is a sequence expression e.g. round(x.price, 4)
    // where round is something like import { round } from 'mathjs';
    if (expr.callee && expr.callee.type === ExpressionTypes.SequenceExpression) {
        // search argument for an expression of type StaticMemberExpression
        var findExpression = expr.callee.expressions.find( function(expression) {
            return expression.type === ExpressionTypes.MemberExpression;
        });
        if (findExpression == null) {
            // throw error
            throw new Error('CallExpression has an invalid syntax. Expected a valid callee member expression.');
        } else {
            name = memberExpressionToString(findExpression);
        }
    }
    else {
        name = expr.callee.name;
    }
    var args = [];
    var needsEvaluation = true;
    var thisName;
    if (name == null) {
        if (expr.callee.object != null) {
            if (expr.callee.object.object != null) {
                if (expr.callee.object.object.name===self.namedParams[0].name) {
                    return self.parseMethodCall(expr);
                }
            }
        }
        name = memberExpressionToString(expr.callee);
        thisName = parentMemberExpressionToString(expr.callee);
    }
    //get arguments
    expr.arguments.forEach(function(arg) {
        var result = self.parseCommon(arg);
        args.push(result);
        if (!(result instanceof LiteralExpression)) {
            needsEvaluation = false;
        }
    });
    if (needsEvaluation) {
        var fn = self.eval(name);
        var thisArg;
        if (thisName) {
            thisArg = self.eval(thisName);
        }
        return new LiteralExpression(fn.apply(thisArg, args.map(function(x) { return x.value; })));
    }
    else {
        /**
         * @type {Function|*}
         */
        var createMethodCall =self.parsers.map( function(parser) {
            return parser.test(name);
        }).find( function(method) {
            return typeof method === 'function';
        });
        if (typeof createMethodCall === 'function') {
            return createMethodCall(args);
        }
        else {
            return new MethodCallExpression(name, args);
        }
    }
}

ClosureParser.prototype.parseIdentifier = function(expr) {
    if (this.params && Object.prototype.hasOwnProperty.call(this.params, expr.name)) {
        return new LiteralExpression(this.params[expr.name]);
    }
    throw new Error('Identifier cannot be found or is inaccessible. Consider passing parameters if they are used inside method.');
}

ClosureParser.prototype.parseLiteral = function(expr) {
    return new LiteralExpression(expr.value);
}

/**
 * Abstract function which resolves entity based on the given member name
 * @param {string} member
 */
ClosureParser.prototype.resolveMember = function(member) {
    return member;
}

/**
 * Resolves a custom method of the given name and arguments and returns an equivalent MethodCallExpression instance.
 * @param method
 * @param args
 * @returns {MethodCallExpression}
 */
// eslint-disable-next-line no-unused-vars
ClosureParser.prototype.resolveMethod = function(method, args) {
    return null;
}

function memberExpressionToString(expr) {
    if (expr.object.object == null) {
        return expr.object.name + '.' + expr.property.name
    }
    else {
        return memberExpressionToString(expr.object) + '.' + expr.property.name;
    }
}

function parentMemberExpressionToString(expr) {
    if (expr.object.object == null) {
        return expr.object.name;
    }
    else {
        return memberExpressionToString(expr.object);
    }
}

module.exports.count = count;
module.exports.round = round;
module.exports.min = min;
module.exports.max = max;
module.exports.sum = sum;
module.exports.mean = mean;
module.exports.ClosureParser = ClosureParser;


