// MOST Web Framework 2.0 Codename Blueshift Copyright (c) 2017-2020, THEMOST LP All rights reserved
let expressions = require('../expressions');
let LiteralExpression = expressions.LiteralExpression;
let ObjectExpression = expressions.ObjectExpression;
let Operators = expressions.Operators;
let SequenceExpression = expressions.SequenceExpression;
let MemberExpression = expressions.MemberExpression;
let ArithmeticExpression = expressions.ArithmeticExpression;
let LogicalExpression = expressions.LogicalExpression;
let AggregateComparisonExpression = expressions.AggregateComparisonExpression;
let MethodCallExpression = expressions.MethodCallExpression;
let ComparisonExpression = expressions.ComparisonExpression;
let isComparisonOperator = ComparisonExpression.isComparisonOperator;
let isArithmeticOperator = ArithmeticExpression.isArithmeticOperator;
let instanceOf = require('../instance-of').instanceOf;

let parse = require('esprima').parse;
let Args = require('@themost/common').Args;
let DateMethodParser = require('./DateMethodParser').DateMethodParser;
let StringMethodParser = require('./StringMethodParser').StringMethodParser;
let MathMethodParser = require('./MathMethodParser').MathMethodParser;
let FallbackMethodParser = require('./FallbackMethodParser').FallbackMethodParser;


