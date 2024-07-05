// MOST Web Framework Codename Zero Gravity Copyright (c) 2017-2022, THEMOST LP All rights reserved
import {
    LiteralExpression, ObjectExpression, Operators, SequenceExpression,
    MemberExpression, ArithmeticExpression, LogicalExpression,
    AggregateComparisonExpression, MethodCallExpression, ComparisonExpression
} from '../expressions';
const isComparisonOperator = ComparisonExpression.isComparisonOperator;
const isArithmeticOperator = ArithmeticExpression.isArithmeticOperator;
import { instanceOf } from '../instance-of';

import { parse } from 'esprima';
import { DateMethodParser } from './DateMethodParser';
import { StringMethodParser } from './StringMethodParser';
import { MathMethodParser } from './MathMethodParser';
import { FallbackMethodParser } from './FallbackMethodParser';
import { SyncSeriesEventEmitter } from '@themost/events';
import { isObjectDeep } from '../is-object';

let ExpressionTypes = {
    LogicalExpression: 'LogicalExpression',
    BinaryExpression: 'BinaryExpression',
    MemberExpression: 'MemberExpression',
    MethodExpression: 'MethodExpression',
    Identifier: 'Identifier',
    Literal: 'Literal',
    Program: 'Program',
    ExpressionStatement: 'ExpressionStatement',
    UnaryExpression: 'UnaryExpression',
    FunctionExpression: 'FunctionExpression',
    BlockStatement: 'BlockStatement',
    ReturnStatement: 'ReturnStatement',
    CallExpression: 'CallExpression',
    ObjectExpression: 'ObjectExpression',
    SequenceExpression: 'SequenceExpression',
    ConditionalExpression: 'ConditionalExpression',
    VariableDeclaration: 'VariableDeclaration'
};

/**
 * @param {*} objectPattern
 * @param {*} parentObject
 * @param {Array=} results
 * @returns {Array}
 */
