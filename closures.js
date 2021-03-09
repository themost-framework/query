// MOST Web Framework Copyright (c) 2014-2021 THEMOST LP released under the BSD3-Clause license

var expressions = require('./expressions');
var esprima = require('esprima');
var _ = require('lodash');
var Args = require('@themost/common').Args;
var MemberExpression = expressions.MemberExpression;
var SequenceExpression = expressions.SequenceExpression;
var ObjectExpression = expressions.ObjectExpression;
var LogicalExpression = expressions.LogicalExpression;
var ArithmeticExpression = expressions.ArithmeticExpression;
var LiteralExpression = expressions.LiteralExpression;
var MethodCallExpression = expressions.MethodCallExpression;
var ComparisonExpression = expressions.ComparisonExpression;

var ExpressionTypes = {
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
    SequenceExpression: 'SequenceExpression',
    ObjectExpression: 'ObjectExpression'
};
/**
 * @class ClosureParser
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
    this.parsers = {};
    // set params
    this.params = null;

}
/**
 * Parses a javascript expression and returns the equivalent QueryExpression instance.
 * @param {Function} fn The closure expression to parse
 * @param {*=} params
 */
// eslint-disable-next-line no-unused-vars
ClosureParser.prototype.parseFilter = function (fn, params) {
    var self = this;
    if (typeof fn === 'undefined' || fn === null) {
        return;
    }
    this.params = params;
    //convert the given function to javascript expression
    var expr = esprima.parse('void(' + fn.toString() + ')');
    //get FunctionExpression
    var fnExpr = expr.body[0].expression.argument;
    if (_.isNil(fnExpr)) {
        throw new Error('Invalid closure statement. Closure expression cannot be found.');
    }
    //get named parameters
    self.namedParams = fnExpr.params;
    //validate expression e.g. return [EXPRESSION];
    if (fnExpr.body.body[0].type !== ExpressionTypes.ReturnStatement) {
        throw new Error('Invalid closure syntax. A closure expression must return a value.');
    }
    var closureExpr = fnExpr.body.body[0].argument;
    //parse this expression
    var result = this.parseCommon(closureExpr);
    if (result != null && typeof result.exprOf === 'function') {
        return result.exprOf();
    }
    return result;

};


ClosureParser.prototype.parseCommon = function (expr) {
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
    else {
        throw new Error('The given expression is not yet implemented (' + expr.type + ').');
    }
};

ClosureParser.prototype.parseLogical = function (expr) {
    var self = this;
    var op = (expr.operator === '||') ? expressions.Operators.Or : expressions.Operators.And;
    //validate operands
    if (expr.left == null || expr.right == null) {
        throw new Error('Invalid logical expression. Left or right operand is missing or undefined.');
    }
    return new LogicalExpression(op, [
        self.parseCommon(expr.left),
        self.parseCommon(expr.right)
    ]);
};
/**
 * @static
 * @param {string} op
 * @returns {*}
 */
ClosureParser.BinaryToExpressionOperator = function (op) {
    switch (op) {
        case '===':
        case '==':
            return expressions.Operators.Eq;
        case '!=':
            return expressions.Operators.Ne;
        case '>':
            return expressions.Operators.Gt;
        case '>=':
            return expressions.Operators.Ge;
        case '<':
            return expressions.Operators.Lt;
        case '<=':
            return expressions.Operators.Le;
        case '-':
            return expressions.Operators.Sub;
        case '+':
            return expressions.Operators.Add;
        case '*':
            return expressions.Operators.Mul;
        case '/':
            return expressions.Operators.Div;
        case '%':
            return expressions.Operators.Mod;
        case '&':
            return expressions.Operators.BitAnd;
        default:
            return;
    }
};
ClosureParser.prototype.parseBinary = function (expr) {
    var self = this;
    var op = ClosureParser.BinaryToExpressionOperator(expr.operator);
    if (op == null) {
        throw new Error('Invalid binary operator.');
    }
    var left = self.parseCommon(expr.left);
    var right = self.parseCommon(expr.right);
    if (expressions.isArithmeticOperator(op)) {
        //validate arithmetic arguments
        if (expressions.isLiteralExpression(left) && expressions.isLiteralExpression(right)) {
            //evaluate expression
            switch (op) {
                case expressions.Operators.Add:
                    return left.value + right.value;
                case expressions.Operators.Sub:
                    return left.value - right.value;
                case expressions.Operators.Div:
                    return left.value / right.value;
                case expressions.Operators.Mul:
                    return left.value * right.value;
                case expressions.Operators.Mod:
                    return left.value % right.value;
                case expressions.Operators.BitAnd:
                    return left.value & right.value;
                default:
                    throw new Error('Invalid arithmetic operator');
            }
        }
        else {
            return new ArithmeticExpression(left, op, right);
        }
    }
    else if (expressions.isComparisonOperator(op)) {
        return new ComparisonExpression(left, op, right);
    }
    else {
        throw new Error('Unsupported binary expression');
    }
};

