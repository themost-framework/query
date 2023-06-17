// MOST Web Framework Codename Zero Gravity Copyright (c) 2017-2022, THEMOST LP All rights reserved
import { LiteralExpression, ObjectExpression, Operators, SequenceExpression, 
    MemberExpression, ArithmeticExpression, LogicalExpression,
    AggregateComparisonExpression, MethodCallExpression, ComparisonExpression } from '../expressions';
const isComparisonOperator = ComparisonExpression.isComparisonOperator;
const isArithmeticOperator = ArithmeticExpression.isArithmeticOperator;
import { instanceOf } from '../instance-of';

import { parse } from 'esprima';
import { DateMethodParser } from './DateMethodParser';
import { StringMethodParser } from './StringMethodParser';
import { MathMethodParser } from './MathMethodParser';
import { FallbackMethodParser } from './FallbackMethodParser';
import {SyncSeriesEventEmitter} from '@themost/events';

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
    SequenceExpression:'SequenceExpression',
    ConditionalExpression: 'ConditionalExpression'
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

// noinspection JSCommentMatchesSignature
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
        this.resolvingMember = new SyncSeriesEventEmitter();
        this.resolvingMethod = new SyncSeriesEventEmitter();
        this.resolvingJoinMember = new SyncSeriesEventEmitter();
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
        if (typeof func !== 'function') {
            throw new Error('Select closure must a function.');
        }
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
            return [
                res.exprOf()
            ];
        }
        if (res && res instanceof MethodCallExpression) {
            return [
                res.exprOf()
            ];
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
        if (fnExpr.body.type === ExpressionTypes.BinaryExpression) {
            return this.parseCommon(fnExpr.body).exprOf();
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
        else if (expr.type === ExpressionTypes.ConditionalExpression) {
            return this.parseCondition(expr);
        }
        else if (expr.type === ExpressionTypes.ObjectExpression) {
            return this.parseObject(expr);
        }
        throw new Error('The given expression type (' + expr.type + ') is invalid or it has not implemented yet.');
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
            } else if (objectExpression && objectExpression.type === ExpressionTypes.CallExpression) {
                return self.parseMethod(objectExpression);
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

    /**
     * Parses an object expression e.g. { "createdAt": x.dateCreated }
     * @param {{type: string,test: any, consequent: any,alternate: any}} objectExpression
     */
    parseCondition(objectExpression) {
        return new MethodCallExpression('cond', [
            this.parseCommon(objectExpression.test),
            this.parseCommon(objectExpression.consequent),
            this.parseCommon(objectExpression.alternate)
        ]);
    }

    tryUnpackedProperty(properties, name, qualifiedMember) {
        let index = 0;
        while(index < properties.length) {
            const prop = properties[index];
            if (prop.value && prop.value.type === 'ObjectPattern') {
                const newQualifiedMember = {
                    name: '',
                    alias: null
                }
                const prop1 = this.tryUnpackedProperty(prop.value.properties, name, newQualifiedMember);
                if (prop1) {
                    qualifiedMember.name += '.';
                    qualifiedMember.name += prop.key.name;
                    qualifiedMember.name += newQualifiedMember.name;
                    if (newQualifiedMember.alias) {
                        qualifiedMember.alias = newQualifiedMember.alias;
                    }
                    return prop1;
                }
            } else if (prop.value && prop.value.type === 'Identifier') {
                if (prop.value.name === name) {
                    qualifiedMember.name += '.';
                    if (prop.key.name !== prop.value.name) {
                        qualifiedMember.name += prop.key.name;
                        qualifiedMember.alias = prop.value.name;
                    } else {
                        qualifiedMember.name += name;
                    }
                    return prop;
                }
            }
            index += 1;
        }
    }

    /**
     * @param {string} name 
     * @returns any
     */
    isMember(name) {
        const self = this;
        if (self.namedParams.length === 0) {
            throw new Error('Invalid or missing closure parameter');
        }
        const  namedParam0 = self.namedParams[0];
        if (namedParam0.type === 'ObjectPattern') {
            // validate param which is an object destructuring expression
            let property = namedParam0.properties.find((x) => {
                return x.type === 'Property' && x.value != null && x.value.type === 'Identifier' &&  x.value.name === name;
            });
            if (property) {
                if (property.key.name !== property.value.name) {
                    return property.key
                } else {
                    return property.value;
                }
            } else {
                let qualifiedMember = {
                    name: '',
                    alias: null
                };
                property = self.tryUnpackedProperty(namedParam0.properties, name, qualifiedMember);
                return property;
            }
        } else {
            // search for a named param with the same name
            const param = self.namedParams.find(function (item) {
                return (item.type === 'Identifier' && item.name === name);
            });
            return param;
        }
    }

    /**
     * @param {any} expr
     * @param {{useAlias:boolean}=} options
     */
    parseMember(expr, options) {
        let self = this;
        if (self.namedParams.length === 0) {
            throw new Error('Invalid or missing closure parameter');
        }
        let namedParam0;
        if (expr.property) {
            // get first parameter
            namedParam0 = self.namedParams[0];
            // find parameter by name
            let namedParam = self.namedParams.find(function (item) {
                return (item.name === expr.object.name);
            });
            if (namedParam != null) {
                /**
                 * @type {*}
                 */
                const event = {
                    target: this,
                    member: expr.property.name
                }
                // if named parameter is the first parameter
                if (namedParam0 === namedParam) {
                    // resolve member
                    self.resolvingMember.emit(event);
                } else {
                    // otherwise resolve member of joined collection
                    self.resolvingJoinMember.emit(event);
                }
                return new MemberExpression(event.member);
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
                let fullyQualifiedMember =  '';
                while (object1.object != null) {
                    if (object1.object && object1.object.property) {
                        fullyQualifiedMember += object1.object.property.name + '.';
                    }
                    object1 = object1.object;
                }
                namedParam = self.namedParams.find(function (item) {
                    return (item.name === object1.name);
                });
                if (object1.name === namedParam.name) {
                    //get closure parameter expression e.g. x.customer.name
                    let property = expr.property.name;
                    fullyQualifiedMember += property;
                    const object = expr.object.property.name;
                    const event = {
                        target: this,
                        object: object,
                        member: property,
                        fullyQualifiedMember: fullyQualifiedMember
                    };
                    this.resolvingJoinMember.emit(event);
                    return new MemberExpression(event.object + '.' + event.member);
                }
                else {
                    //evaluate object member value e.g. item.title or item.status.id
                    value = self.eval(memberExpressionToString(expr));
                    return new LiteralExpression(value);
                }

            }
        }
        else {
            // get first parameter
            namedParam0 = self.namedParams[0];
            let alias;
            // support object destructing param
            if (namedParam0.type === 'ObjectPattern') {
                //
                let property = namedParam0.properties.find((x) => {
                    return x.type === 'Property' && x.value != null && x.value.type === 'Identifier' &&  x.value.name === expr.name;
                });
                if (property) {
                    let member = property.value.name;
                    if (property.key.name !== property.value.name) {
                        member = property.key.name;
                        alias = property.value.name;
                    }
                    const memberEvent = {
                        target: this,
                        member: member
                    }
                    if (options && options.useAlias === false) {
                        alias = null;
                    }
                    self.resolvingMember.emit(memberEvent);
                    return new MemberExpression(memberEvent.member);
                    // if (alias == null) {
                    //     return new MemberExpression(memberEvent.member);
                    // } else {
                    //     const memberWithAlias = new ObjectExpression();
                    //     Object.defineProperty(memberWithAlias, alias, {
                    //         configurable: true,
                    //         enumerable: true,
                    //         value: new MemberExpression(memberEvent.member)
                    //     });
                    //     return memberWithAlias;
                    // }
                } else {
                    let qualifiedMember1;
                    // try to find nested property
                    /**
                     * @param {Array<any>} properties 
                     * @param {string} name
                     * @param {{name:string, alias:string}} qualifiedMember
                     * @returns {*}
                     */
                    const tryFindUnpackedProperty = (properties, name, qualifiedMember) => {
                        let index = 0;
                        while(index < properties.length) {
                            const prop = properties[index];
                            if (prop.value && prop.value.type === 'ObjectPattern') {
                                /**
                                 * @type {{name: string, alias: string}}
                                 */
                                const newQualifiedMember = {
                                    name: '',
                                    alias: null
                                }
                                const prop1 = tryFindUnpackedProperty(prop.value.properties, name, newQualifiedMember);
                                if (prop1) {
                                    qualifiedMember.name += '.';
                                    qualifiedMember.name += prop.key.name;
                                    qualifiedMember.name += newQualifiedMember.name;
                                    if (newQualifiedMember.alias) {
                                        qualifiedMember.alias = newQualifiedMember.alias;
                                    }
                                    return prop1;
                                }
                            } else if (prop.value && prop.value.type === 'Identifier') {
                                if (prop.value.name === name) {
                                    qualifiedMember.name += '.';
                                    if (prop.key.name !== prop.value.name) {
                                        qualifiedMember.name += prop.key.name;
                                        qualifiedMember.alias = prop.value.name;
                                    } else {
                                        qualifiedMember.name += name;
                                    }
                                    return prop;
                                }
                            }
                            index += 1;
                        }
                    };
                    qualifiedMember1 = {
                        name: '',
                        alias: null
                    };
                    property = tryFindUnpackedProperty(namedParam0.properties, expr.name, qualifiedMember1);
                    if (property) {
                        const memberPath = qualifiedMember1.name.substring(1).split('.');
                        alias = qualifiedMember1.alias;
                        const memberEvent = {
                            target: this,
                            member: memberPath[memberPath.length - 1],
                            fullyQualifiedMember: memberPath.join('.')
                        }
                        self.resolvingJoinMember.emit(memberEvent);
                        return new MemberExpression(memberEvent.fullyQualifiedMember);
                    }
                    
                }
            }
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
        let result = self.parseMember(expr.callee.object, {
            useAlias: false
        });
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
                const tryMember = self.isMember(name);
                if (tryMember) {
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
        const namedParam0 = this.namedParams && this.namedParams[0];
        if (namedParam0.type === 'ObjectPattern') {
            return this.parseMember(expr);
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

export {
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