function objectPatternToVariableDeclarators(objectPattern, parentObject, results) {
    let variables = results || [];
    for (const property of objectPattern.properties) {
        if (property.value.type === 'Identifier') {
            variables.push({
                'type': 'VariableDeclarator',
                'id': {
                    'type': 'Identifier',
                    'name': property.value.name
                },
                'init': {
                    'type': 'MemberExpression',
                    'computed': false,
                    'object': parentObject,
                    'property': property.key
                }
            })
        } else if (property.value.type === 'ObjectPattern') {
            objectPatternToVariableDeclarators(property.value, {
                'type': 'MemberExpression',
                'computed': false,
                'property': property.key,
                'object': parentObject
            }, variables);
        }
    }
    return variables
}

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
    let sortAsc = function (a, b) {
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
    let sortDesc = function (a, b) {
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

    let reducer = function (accumulator, currentValue) {
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

    let reducer = function (accumulator, currentValue) {
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
    while (object1.object != null) {
        object1 = object1.object;
    }
    return object1.name;
}
/**
 * @param {{target: ClosureParser, member: string, object?: string, fullyQualifiedMember: string}} event
 */
function onResolvingAdditionalMember(event) {
    /**
     * @type {ClosureParser}
     */
    const target = event.target;
    // eslint-disable-next-line no-unused-vars
    const { params, namedParams } = target;
    if (namedParams.length === 1) {
        // do nothing and exit
        return;
    }
    for (let index = 0; index < namedParams.length; index++) {
        const namedParam = namedParams[index];
        if (namedParam.type === 'ObjectPattern') {
            const intermediateResult = {
                name: '',
                alias: null
            }
            /**
             * @type {{name: string, alias: string}=}
             */
            const result = target.tryUnpackedProperty(namedParam.properties, event.member, intermediateResult);
            if (result) {
                // get param by name
                const name = `param${index}`;
                if (Object.prototype.hasOwnProperty.call(target.params, name)) {
                    const param = target.params[name];
                    if (instanceOf(param, function QueryExpression() {})) {
                        const entityAlias = param.$alias;
                        // get alias
                        if (entityAlias == null) {
                            throw new Error('A query expression must have an alias when used as a closure parameter.');
                        }
                        event.object = entityAlias;
                    } else if (instanceOf(param, function QueryEntity() {})) {
                        const entityAlias = param.$as || param.name;
                        if (entityAlias == null) {
                            throw new Error('A query entity must have an alias when used as a closure parameter.');
                        }
                        event.object = entityAlias;
                    }
                }
            }
        }
    }
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
        this.resolvingVariable = new SyncSeriesEventEmitter();

        this.resolvingJoinMember.subscribe(onResolvingAdditionalMember); 

    }

    /**
     * Parses a javascript expression and returns the equivalent select expression.
     * @param {Function} func The closure expression to parse
     * @param {...*} params An object which represents closure parameters
     */
    // eslint-disable-next-line no-unused-vars
    parseSelect(func, params) {
        if (func == null) {
            return;
        }
        const args = Array.from(arguments);
        // remove first argument 
        args.splice(0,1);
        if (typeof func !== 'function') {
            throw new Error('Select closure must a function.');
        }
        //convert the given function to javascript expression
        let expr = parse('void(' + func.toString() + ')');
        //validate expression e.g. return [EXPRESSION];
        let funcExpr = expr.body[0].expression.argument;
        //get named parameters
        this.namedParams = funcExpr.params;
        // parse params
        this.parseParams(args);
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

    parseParams(args) {
        // closure params can be: 
        // 1. an object which has properties with the same name with the arguments of the given closure
        // e.g. { p1: 'Peter' } where the closure may be something like (x, p1) => x.givenName === p1
        // or
        // 2. a param array where closure arguments should be bound by index
        // e.g. where((x, p1) => x.givenName === p1, 'Peter')
        // for backward compatibility issues we will try to create an object with closure params
        this.params = {};
        this.namedParams.forEach((namedParam, index) => {
            // format param name even if it's not provided
            const name = namedParam.name || `param${index}`;
            // omit the first param because it's the reference of the enumerable object
            if (index > 0) {
                // preserve backward compatibility
                if (args.length === 1 && isObjectDeep(args[0])) {
                    // get param by name
                    const [arg0] = args;
                    // check if argument is an instance of query expression or query entity
                    if (instanceOf(arg0, function QueryExpression() {}) || instanceOf(arg0, function QueryEntity() {})) {
                        // set param for further processing (define joined members)
                        Object.assign(this.params, {
                            [name]: arg0
                        })
                    } else if (Object.prototype.hasOwnProperty.call(arg0, namedParam.name)) {
                        Object.assign(this.params, {
                            [name]: arg0[namedParam.name]
                        })
                    }
                } else {
                    // get param by index
                    Object.assign(this.params, {
                        [name]: args[index - 1]
                    })
                }
            }
        });
    }
    /**
     * Parses a javascript expression and returns the equivalent QueryExpression instance.
     * @param {Function} func The closure expression to parse
     * @param {...*} params An object which represents closure parameters
     */
    // eslint-disable-next-line no-unused-vars
    parseFilter(func, params) {
        let self = this;
        if (func == null) {
            return;
        }
        //convert the given function to javascript expression
        let expr = parse('void(' + func.toString() + ')');
        //get FunctionExpression
        let fnExpr = expr.body[0].expression.argument;
        if (fnExpr == null) {
            throw new Error('Invalid closure statement. Closure expression cannot be found.');
        }
        // get named parameters
        self.namedParams = fnExpr.params;
        const args = Array.from(arguments);
        args.splice(0, 1);
        this.parseParams(args);
        //validate expression e.g. return [EXPRESSION];
        if (fnExpr.body.type === ExpressionTypes.MemberExpression) {
            return this.parseMember(fnExpr.body);
        }
        if (fnExpr.body.type === ExpressionTypes.BinaryExpression) {
            return this.parseCommon(fnExpr.body).exprOf();
        }
        if (fnExpr.body.type === ExpressionTypes.BlockStatement) {
            return this.parseBlock(fnExpr.body).exprOf();
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

        /**
         * get variable declarations
         * @type {*[]}
         */
        const variableDeclarations = expr.body.filter((item) => item.type === ExpressionTypes.VariableDeclaration);
        const bodyExpression = expr.body.find((item) => {
            return item.type === ExpressionTypes.ReturnStatement ||
                item.type === ExpressionTypes.ExpressionStatement;
        });
        if (bodyExpression == null) {
            throw new Error('Invalid BlockStatement expression. Expected ReturnStatement or ExpressionStatement.')
        }
        const resolvingVariable = (event) => {
            let declaration;
            for (const variableDeclaration of variableDeclarations) {
                for (const item of variableDeclaration.declarations) {
                    if (item.id && item.id.type === 'Identifier' && item.id.name === event.name) {
                        declaration = item;
                        break;
                    }
                    if (item.id && item.id.type === 'ObjectPattern') {
                        // convert to variable declarations
                        const variables = objectPatternToVariableDeclarators(item.id, item.init);
                        const variable = variables.find((variable) => {
                            return variable.id.type === 'Identifier' && variable.id.name === event.name
                        });
                        if (variable) {
                            declaration = {
                                init: variable.init
                            };
                            break;
                        }
                    }
                }
                if (declaration) {
                    break;
                }
            }
            if (declaration) {
                const init = declaration.init;
                Object.assign(event, {
                    init
                });
            }
        }
        try {
            this.resolvingVariable.subscribe(resolvingVariable);
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
                let argExpr = bodyExpression.argument;
                if (argExpr && argExpr.type === ExpressionTypes.ObjectExpression) {
                    return self.parseObject(argExpr);
                } else if (argExpr && argExpr.type === ExpressionTypes.CallExpression) {
                    return self.parseMethod(argExpr);
                } else if (argExpr && (argExpr.type === ExpressionTypes.MemberExpression ||
                    argExpr.type === ExpressionTypes.BinaryExpression ||
                    argExpr.type === ExpressionTypes.LogicalExpression)) {
                    return self.parseCommon(argExpr);
                }
                throw new Error(`Invalid ReturnStatement argument. Got ${argExpr.type}.`)
            }
        } finally {
            this.resolvingVariable.unsubscribe(resolvingVariable);
        }
        
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
        while (index < properties.length) {
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
        const namedParam0 = self.namedParams[0];
        if (namedParam0.type === 'ObjectPattern') {
            // validate param which is an object destructuring expression
            let property = namedParam0.properties.find((x) => {
                return x.type === 'Property' && x.value != null && x.value.type === 'Identifier' && x.value.name === name;
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
                    // try to get params
                    const param = self.params[namedParam.name];
                    if (instanceOf(param, function QueryExpression() {})) {
                        const entityAlias = param.$alias;
                        // get alias
                        if (entityAlias == null) {
                            throw new Error('A query expression must have an alias when used as a closure parameter.');
                        }
                        event.fullyQualifiedMember = event.member = entityAlias + '.' + event.member;
                    } else if (instanceOf(param, function QueryEntity() {})) {
                        const entityAlias = param.$as || param.name;
                        if (entityAlias == null) {
                            throw new Error('A query entity must have an alias when used as a closure parameter.');
                        }
                        event.fullyQualifiedMember = event.member = entityAlias + '.' + event.member;
                    }
                    // otherwise resolve member of joined collection
                    self.resolvingJoinMember.emit(event);
                }
                // if event.object is not null
                if (event.object != null) {
                    // concat member expression e.g. new MemberExpression(address.id)
                    return new MemberExpression(event.object + '.' + event.member);
                }
                // otherwise, use only member e.g. ew MemberExpression(id)
                return new MemberExpression(event.member);
            }
            else {
                let value;
                // resolving variable
                this.resolvingVariable.emit(expr.object);
                if (expr.object.init) {
                    // reset object
                    expr.object = expr.object.init;
                }
                if (expr.object.object == null) {
                    //evaluate object member value e.g. item.title or item.status.id
                    value = memberExpressionToString(expr);
                    return new MemberExpression(value);
                }
                // find identifier name
                let object1 = expr;
                let fullyQualifiedMember = '';
                while (object1.object != null) {
                    this.resolvingVariable.emit(object1.object);
                    if (object1.object.init) {
                        object1.object = object1.object.init;
                    }
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
                    fullyQualifiedMember = fullyQualifiedMember.split('.').reverse().filter((x) => x.length > 0).join('.');
                    fullyQualifiedMember += '.';
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
            let property;
            if (namedParam0.type === 'ObjectPattern') {
                property = namedParam0.properties.find((x) => {
                    return x.type === 'Property' && x.value != null && x.value.type === 'Identifier' && x.value.name === expr.name;
                });
            }
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
            } else {
                let findQualifiedMember;
                // try to find nested property
                /**
                 * @param {Array<any>} properties 
                 * @param {string} name
                 * @param {{name:string, alias:string}} qualifiedMember
                 * @returns {*}
                 */
                const tryFindUnpackedProperty = (properties, name, qualifiedMember) => {
                    let index = 0;
                    while (index < properties.length) {
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
                findQualifiedMember = {
                    name: '',
                    alias: null
                };

                for (let index = 0; index < this.namedParams.length; index++) {
                    const namedParam = this.namedParams[index];
                    if (namedParam.type === 'ObjectPattern') {
                        property = tryFindUnpackedProperty(namedParam.properties, expr.name, findQualifiedMember);
                        if (property) {
                            break;
                        }
                    }
                }

                if (property) {
                    const memberPath = findQualifiedMember.name.substring(1).split('.');
                    // eslint-disable-next-line no-unused-vars
                    alias = findQualifiedMember.alias;
                    const memberEvent = {
                        target: this,
                        member: memberPath[memberPath.length - 1],
                        fullyQualifiedMember: memberPath.join('.')
                    }
                    self.resolvingJoinMember.emit(memberEvent);
                    if (memberEvent.object != null) {
                        // concat member expression e.g. new MemberExpression(address.id)
                        return new MemberExpression(memberEvent.object + '.' + memberEvent.member);
                    }
                    return new MemberExpression(memberEvent.fullyQualifiedMember);
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

        this.resolvingVariable.emit(expr.callee.object);
        const object = expr.callee.object.init || expr.callee.object;
        let result = self.parseMember(object, {
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
                if (expr.callee.object.type === ExpressionTypes.Identifier) {
                    this.resolvingVariable.emit(expr.callee.object)
                    const init = expr.callee.object.init || expr.callee.object;
                    name = getObjectExpressionIdentifier(init);
                } else {
                    name = getObjectExpressionIdentifier(expr.callee.object);
                }
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
        const paramIndex = this.namedParams.findIndex(
            (param) => param.type === 'Identifier' && param.name === expr.name
            );
        if (paramIndex > 0) {
            return new LiteralExpression(this.params[paramIndex - 1]);
        }
        const findQualifiedMember = {
            name: '',
            alias: null
        };
        for (let index = 0; index < this.namedParams.length; index++) {
            const namedParam = this.namedParams[index];
            if (namedParam.type === 'ObjectPattern') {
                const property = this.tryUnpackedProperty(namedParam.properties, expr.name, findQualifiedMember);
                if (property) {
                    return this.parseMember(expr);
                }
            }
        }
        // const namedParam0 = this.namedParams && this.namedParams[0];
        // if (namedParam0.type === 'ObjectPattern') {
        //     return this.parseMember(expr);
        // }
        this.resolvingVariable.emit(expr);
        if (expr.init) {
            return this.parseCommon(expr.init);
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