function memberExpressionToString(expr) {
    if (_.isNil(expr.object.object)) {
        return expr.object.name + '.' + expr.property.name
    }
    else {
        return memberExpressionToString(expr.object) + '.' + expr.property.name;
    }
}

// eslint-disable-next-line no-unused-vars
function parentMemberExpressionToString(expr) {
    if (_.isNil(expr.object.object)) {
        return expr.object.name;
    }
    else {
        return memberExpressionToString(expr.object);
    }
}

ClosureParser.prototype.parseMember = function (expr) {
    var self = this;
    if (expr.property) {
        var namedParam = self.namedParams[0];
        if (_.isNil(namedParam)) {
            throw new Error('Invalid or missing closure parameter');
        }
        var member;
        if (expr.object.name === namedParam.name) {
            member = self.resolveMember(expr.property.name);
            return new MemberExpression(member);
        }
        else {
            var value;
            if (expr.object.object == null) {
                // evaluate object member value e.g. item.title or item.status.id
                value = memberExpressionToString(expr);
                return new MemberExpression(value);
            }
            if (expr.object.object.name === namedParam.name) {
                // get closure parameter expression e.g. x.title.length
                var property = expr.property.name;
                var result = self.parseMember(expr.object);
                return new MethodCallExpression(property, [result]);
            }
            else {
                // evaluate object member value e.g. item.title or item.status.id
                value = memberExpressionToString(expr);
                return new LiteralExpression(value);
            }
        }
    }
    throw new Error('Invalid member expression.');
};
/**
 * @private
 * @param {*} expr
 */
ClosureParser.prototype.parseMethodCall = function (expr) {
    var self = this;
    if (expr.callee.object == null) {
        throw new Error('Invalid or unsupported method expression.');
    }
    var method = expr.callee.property.name;
    var result = self.parseMember(expr.callee.object);
    var args = [result];
    expr.arguments.forEach(function(arg) {
        args.push(self.parseCommon(arg));
    });
    if (typeof self.parsers[method] === 'function') {
        return self.parsers[method](method, args);
    }
    else {
        switch (method) {
            case 'getDate': method = 'day'; break;
            case 'getMonth': method = 'month'; break;
            case 'getYear':
            case 'getFullYear':
                method = 'year'; break;
            case 'getMinutes': method = 'minute'; break;
            case 'getSeconds': method = 'second'; break;
            case 'getHours': method = 'hour'; break;
            case 'startsWith': method = 'startswith'; break;
            case 'endsWith': method = 'endswith'; break;
            case 'trim': method = 'trim'; break;
            case 'toUpperCase': method = 'toupper'; break;
            case 'toLowerCase': method = 'tolower'; break;
            case 'floor': method = 'floor'; break;
            case 'ceiling': method = 'ceiling'; break;
            case 'indexOf': method = 'indexof'; break;
            case 'includes': method = 'contains'; break;
            case 'substring':
            case 'substr':
                method = 'substring'; break;
            default:
                throw new Error('The specified method (' + method + ') is unsupported or is not yet implemented.');
        }
        return new MethodCallExpression(method, args);
    }
};