let ExpressionTypes = {
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
    let args = Array.from(arguments);
    let sortAsc = function(a, b) {
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
    let args = Array.from(arguments);
    let sortDesc = function(a, b) {
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

    let reducer = function(accumulator, currentValue) {
        return accumulator + currentValue;
    }
    let args = Array.from(arguments);
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
 * @param {string|*} value
 * @returns {number}
 */
 function length(value) {
    return value.length;
}

// noinspection JSCommentMatchesSignature
/**
 * @param {...*} args
 * @returns {number}
 */
function mean() {

    let reducer = function(accumulator, currentValue) {
        return accumulator + currentValue;
    }
    let args = Array.from(arguments);
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
 * @param {...*} args
 * @returns {number}
 */
function avg() {
    return mean.apply(null, Array.from(arguments));
}

function getObjectExpressionIdentifier(object) {
    let object1 = object;
    while(object1.object != null) {
        object1 = object1.object;
    }
    return object1.name;
}

class ClosureParser {
    constructor() {
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
    parseSelect(func, params) {
        if (func == null) {
            return;
        }
        this.params = params;
        Args.check(typeof func === 'function', new Error('Select closure must a function.'));
        //convert the given function to javascript expression
        let expr = parse('void(' + func.toString() + ')');
        //validate expression e.g. return [EXPRESSION];
        let funcExpr = expr.body[0].expression.argument;
        //get named parameters
        this.namedParams = funcExpr.params;
        let res = this.parseCommon(funcExpr.body);
        if (res && res instanceof SequenceExpression) {
            return res.value.map(function (x) {
                return x.exprOf();
            });
        }
        if (res && res instanceof MemberExpression) {
            return [res.exprOf()];
        }
        if (res && res instanceof ObjectExpression) {
            return Object.keys(res).map(function (key) {
                if (Object.prototype.hasOwnProperty.call(res, key)) {
                    let result = {};
                    if (instanceOf(res[key], LiteralExpression)) {
                        Object.defineProperty(result, key, {
                            configurable: true,
                            enumerable: true,
                            writable: true,
                            value: {
                                $literal: res[key].value
                            }
                        });
                        return result;
                    }

                    Object.defineProperty(result, key, {
                        configurable: true,
                        enumerable: true,
                        writable: true,
                        value: res[key].exprOf()
                    });
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
    parseFilter(func, params) {
        let self = this;
        if (func == null) {
            return;
        }
        this.params = params;
        //convert the given function to javascript expression
        let expr = parse('void(' + func.toString() + ')');
        //get FunctionExpression
        let fnExpr = expr.body[0].expression.argument;
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
        if (fnExpr.body.body[0].type !== ExpressionTypes.ReturnStatement) {
            throw new Error('Invalid closure syntax. A closure expression must return a value.');
        }
        let closureExpr = fnExpr.body.body[0].argument;
        //parse this expression
        let result = this.parseCommon(closureExpr);
        //and finally return the equivalent query expression
        if (result && typeof result.exprOf === 'function') {
            return result.exprOf();
        }
    }
    parseCommon(expr) {
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
    parseObject(objectExpression) {
        let self = this;
        if (objectExpression == null) {
            throw new Error('Object expression may not be null');
        }
        if (objectExpression.type !== ExpressionTypes.ObjectExpression) {
            throw new Error('Invalid expression type. Expected an object expression.');
        }
        if (Array.isArray(objectExpression.properties) === false) {
            throw new Error('Object expression properties must be an array.');
        }
        let finalResult = new ObjectExpression();
        objectExpression.properties.forEach(function (property) {
            let value = self.parseCommon(property.value);
            let name;
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
    parseSequence(sequenceExpression) {
        let self = this;
        if (sequenceExpression == null) {
            throw new Error('Sequence expression may not be null');
        }
        if (sequenceExpression.type !== ExpressionTypes.SequenceExpression) {
            throw new Error('Invalid expression type. Expected an object expression.');
        }
        if (Array.isArray(sequenceExpression.expressions) === false) {
            throw new Error('Sequence expression expressions must be an array.');
        }
        let finalResult = new SequenceExpression();
        sequenceExpression.expressions.forEach(function (expression) {
            finalResult.value.push(self.parseCommon(expression));
        });
        return finalResult;
    }
    parseBlock(expr) {
        let self = this;
        // get expression statement
        let bodyExpression = expr.body[0];
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
            let objectExpression = bodyExpression.argument;
            if (objectExpression && objectExpression.type === ExpressionTypes.ObjectExpression) {
                return self.parseObject(objectExpression);
            }
        }
        throw new Error('The given expression is not yet implemented (' + expr.type + ').');
    }
    parseLogical(expr) {
        let self = this;
        let op = (expr.operator === '||') ? Operators.Or : Operators.And;
        // validate operands
        if (expr.left == null || expr.right == null) {
            throw new Error('Invalid logical expression. Left or right operand is missing or undefined.');
        }
        else {
            let left = self.parseCommon(expr.left);
            let right = self.parseCommon(expr.right);
            // create expression
            return new LogicalExpression(op, [left, right]);
        }
    }
    parseBinary(expr) {
        let self = this;
        let op = ClosureParser.binaryToExpressionOperator(expr.operator);
        if (op == null) {
            throw new Error('Invalid binary operator.');
        }
        else {

            let left = self.parseCommon(expr.left);
            let right = self.parseCommon(expr.right);
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
                    let finalExpr = new ArithmeticExpression(left, op, right);
                    return finalExpr;
                }
            }
            else if (isComparisonOperator(op)) {
                return new AggregateComparisonExpression(left, op, right);
            }
            else {
                throw new Error('Unsupported binary expression');
            }
        }

    }
    parseMember(expr) {
        let self = this;
        if (expr.property) {
            if (self.namedParams.length === 0) {
                throw new Error('Invalid or missing closure parameter');
            }
            // get first parameter
            let namedParam0 = self.namedParams[0];
            // find parameter by name
            let namedParam = self.namedParams.find(function (item) {
                return (item.name === expr.object.name);
            });
            if (namedParam != null) {
                let member;
                // if named parameter is the first parameter
                if (namedParam0 == namedParam) {
                    // resolve member
                    member = self.resolveMember(expr.property.name);
                } else {
                    // otherwise resolve member of joined collection
                    member = self.resolveJoinMember(expr.property.name);
                }
                return new MemberExpression(member);
            }
            else {
                let value;
                if (expr.object.object == null) {
                    //evaluate object member value e.g. item.title or item.status.id
                    value = memberExpressionToString(expr);
                    return new MemberExpression(value);
                }
                // find identifier name
                let object1 = expr;
                while (object1.object != null) {
                    object1 = object1.object;
                }
                namedParam = self.namedParams.find(function (item) {
                    return (item.name === object1.name);
                });
                if (object1.name === namedParam.name) {
                    //get closure parameter expression e.g. x.customer.name
                    let property = expr.property.name;
                    return new MemberExpression(expr.object.property.name + '.' + property);
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
    parseMethodCall(expr) {
        let self = this;
        if (expr.callee.object == null) {
            throw new Error('Invalid or unsupported method expression.');
        }
        let method = expr.callee.property.name;
        let result = self.parseMember(expr.callee.object);
        let args = [result];
        expr.arguments.forEach(function (arg) {
            args.push(self.parseCommon(arg));
        });

        let createMethodCall = self.parsers.map(function (parser) {
            return parser.test(method);
        }).find(function (m) {
            return typeof m === 'function';
        });
        if (typeof createMethodCall === 'function') {
            return createMethodCall(args);
        }
        throw new Error('The specified method (' + method + ') is unsupported or is not yet implemented.');
    }
    parseMethod(expr) {

        let self = this;
        let name;
        // if callee is a sequence expression e.g. round(x.price, 4)
        // where round is something like import { round } from 'mathjs';
        if (expr.callee && expr.callee.type === ExpressionTypes.SequenceExpression) {
            // search argument for an expression of type StaticMemberExpression
            let findExpression = expr.callee.expressions.find(function (expression) {
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
        let args = [];
        let needsEvaluation = false;
        let thisName;
        if (name == null) {
            if (expr.callee.object != null) {
                // find identifier name
                name = getObjectExpressionIdentifier(expr.callee.object);
                if (name === self.namedParams[0].name) {
                    return self.parseMethodCall(expr);
                }
            }
            name = memberExpressionToString(expr.callee);
            thisName = parentMemberExpressionToString(expr.callee);
        }
        //get arguments
        expr.arguments.forEach(function (arg) {
            let result = self.parseCommon(arg);
            args.push(result);
            // if (!(result instanceof LiteralExpression)) {
            //     needsEvaluation = false;
            // }
        });
        if (needsEvaluation) {
            let fn = self.eval(name);
            let thisArg;
            if (thisName) {
                thisArg = self.eval(thisName);
            }
            return new LiteralExpression(fn.apply(thisArg, args.map(function (x) { return x.value; })));
        }
        else {
            /**
             * @type {Function|*}
             */
            let createMethodCall = self.parsers.map(function (parser) {
                return parser.test(name);
            }).find(function (method) {
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
    parseIdentifier(expr) {
        if (this.params && Object.prototype.hasOwnProperty.call(this.params, expr.name)) {
            return new LiteralExpression(this.params[expr.name]);
        }
        throw new Error('Identifier cannot be found or is inaccessible. Consider passing parameters if they are used inside method.');
    }
    parseLiteral(expr) {
        return new LiteralExpression(expr.value);
    }
    /**
     * Abstract function which resolves entity based on the given member name
     * @param {string} member
     */
    resolveMember(member) {
        return member;
    }
    /**
     * Abstract function which resolves entity based on the given member name
     * @param {string} member
     */
    resolveJoinMember(member) {
        return member;
    }
    /**
     * Resolves a custom method of the given name and arguments and returns an equivalent MethodCallExpression instance.
     * @param method
     * @param args
     * @returns {MethodCallExpression}
     */
    // eslint-disable-next-line no-unused-vars
    resolveMethod(method, args) {
        return null;
    }
    /**
     * @static
     * @param {string} binaryOperator
     * @returns {*}
     */
    static binaryToExpressionOperator(binaryOperator) {
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

module.exports = {
    count,
    round,
    min,
    max,
    sum,
    mean,
    avg,
    length,
    ClosureParser
}


