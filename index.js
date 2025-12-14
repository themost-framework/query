// MOST Web Framework Codename Blueshift Copyright (c) 2017-2022, THEMOST LP All rights reserved

var {SqlFormatter} = require("./formatter");
var {IdentifierToken, LiteralToken, OpenDataParser, SyntaxToken, Token} = require("./odata");
var {
    AggregateComparisonExpression,
    AnyExpressionFormatter,
    ArithmeticExpression,
    ComparisonExpression,
    Expression,
    LiteralExpression,
    LogicalExpression,
    MemberExpression,
    MethodCallExpression,
    ObjectExpression,
    Operators,
    OrderByAnyExpression,
    SelectAnyExpression,
    SequenceExpression,
    SimpleMethodCallExpression,
    SwitchExpression
} = require("./expressions");
var {
    QueryEntity,
    QueryExpression,
    QueryField,
    QueryFieldRef,
    QueryValueRef
} = require("./query");
var {QueryUtils, SqlUtils} = require("./utils");
var {InvalidObjectNameError, ObjectNameValidator} = require("./object-name.validator");
var { SimpleOpenDataParser } = require("./simple-open-data-parser");
var {
    any,
    anyOf,
    OpenDataQuery
} = require("./open-data-query.expression");
var {
    me,
    now,
    today,
    whoami,
    OpenDataQueryFormatter
} = require("./open-data-query.formatter");

var {
    hasNameReference,
    isNameReference,
    trimNameReference,
    isMethodOrNameReference,
    getOwnPropertyWithNameRef
} = require('./name-reference');

var { count,
    round,
    min,
    max,
    sum,
    mean,
    avg,
    length,
    ClosureParser  } = require("./closures");

module.exports = {
    SqlFormatter,
    Token,
    LiteralToken,
    SyntaxToken,
    IdentifierToken,
    OpenDataParser,
    LogicalExpression,
    MethodCallExpression,
    LiteralExpression,
    MemberExpression,
    ArithmeticExpression,
    ComparisonExpression,
    SwitchExpression,
    SequenceExpression,
    ObjectExpression,
    SimpleMethodCallExpression,
    AggregateComparisonExpression,
    AnyExpressionFormatter,
    SelectAnyExpression,
    OrderByAnyExpression,
    Operators,
    Expression,
    QueryField,
    QueryEntity,
    QueryExpression,
    QueryFieldRef,
    QueryValueRef,
    QueryUtils,
    SqlUtils,
    ObjectNameValidator,
    InvalidObjectNameError,
    SimpleOpenDataParser,
    any,
    anyOf,
    OpenDataQuery,
    me,
    now,
    today,
    whoami,
    OpenDataQueryFormatter,
    count,
    round,
    min,
    max,
    sum,
    mean,
    avg,
    length,
    ClosureParser,
    hasNameReference,
    isNameReference,
    trimNameReference,
    isMethodOrNameReference,
    getOwnPropertyWithNameRef
};