ClosureParser.prototype.parseMethod = function (expr) {
    var self = this;
    //get method name
    var name = expr.callee.name, args = [], needsEvaluation = true;
    if (_.isNil(name)) {
        if (!_.isNil(expr.callee.object)) {
            if (!_.isNil(expr.callee.object.object)) {
                if (expr.callee.object.object.name === self.namedParams[0].name) {
                    return self.parseMethodCall(expr);
                }
            }
        }
        name = memberExpressionToString(expr.callee);
    }
    expr.arguments.forEach(function(arg) {
        var result = self.parseCommon(arg);
        args.push(result);
        if (expressions.isLiteralExpression(result) === false) {
            needsEvaluation = false;
        }
    });
    if (needsEvaluation) {
        throw new Error('Needs evaluation');
    }
    else {
        // trim method call
        if (expr.callee && expr.callee.property) {
            return new MethodCallExpression(expr.callee.property.name, args);
        }
        return new MethodCallExpression(name, args);
    }
};

/**
 * @param {*} str
 * @returns {*}
 */
ClosureParser.prototype.eval = function (str) {
    return eval.call(undefined, str);
};

ClosureParser.prototype.parseIdentifier = function (expr) {
    if (this.params && Object.prototype.hasOwnProperty.call(this.params, expr.name)) {
        return new LiteralExpression(this.params[expr.name]);
    }
    throw new Error('Identifier cannot be found or is inaccessible. Consider passing parameters if they are used inside method.');
};

ClosureParser.prototype.parseLiteral = function (expr) {
    return new LiteralExpression(expr.value);
};

/**
 * Abstract function which resolves entity based on the given member name
 * @param {string} member
 */
ClosureParser.prototype.resolveMember = function (member) {
    return member;
};

/**
 * Resolves a custom method of the given name and arguments and returns an equivalent MethodCallExpression instance.
 * @param method
 * @param args
 * @param callback
 * @returns {MethodCallExpression}
 */
// eslint-disable-next-line no-unused-vars
ClosureParser.prototype.resolveMethod = function (method, args) {
    return null;
};

ClosureParser.prototype.parseBlock = function (expr) {
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

ClosureParser.prototype.parseSequence = function (sequenceExpression) {
    var self = this;
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
    finalResult.value = sequenceExpression.expressions.map(function (expression) {
        return self.parseCommon(expression);
    });
    return finalResult;
}

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
 * 
 */
ClosureParser.prototype.parseSelect = function (func, params) {
    if (func == null) {
        return;
    }
    this.params = params;
    Args.check(typeof func === 'function', new Error('Select closure must a function.'));
    // convert the given function to javascript expression
    var expr = esprima.parseScript('void(' + func.toString() + ')');
    // validate expression e.g. return [EXPRESSION];
    var body = expr.body[0];
    var funcExpr = body.expression.argument;
    // get named parameters
    this.namedParams = funcExpr.params;
    var res = this.parseCommon(funcExpr.body);
    if (res && res instanceof SequenceExpression) {
        return res.value.map(function (x) {
            return x.exprOf();
        });
    }
    if (res && res instanceof MemberExpression) {
        return [ res.exprOf() ];
    }
    if (res && res instanceof ObjectExpression) {
        return Object.keys(res).map(function (key) {
            if (Object.prototype.hasOwnProperty.call(res, key)) {
                var result = {};
                var expressionProperty = res[key];
                if (typeof expressionProperty.exprOf === 'function') {
                    Object.defineProperty(result, key, {
                        configurable: true,
                        enumerable: true,
                        writable: true,
                        value: expressionProperty.exprOf()
                    });
                }
                return result;
            }
        });
    }
    throw new new Error('Invalid select closure');
}


if (typeof exports !== 'undefined') {
    module.exports.ClosureParser = ClosureParser;
}