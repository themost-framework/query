// MOST Web Framework Codename Zero Gravity Copyright (c) 2017-2022, THEMOST LP All rights reserved
import { SqlUtils } from './utils';
import { sprintf } from 'sprintf-js';
import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import isFunction from 'lodash/isFunction';
import isObject from 'lodash/isObject';
import map from 'lodash/map';
import forEach from 'lodash/forEach';
import { QueryEntity, QueryExpression, QueryField } from './query';
import { instanceOf } from './instance-of';
import './polyfills';
import { ObjectNameValidator } from './object-name.validator';
import {isMethodOrNameReference, isNameReference, trimNameReference} from './name-reference';
import { JSONArray, JSONObject } from '@themost/json';
import {MethodCallExpression} from './expressions';

class AbstractMethodError extends Error {
    constructor() {
        super('Abstract method error')
    }
}

const ALIAS_KEYWORD = ' AS ';
const DEFAULT_COUNT_ALIAS = '__count__';
/**
 * @this SqlFormatter
 */
function getAliasKeyword() {
    if (Object.prototype.hasOwnProperty.call(this.settings, 'useAliasKeyword') === false) {
        return ALIAS_KEYWORD;
    }
    if (this.settings.useAliasKeyword) {
        return ALIAS_KEYWORD;
    }
    return ' ';
}

/**
 * Initializes an SQL formatter class.
 * @class SqlFormatter
 * @constructor
 */
class SqlFormatter {
    constructor() {
        //
        this.provider = null;
        /**
         * Gets or sets formatter settings
         * @type {{nameFormat: string, forceAlias: boolean, useAliasKeyword: boolean}|*}
         */
        this.settings = {
            /**
             * Gets or sets a format that is going to be applied in field expression e.g. AS [$1] or AS '$1'.
             * @type {string}
             */
            nameFormat: '$1',
            /**
             * Gets or sets a boolean that indicates whether field aliases will forcibly be used even if field expression does not have any alias
             * (e.g. SELECT Person.name as name or SELECT Person.name).
             * @type {boolean}
             */
            forceAlias: false,
            /**
             * Gets or sets a boolean which indicates whether AS keyword must be used in alias expression e.g. SELECT * FROM Table1 AS T1 or SELECT * FROM Table1 T1
             */
            useAliasKeyword: true
        };
    }
    /**
     * Formats a JSON comparison object to the equivalent sql expression e.g. { $gt: 100} as >100, or { $in:[5, 8] } as IN {5,8} etc
     * @param {*} comparison
     * @returns {string}
     */
    formatComparison(comparison) {
        let key;
        if (isNil(comparison))
            return '(%s IS NULL)';
        if (typeof comparison === 'object') {
            if (comparison instanceof Date) {
                return '(%s'.concat(sprintf('=%s)', this.escape(comparison)));
            }
            let compares = [];
            for (key in comparison) {
                if (Object.prototype.hasOwnProperty.call(comparison, key))
                    compares.push(key);
            }
            if (compares.length === 0)
                return '(%s IS NULL)';
            else {
                let arr = [];
                for (let i = 0; i < compares.length; i++) {
                    key = compares[i];
                    if (QueryExpression.ComparisonOperators[key] === undefined)
                        throw new Error(sprintf('Unknown operator %s.', key));
                    let escapedValue = this.escape(comparison[key]);
                    switch (key) {
                        case '$eq': arr.push('(%s'.concat('=', escapedValue, ')')); break;
                        case '$lt': arr.push('(%s'.concat('<', escapedValue, ')')); break;
                        case '$lte': arr.push('(%s'.concat('<=', escapedValue, ')')); break;
                        case '$gt': arr.push('(%s'.concat('>', escapedValue, ')')); break;
                        case '$gte': arr.push('(%s'.concat('>=', escapedValue, ')')); break;
                        case '$ne': arr.push('(NOT %s'.concat('=', escapedValue, ')')); break;
                        case '$in': arr.push('(%s'.concat('(', escapedValue, '))')); break;
                        case '$nin': arr.push('(NOT %s'.concat('(', escapedValue, '))')); break;
                    }
                }
                //join expression
                if (arr.length === 1)
                    return arr[0];
                else if (arr.length > 1) {
                    return '('.concat(arr.join(' AND '), ')');
                }

                else
                    return '(%s IS NULL)';
            }
        }

        else {
            return '(%s'.concat(sprintf('=%s)', this.escape(comparison)));
        }
    }
    isComparison(obj) {
        const key = Object.key(obj);
        return (/^\$(eq|ne|lt|lte|gt|gte|in|nin|text|regex)$/g.test(key));
    }
    isLogical(obj) {
        const key = Object.key(obj);
        return (/^\$(and|or|not|nor)$/g.test(key));
    }
    /**
     * Escapes an object or a value and returns the equivalent sql value.
     * @param {*} value - A value that is going to be escaped for SQL statements
     * @param {boolean=} unquoted - An optional value that indicates whether the resulted string will be quoted or not.
     * @returns {*} - The equivalent SQL string value
     */
    escape(value, unquoted) {
        if (value == null)
            return SqlUtils.escape(null);

        if (typeof value === 'object') {
            if (value instanceof JSONArray || value instanceof JSONObject) {
                return SqlUtils.escape(value.toString());
            }
            //add an exception for Date object
            if (value instanceof Date)
                return SqlUtils.escape(value);
            if (Object.prototype.hasOwnProperty.call(value, '$name'))
                return this.escapeName(value.$name);
            else if (Object.prototype.hasOwnProperty.call(value, '$value'))
                return this.escape(value.$value);
            else if (Object.prototype.hasOwnProperty.call(value, '$literal')) {
                return this.escape(value.$literal);   
            }
            else if (Object.prototype.hasOwnProperty.call(value, '$getField') && typeof value.$getField === 'string') {
                return this.escapeName(value.$getField);   
            }
            else {
                //check if value is a known expression e.g. { $length:"name" }
                let keys = Object.keys(value), key0 = keys[0];
                if (isString(key0) && /^\$/.test(key0) && isFunction(this[key0])) {
                    let exprFunc = this[key0];
                    let args;
                    // if function has an array of arguments e.g.
                    // title.startsWith('Introduction')
                    // { $startWith: [{ $name : "title" }, 'Introduction'] }
                    if (Array.isArray(value[key0])) {
                        args = value[key0];
                    } else {
                        args = map(keys, function (x) {
                            return value[x];
                        });
                    }
                    return exprFunc.apply(this, args);
                } else if (keys.length === 1) {
                    // backward compatibility for simple equal expression
                    // e.g. { "category": "Laptops" }
                    const value0 = value[key0];
                    if (value0 == null) {
                        return this.$eq(new QueryField(key0), null);
                    }
                    if ((typeof value0 === 'object' && Object.prototype.hasOwnProperty.call(value0, '$eq')) === false) {
                        throw new Error('Invalid right operand. Expected an object with $eq operator.');
                    }
                    return this.$eq(new QueryField(key0), value0.$eq);
                }
            }
        }
        if (unquoted) {
            return value.valueOf();
        } else {
            return SqlUtils.escape(value);
        }
    }
    /**
     * Escapes an object or a value and returns the equivalent sql value.
     * @param {*} value - A value that is going to be escaped for SQL statements
     * @param {boolean=} unquoted - An optional value that indicates whether the resulted string will be quoted or not.
     * returns {string} - The equivalent SQL string value
     */
    escapeConstant(value, unquoted) {
        return this.escape(value, unquoted);
    }
    /**
     * Formats a where expression object and returns the equivalent SQL string expression.
     * @param {*} where - An object that represents the where expression object to be formatted.
     * @returns {string|*}
     */
    formatWhere(where) {
        let self = this;

        //get expression (the first property of the object)
        let keys = Object.keys(where), property = keys[0];
        if (typeof property === 'undefined')
            return '';
        //get property value
        let propertyValue = where[property];
        // add an exception for comparisons and hold backward compatibility
        if (Object.prototype.hasOwnProperty.call(QueryExpression.ComparisonOperators, property)) {
            if (Array.isArray(propertyValue)) {
                const formatComparison = this[property];
                if (typeof formatComparison !== 'function') {
                    throw new Error('Comparison formatter cannot be found');
                }
                return formatComparison.apply(this, propertyValue);
            }
        }
        if (Object.prototype.hasOwnProperty.call(QueryExpression.LogicalOperators, property)) {
            if (Array.isArray(propertyValue)) {
                const formatLogicalExpr = this[property];
                if (typeof formatLogicalExpr === 'function') {
                    return formatLogicalExpr.apply(this, propertyValue);
                }
            }
        }
        let separator;
        let comparison;
        let op = null;
        let sql = null;
        let escapedProperty;
        let fn;
        let p1;
        switch (property) {
            case '$not':
                return '(NOT ' + self.formatWhere(propertyValue) + ')';
            case '$and':
            case '$or':
                separator = property === '$or' ? ' OR ' : ' AND ';
                //property value must be an array
                if (!Array.isArray(propertyValue))
                    throw new Error('Invalid query argument. A logical expression must contain one or more comparison expressions.');
                if (propertyValue.length === 0)
                    return '';
                return '(' + map(propertyValue, function (x) {
                    return self.formatWhere(x);
                }).join(separator) + ')';
            default:
                comparison = propertyValue;
                if (instanceOf(comparison, QueryField)) {
                    op = '$eq';
                    comparison = { $eq: propertyValue };
                }
                else if (Array.isArray(comparison)) {
                    op = '$in';
                    comparison = {
                        '$in': propertyValue
                    };
                }
                else if (typeof comparison === 'object' && comparison !== null) {
                    //get comparison operator
                    op = Object.keys(comparison)[0];
                }
                else {
                    //set default comparison operator to equal
                    op = '$eq';
                    comparison = { $eq: propertyValue };
                }
                //escape property name
                escapedProperty = this.escapeName(property);
                switch (op) {
                    case '$text':
                        return self.$text({ $name: property }, comparison.$text.$search);
                    case '$eq':
                        if (isNil(comparison.$eq))
                            return sprintf('(%s IS NULL)', escapedProperty);
                        return sprintf('(%s=%s)', escapedProperty, self.escape(comparison.$eq));
                    case '$gt':
                        return sprintf('(%s>%s)', escapedProperty, self.escape(comparison.$gt));
                    case '$gte':
                        return sprintf('(%s>=%s)', escapedProperty, self.escape(comparison.$gte));
                    case '$lt':
                        return sprintf('(%s<%s)', escapedProperty, self.escape(comparison.$lt));
                    case '$lte':
                        return sprintf('(%s<=%s)', escapedProperty, self.escape(comparison.$lte));
                    case '$ne':
                        if (isNil(comparison.$ne))
                            return sprintf('(NOT %s IS NULL)', escapedProperty);
                        if (comparison != null) {
                            if (Array.isArray(comparison.$ne)) {
                                return sprintf('(NOT %s IN (%s))', escapedProperty, self.escape(comparison.$ne));
                            }
                            return sprintf('(NOT %s=%s)', escapedProperty, self.escape(comparison.$ne));
                        }

                        else
                            return sprintf('(NOT %s IS NULL)', escapedProperty);
                    case '$regex':
                        return this.$regex({ $name: property }, comparison.$regex);
                    case '$in':
                        if (Array.isArray(comparison.$in)) {
                            if (comparison.$in.length === 0)
                                return sprintf('(%s IN (NULL))', escapedProperty);
                            sql = '('.concat(escapedProperty, ' IN (', map(comparison.$in, function (x) {
                                return self.escape(x !== null ? x : null);
                            }).join(', '), '))');
                            return sql;
                        }
                        else if (typeof comparison.$in === 'object') {
                            //try to validate if comparison.$in is a select query expression (sub-query support)
                            let q1 = Object.assign(new QueryExpression(), comparison.$in);
                            if (q1.$select) {
                                //if sub query is a select expression
                                return sprintf('(%s IN (%s))', escapedProperty, self.format(q1));
                            }
                        }
                        // otherwise, throw error
                        throw new Error('Invalid query argument. An in statement must contain one or more values.');
                    case '$nin':
                        if (Array.isArray(comparison.$nin)) {
                            if (comparison.$nin.length === 0)
                                return sprintf('(NOT %s IN (NULL))', escapedProperty);
                            sql = '(NOT '.concat(escapedProperty, ' IN (', map(comparison.$nin, function (x) {
                                return self.escape(x !== null ? x : null);
                            }).join(', '), '))');
                            return sql;
                        }
                        else if (typeof comparison.$in === 'object') {
                            //try to validate if comparison.$nin is a select query expression (sub-query support)
                            let q2 = Object.assign(new QueryExpression(), comparison.$in);
                            if (q2.$select) {
                                //if sub query is a select expression
                                return sprintf('(NOT %s IN (%s))', escapedProperty, self.format(q2));
                            }
                        }
                        // otherwise, throw error
                        throw new Error('Invalid query argument. An in statement must contain one or more values.');
                    default:
                        // search if current operator (arithmetic, evaluation etc.) exists as a formatter function (e.g. function $add(p1,p2) { ... } )
                        // in this case the first parameter is the defined property e.g. Price
                        // and the property value contains an array of all others parameters (if any) and the comparison operator
                        // e.g. { Price: { $add: [5, { $gt:100} ]} } where we are trying to find elements that meet the following query expression: (Price+5)>100
                        // The identifier <Price> is the first parameter, the constant 5 is the second
                        fn = this[op];
                        p1 = comparison[op];
                        if (typeof fn === 'function') {
                            let args = [];
                            let argN = null;
                            //push identifier
                            args.push({ $name: property });
                            if (Array.isArray(p1)) {
                                //push other parameters
                                for (let j = 0; j < p1.length - 1; j++) {
                                    args.push(p1[j]);
                                }
                                //get comparison argument (last item of the arguments' array)
                                argN = p1[p1.length - 1];
                            }
                            else {
                                if (self.isComparison(p1)) {
                                    argN = p1;
                                }
                                else {
                                    //get comparison argument (equal)
                                    argN = { $eq: p1.valueOf() };
                                }

                            }
                            //call formatter function
                            let f0 = fn.apply(this, args);
                            return self.formatComparison(argN).replace(/%s/g, f0.replace('$', '\\$'));
                        }
                        else {
                            //equal expression
                            if (typeof p1 !== 'undefined' && p1 !== null)
                                return sprintf('(%s=%s)', escapedProperty, self.escape(p1));

                            else
                                return sprintf('(%s IS NULL)', escapedProperty);
                        }

                }
        }
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * Implements startsWith(a,b) expression formatter.
     * @deprecated Use $startsWith() instead
     * @param {*} p0
     * @param {*} p1
     * @returns {string}
     */
    $startswith(p0, p1) {
        return this.$startsWith(p0, p1);
    }

    $startsWith(p0, p1) {
        return sprintf('(%s REGEXP \'^%s\')', this.escape(p0), this.escape(p1, true));
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * Implements endsWith(a,b) expression formatter.
     * @deprecated Use $endsWith() instead
     * @param {*} p0
     * @param {*} p1
     * @returns {string}
     */
    $endswith(p0, p1) {
        return this.$endsWith(p0, p1);
    }

    $endsWith(p0, p1) {
        return sprintf('(%s REGEXP \'%s$$\')', this.escape(p0), this.escape(p1, true));
    }
    /**
     * Implements regular expression formatting.
     * @param {*} p0
     * @param {string|*} p1
     * @returns {string}
     */
    $regex(p0, p1) {
        //validate params
        if (isNil(p0) || isNil(p1))
            return '';
        return sprintf('(%s REGEXP \'%s\')', this.escape(p0), this.escape(p1, true));
    }
    /**
     * Implements length(a) expression formatter.
     * @param {*} p0
     * @returns {string}
     */
    $length(p0) {
        return sprintf('LENGTH(%s)', this.escape(p0));
    }
    //noinspection JSUnusedGlobalSymbols
    /**
     * Implements length(a) expression formatter.
     * @deprecated Use $ifNull() instead
     * @param {*} p0
     * @param {*} p1
     * @returns {string}
     */
    $ifnull(p0, p1) {
        return this.$ifNull(p0, p1);
    }

    $ifNull(p0, p1) {
        return sprintf('COALESCE(%s,%s)', this.escape(p0), this.escape(p1));
    }
    /**
     * Implements trim(a) expression formatter.
     * @param {*} p0
     * @returns {string}
     */
    $trim(p0) {
        return sprintf('TRIM(%s)', this.escape(p0));
    }
    // noinspection JSCommentMatchesSignature
    /**
     * Implements concat(a,b,...) expression formatter.
     * @param {...*} p0
     * @returns {string}
     */
    $concat() {
        let args = Array.from(arguments);
        let self = this;
        return sprintf('CONCAT(%s)', args.map(function (arg) {
            return self.escape(arg);
        }).join(', '));
    }
    /**
     * Implements indexOf(str,substr) expression formatter.
     * @deprecated use $indexOf() instead
     * @param {string} p0 The source string
     * @param {string} p1 The string to search for
     * @returns {string}
     */
    $indexof(p0, p1) {
        return this.$indexOf(p0, p1);
    }
    $indexOf(p0, p1) {
        return sprintf('(LOCATE(%s,%s)-1)', this.escape(p1), this.escape(p0));
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * Implements indexOf(str,substr) expression formatter.
     * @param {string} p0 The source string
     * @param {string} p1 The string to search for
     * @returns {string}
     */
    $indexOfBytes(p0, p1) {
        return this.$indexOf(p0, p1);
    }
    /**
     * Implements substring(str,pos) expression formatter.
     * @param {String} p0 The source string
     * @param {Number} pos The starting position
     * @param {Number=} length The length of the resulted string
     * @returns {string}
     */
    $substring(p0, pos, length) {
        if (length)
            return sprintf('SUBSTRING(%s,%s,%s)', this.escape(p0), pos.valueOf() + 1, length.valueOf());

        else
            return sprintf('SUBSTRING(%s,%s)', this.escape(p0), pos.valueOf() + 1);
    }
    $substr(p0, pos, length) {
        return this.$substring(p0, pos, length);
    }
    /**
     * Implements lower(str) expression formatter.
     * @param {String} p0
     * @returns {string}
     */
    $tolower(p0) {
        return sprintf('LOWER(%s)', this.escape(p0));
    }
    /**
     * Implements upper(str) expression formatter.
     * @param {String} p0
     * @returns {string}
     */
    $toupper(p0) {
        return sprintf('UPPER(%s)', this.escape(p0));
    }
    /**
     * Implements contains(a,b) expression formatter.
     * @param {*} p0
     * @param {*} p1
     * @returns {string}
     */
    $contains(p0, p1) {
        return this.$text(p0, p1);
    }
    /**
     * Implements contains(a,b) expression formatter.
     * @param {string|*} p0
     * @param {string|*} p1
     * @returns {string}
     */
    $text(p0, p1) {
        //validate params
        if (isNil(p0) || isNil(p1))
            return '';
        if (p1.valueOf().toString().length === 0)
            return '';
        return sprintf('(%s REGEXP \'%s\')', this.escape(p0), this.escape(p1, true));
    }
    $day(p0) { return sprintf('DAY(%s)', this.escape(p0)); }
    $month(p0) { return sprintf('MONTH(%s)', this.escape(p0)); }
    $year(p0) { return sprintf('YEAR(%s)', this.escape(p0)); }
    $hour(p0) { return sprintf('HOUR(%s)', this.escape(p0)); }
    $minute(p0) { return sprintf('MINUTE(%s)', this.escape(p0)); }
    $second(p0) { return sprintf('SECOND(%s)', this.escape(p0)); }
    $date(p0) {
        return sprintf('DATE(%s)', this.escape(p0));
    }
    $floor(p0) {
        return sprintf('FLOOR(%s)', this.escape(p0));
    }
    $ceiling(p0) {
        return sprintf('CEILING(%s)', this.escape(p0));
    }
    /**
     * Implements round(a) expression formatter.
     * @param {*} p0
     * @param {*=} p1
     * @returns {string}
     */
    $round(p0, p1) {
        if (isNil(p1))
            p1 = 0;
        return sprintf('ROUND(%s,%s)', this.escape(p0), this.escape(p1));
    }
    /**
     * Implements a + b expression formatter.
     * @param {*} p0
     * @param {*} p1
     * @returns {string}
     */
    $add(p0, p1) {
        //validate params
        if (isNil(p0) || isNil(p1))
            return '0';
        return sprintf('(%s + %s)', this.escape(p0), this.escape(p1));
    }
    //noinspection JSUnusedGlobalSymbols
    /**
     * Validates whether the given parameter is a field object or not.
     * @param obj
     * @returns {boolean}
     */
    isField(obj) {
        if (isNil(obj))
            return false;
        if (typeof obj === 'object')
            if (Object.prototype.hasOwnProperty.call(obj, '$name'))
                return true;
        return false;
    }
    /**
     * Implements a - b expression formatter.
     * @param {*} p0
     * @param {*} p1
     * @returns {string}
     */
    $sub(p0, p1) {
        //validate params
        if (isNil(p0) || isNil(p1))
            return '0';
        return sprintf('(%s - %s)', this.escape(p0), this.escape(p1));
    }
    /**
     * Implements a * b expression formatter.
     * @param p0 {*}
     * @param p1 {*}
     */
    $mul(p0, p1) {
        //validate params
        if (isNil(p0) || isNil(p1))
            return '0';
        return sprintf('(%s * %s)', this.escape(p0), this.escape(p1));
    }
    /**
     * Implements a mod b expression formatter.
     * @param p0 {*}
     * @param p1 {*}
     */
    $mod(p0, p1) {
        //validate params
        if (isNil(p0) || isNil(p1))
            return '0';
        return sprintf('(%s %% %s)', this.escape(p0), this.escape(p1));
    }
    /**
     * Implements [a / b] expression formatter.
     * @param p0 {*}
     * @param p1 {*}
     */
    $div(p0, p1) {
        //validate params
        if (isNil(p0) || isNil(p1))
            return '0';
        return sprintf('(%s / %s)', this.escape(p0), this.escape(p1));
    }
    /**
     * Implements [a & b] bitwise and expression formatter.
     * @param p0 {*}
     * @param p1 {*}
     */
    $bit(p0, p1) {
        //validate params
        if (isNil(p0) || isNil(p1))
            return '0';
        return sprintf('(%s & %s)', this.escape(p0), this.escape(p1));
    }
    /**
     *
     * @param query {QueryExpression|*}
     * @returns {string}
     */
    formatCount(query) {
        //validate select expression
        if (isNil(query.$select)) {
            throw new Error('Invalid query expression. Expected a valid select expression.');
        }
        //get count alias
        let alias = query.$count || DEFAULT_COUNT_ALIAS;
        //format select statement (ignore paging parameters even if there are existing)
        let sql = this.formatSelect(query);
        //return final count expression by setting the derived sql statement as sub-query
        return 'SELECT COUNT(*) AS ' + this.escapeName(alias) + ' FROM (' + sql + ') ' + this.escapeName('c0');
    }
    /**
     * Formats a fixed query expression where select fields are constants e.g. SELECT 1 AS `id`,'John' AS `givenName` etc
     * @param obj {QueryExpression|*}
     * @returns {string}
     */
    formatFixedSelect(obj) {
        let self = this;
        let fields = obj.fields();
        return 'SELECT ' + map(fields, function (x) { return self.format(x, '%f'); }).join(', ');
    }
    /**
     *
     * @param obj {QueryExpression|*}
     * @returns {string}
     */
    formatSelect(obj) {
        let $this = this, sql = '', escapedEntity;
        if (isNil(obj.$select))
            throw new Error('Select expression cannot be empty at this context.');
        //get entity name
        let entity = Object.key(obj.$select);
        let joins = [];
        if (!isNil(obj.$expand)) {
            if (Array.isArray(obj.$expand))
                joins = obj.$expand;

            else
                joins.push(obj.$expand);
        }
        //get entity fields
        let fields = obj.fields();
        //if fields is not an array
        if (!Array.isArray(fields))
            throw new Error('Select expression does not contain any fields or the collection of fields is of the wrong type.');

        //validate entity reference (if any)
        if (obj.$ref && obj.$ref[entity]) {
            let entityRef = obj.$ref[entity];
            //escape entity ref
            if (instanceOf(entityRef, QueryExpression)) {
                escapedEntity = '(' + this.format(entityRef) + ') ' + $this.escapeEntity(entity);
            }
            else {
                escapedEntity = entityRef.$as ? $this.escapeEntity(entityRef.name) + getAliasKeyword.bind($this)() + $this.escapeName(entityRef.$as) : $this.escapeEntity(entityRef.name);
            }
        }
        else {
            //escape entity name
            escapedEntity = $this.escapeEntity(entity);
        }
        //add basic SELECT statement
        if (Object.prototype.hasOwnProperty.call(obj, '$fixed') && obj.$fixed === true) {
            sql = sql.concat('SELECT * FROM (', $this.formatFixedSelect(obj), ') ', escapedEntity);
        }
        else {
            sql = sql.concat(obj.$distinct ? 'SELECT DISTINCT ' : 'SELECT ', map(fields, function (x) {
                return $this.format(x, '%f');
            }).join(', '), ' FROM ', escapedEntity);
        }
        /**
         * @type {Array<QueryEntity|QueryExpression>}
         */
        const additionalSelect = obj.$additionalSelect;
        if (Array.isArray(additionalSelect) && additionalSelect.length) {
           const additionalSelectSql = additionalSelect.map((item) => {
                return this.formatAdditionalSelect(item);
            });
            sql += ', ' + additionalSelectSql.join(', ');
        }

        //add join if any
        if (obj.$expand !== null) {
            //enumerate joins
            forEach(joins, function (x) {
                let table;
                // get join direction or inner
                let joinType = ((x.$entity && x.$entity.$join) || 'inner').toUpperCase();
                if (instanceOf(x.$entity, QueryExpression)) {
                    // append joined query expression
                    sql += sprintf(' %s JOIN (%s)', joinType, $this.format(x.$entity));
                    // add alias
                    if (x.$entity.$alias)
                        sql = sql.concat(getAliasKeyword.bind($this)()).concat($this.escapeName(x.$entity.$alias));
                }
                else {
                    sql += ' ' + joinType + ' JOIN ';
                    if (typeof x.$entity === 'object') {
                        const [key] = Object.keys(x.$entity);
                        if (isMethodOrNameReference(key)) {
                            sql += $this.escape(x.$entity);
                            const alias = x.$as || x.$entity.$as;
                            if (alias) {
                                sql += getAliasKeyword.bind($this)();
                                sql += $this.escapeName(alias);
                            }
                            const strWhere = $this.formatWhere(x.$with);
                            if (typeof strWhere === 'string' && strWhere.length > 0) {
                                sql += ' ON ' + strWhere;
                            }
                            return;
                        }
                    }
                    //get join table name
                    table = Object.key(x.$entity);
                    sql += $this.escapeEntity(table);
                    // add alias
                    if (x.$entity.$as) {
                        sql = sql.concat(getAliasKeyword.bind($this)()).concat($this.escapeName(x.$entity.$as));
                    }
                }
                if (Array.isArray(x.$with)) {
                    if (x.$with.length !== 2)
                        throw new Error('Invalid join comparison expression.');
                    //get left and right expression
                    let left = x.$with[0], right = x.$with[1],
                        //the default left table is the query entity
                        leftTable = entity,
                        //the default right table is the join entity
                        rightTable = table;
                    if (typeof left === 'object') {
                        leftTable = Object.key(left);
                    }
                    if (typeof right === 'object') {
                        rightTable = Object.key(right);
                    }
                    let leftFields = left[leftTable], rightFields = right[rightTable];
                    for (let i = 0; i < leftFields.length; i++) {
                        let leftExpr = null, rightExpr = null;
                        if (typeof leftFields[i] === 'object')
                            leftExpr = leftFields[i];
                        else {
                            leftExpr = {};
                            leftExpr[leftTable] = leftFields[i];
                        }
                        if (typeof rightFields[i] === 'object')
                            rightExpr = rightFields[i];
                        else {
                            rightExpr = {};
                            rightExpr[rightTable] = rightFields[i];
                        }
                        sql = sql.concat((i === 0) ? ' ON ' : ' AND ', $this.formatField(leftExpr), '=', $this.formatField(rightExpr));
                    }
                }
                else {
                    sql = sql.concat(' ON ', $this.formatWhere(x.$with));
                }
            });
        }
        //add WHERE statement if any
        if (isObject(obj.$where)) {
            if (isObject(obj.$prepared)) {
                let where1 = { $and: [obj.$where, obj.$prepared] };
                sql = sql.concat(' WHERE ', this.formatWhere(where1));
            }
            else {
                sql = sql.concat(' WHERE ', this.formatWhere(obj.$where));
            }

        }
        else {
            if (isObject(obj.$prepared))
                sql = sql.concat(' WHERE ', this.formatWhere(obj.$prepared));
        }

        if (isObject(obj.$group))
            sql = sql.concat(this.formatGroupBy(obj.$group));

        if (isObject(obj.$order))
            sql = sql.concat(this.formatOrder(obj.$order));

        // finally, return statement
        return sql;
    }
    /**
     *
     * @param {QueryExpression} obj
     * @returns {string}
     */
    formatLimitSelect(obj) {

        let sql = this.formatSelect(obj);
        if (obj.$take) {
            if (obj.$skip)
                //add limit and skip records
                sql = sql.concat(' LIMIT ', obj.$skip.toString(), ', ', obj.$take.toString());

            else
                //add only limit
                sql = sql.concat(' LIMIT ', obj.$take.toString());
        }
        return sql;
    }
    formatField(obj) {
        let self = this;
        if (isNil(obj))
            return '';
        if (typeof obj === 'string')
            return obj;
        if (Array.isArray(obj)) {
            return map(obj, function (x) {
                return x.valueOf();
            }).join(', ');
        }
        if (typeof obj === 'object') {
            //if field is a constant e.g. { $value:1000 }
            if (Object.prototype.hasOwnProperty.call(obj, '$value'))
                return this.escapeConstant(obj['$value']);
            //get table name
            let tableName = Object.key(obj);
            let fields = [];
            if (!Array.isArray(obj[tableName])) {
                fields.push(obj[tableName]);
            }
            else {
                fields = obj[tableName];
            }
            return map(fields, function (x) {
                /**
                 * @type {*}
                 */
                const value = x.valueOf();
                if (QueryField.FieldNameExpression.test(value)) {
                    return self.escapeName(tableName.concat('.').concat(value));
                } else {
                    return self.escapeName(x.valueOf());
                }
            }).join(', ');
        }
    }
    /**
     * Formats a order object to the equivalent SQL statement
     * @param obj
     * @returns {string}
     */
    formatOrder(obj) {
        let self = this;
        if (!Array.isArray(obj))
            return '';
        let sql = map(obj, function (x) {
            let f = x.$desc ? x.$desc : x.$asc;
            if (isNil(f))
                throw new Error('An order by object must have either ascending or descending property.');
            if (Array.isArray(f)) {
                return map(f, function (a) {
                    return self.format(a, '%ff').concat(x.$desc ? ' DESC' : ' ASC');
                }).join(', ');
            }
            return self.format(f, '%ff').concat(x.$desc ? ' DESC' : ' ASC');
        }).join(', ');
        if (sql.length > 0)
            return ' ORDER BY '.concat(sql);
        return sql;
    }
    /**
     * Formats a group by object to the equivalent SQL statement
     * @param obj {Array}
     * @returns {string}
     */
    formatGroupBy(obj) {
        let self = this;
        if (!Array.isArray(obj))
            return '';
        let arr = [];
        forEach(obj, function (x) {
            arr.push(self.format(x, '%ff'));
        });
        let sql = arr.join(', ');
        if (sql.length > 0)
            return ' GROUP BY '.concat(sql);
        return sql;
    }
    /**
     * Formats an insert query to the equivalent SQL statement
     * @param obj {QueryExpression|*}
     * @returns {string}
     */
    formatInsert(obj) {
        let self = this, sql = '';
        if (obj.$insert == null){
            throw new Error('Insert expression cannot be empty at this context.');
        }
        //get entity name
        let entity = Object.key(obj.$insert);
        //get entity fields
        let obj1 = obj.$insert[entity];
        if (obj1 instanceof QueryExpression) {
            return self.formatInsertInto(obj);
        }
        let props = [];
        for (let prop in obj1)
            if (Object.prototype.hasOwnProperty.call(obj1, prop))
                props.push(prop);
        sql = sql.concat('INSERT INTO ', self.escapeEntity(entity), '(', map(props, function (x) { return self.escapeName(x); }).join(', '), ') VALUES (',
            map(props, function (x) {
                let value = obj1[x];
                return self.escape(value !== null ? value : null);
            }).join(', '), ')');
        return sql;
    }

    /**
     * Formats an insert into table(field1, field2, ..)) select from query to the equivalent SQL statement
     * @param {QueryExpression} expr 
     * @returns {string}
     */
    formatInsertInto(expr) {
        if (expr.$insert == null) {
            throw new Error('Insert expression cannot be empty at this context.');
        }
        //get entity name
        const entity = Object.key(expr.$insert);
        const insertExpr = expr.$insert[entity];
        if (insertExpr instanceof QueryExpression === false) {
            throw new Error('Invalid insert expression. Expected a valid query expression.')
        }
        const select = insertExpr.$select;
        if (select == null) {
            throw new Error('Invalid insert expression. Expected a valid select expression.');
        }
        let sql = 'INSERT INTO ' + this.escapeName(entity);
        // get fields
        let fields = [];
        const FormatterCtor = Object.getPrototypeOf(this).constructor;
        /**
         * @type {SqlFormatter}
         */
        const formatter = new FormatterCtor();
        for (let key in select) {
            if (Object.prototype.hasOwnProperty.call(select, key)) {
                const selectFields = select[key];
                fields = selectFields.map(function(selectField) {
                    let name;
                    if (selectField instanceof QueryField) {
                        name = selectField.as() || selectField.getName();
                    } else {
                        const field = new QueryField(selectField);
                        name = field.as() || field.getName();
                    }
                    if (name == null) {
                        throw new Error('Invalid select field. Expected a valid field name.');
                    }
                    const qualified = name.split('.');
                    return formatter.escapeName(qualified[qualified.length - 1]);
                });
                break;
            }
        }
        if (fields.length === 0) {
            throw new Error('Invalid insert into expression. Fields cannot be empty.');
        }
        sql += ' ';
        sql += '(' + fields.join(', ') + ')';
        sql += ' ' + formatter.format(insertExpr);
        return sql;
    }

    /**
     * Formats an update query to the equivalent SQL statement
     * @param obj {QueryExpression|*}
     * @returns {string}
     */
    formatUpdate(obj) {
        let self = this, sql = '';
        if (!isObject(obj.$update))
            throw new Error('Update expression cannot be empty at this context.');
        //get entity name
        let entity = Object.key(obj.$update);
        //get entity fields
        let obj1 = obj.$update[entity];
        let props = [];
        for (let prop in obj1)
            if (Object.prototype.hasOwnProperty.call(obj1, prop))
                props.push(prop);
        //add basic INSERT statement
        sql = sql.concat('UPDATE ', self.escapeEntity(entity), ' SET ',
            map(props, function (x) {
                let value = obj1[x];
                return self.escapeName(x).concat('=', self.escape(value !== null ? value : null));
            }).join(', '));
        if (isObject(obj.$where))
            sql = sql.concat(' WHERE ', this.formatWhere(obj.$where));
        return sql;
    }
    /**
     * Formats a delete query to the equivalent SQL statement
     * @param expr {QueryExpression|*}
     * @returns {string}
     */
    formatDelete(expr) {
        let sql = '';
        if (expr.$delete == null) {
            throw new Error('Delete expression cannot be empty at this context.');
        }
        //get entity name
        let entity = expr.$delete;
        //add basic INSERT statement
        sql = sql.concat('DELETE FROM ', this.escapeEntity(entity));
        if (expr.$where != null) {
            sql = sql.concat(' WHERE ', this.formatWhere(expr.$where));
        }
        return sql;
    }
    escapeName(name) {
        // escape a named object e.g. { $name: 'lastName' }
        if (typeof name === 'object' && Object.prototype.hasOwnProperty.call(name, '$name')) {
            return this.escapeName(name.$name); 
        }
        // throw error for unexpected type
        if (typeof name !== 'string') {
            throw new Error('Invalid name expression. Expected string.');
        }
        let str = name;
        if (isNameReference(str)) {
            str = trimNameReference(name);
        }
        return ObjectNameValidator.validator.escape(str, this.settings.nameFormat);
    }

    escapeEntity(name) {
        if (typeof name !== 'string') {
            throw new Error('Invalid entity expression. Expected string.');
        }
        let str = name;
        if (isNameReference(str)) {
            str = trimNameReference(name);
        }
        return ObjectNameValidator.validator.escape(str, this.settings.nameFormat);
    }

    /**
     * @param obj {QueryField}
     * @param format {string}
     * @returns {string|*}
     */
    formatFieldEx(obj, format) {

        if (isNil(obj))
            return null;
        if (instanceOf(obj, QueryField) === false)
            throw new Error('Invalid argument. An instance of QueryField class is expected.');
        //get property
        let prop = Object.key(obj);
        if (isNil(prop))
            return null;
        let useAlias = (format === '%f');
        if (prop === '$name') {
            if (/\.\*$/.test(obj.$name)) {
                return this.escapeName(obj.$name);
            }
            return (this.settings.forceAlias && useAlias) ? this.escapeName(obj.$name).concat(' AS ', this.escapeName(obj.getName())) : this.escapeName(obj.$name);
        }
        else {
            let expr = obj[prop];
            if (isNil(expr))
                throw new Error('Field definition cannot be empty while formatting.');
            if (typeof expr === 'string') {
                return useAlias ? this.escapeName(expr).concat(' AS ', this.escapeName(prop)) : expr;
            }
            let args;
            let s;
            let fn;
            if (typeof this[prop] === 'function') {
                fn = this[prop];
                args = expr;
                if (Array.isArray(args)) {
                    return fn.apply(this, args);
                } else {
                    return fn.call(this, args);
                }
            }
            //get aggregate expression
            let alias = prop;
            prop = Object.key(expr);
            let name = expr[prop];
            switch (prop) {
                case '$name':
                    s = this.escapeName(name);
                    break;
                case '$literal':
                case '$value':
                    s = this.escapeConstant(name);
                    break;
                default:
                    fn = this[prop];
                    if (typeof fn === 'function') {
                        args = expr[prop];
                        if (Array.isArray(args)) {
                            s = fn.apply(this, args);
                        } else {
                            s = fn.call(this, args);
                        }
                    }
                    else {
                        throw new Error('The specified function is not yet implemented.');
                    }
            }
            return useAlias ? s.concat(' AS ', this.escapeName(alias)) : s;
        }
    }
    /**
     * Formats a query expression and returns the SQL equivalent string
     * @param obj {QueryExpression|*}
     * @param s {string=}
     * @returns {string|*}
     */
    format(obj, s) {
        if (isNil(obj))
            return null;
        //if a format is defined
        if (typeof s === 'string') {
            if ((s === '%f') || (s === '%ff')) {
                //field formatting
                let field = new QueryField();
                if (typeof obj === 'string')
                    field.select(obj);

                else
                    field = Object.assign(new QueryField(), obj);
                return this.formatFieldEx(field, s);
            } else if (s === '%o') {
                if (instanceOf(obj, QueryExpression))
                    return this.formatOrder(obj.$order);
                return this.formatOrder(obj);
            } else {
                throw new Error('Invalid format expression.');
            }
        }

        /**
         * @type {QueryExpression}
         */
        let query;
        //cast object to QueryExpression
        if (instanceOf(obj, QueryExpression)) {
            query = obj;
        } else {
            query = Object.assign(new QueryExpression(), obj);
        }
        //format query
        const filtered = typeof query.$where === 'object' || typeof query.$prepared === 'object';
        if (typeof query.$select === 'object') {
            if (isString(query.$count)) {
                return this.formatCount(query);
            }
            if (!query.hasPaging())
                return this.formatSelect(query);
            else
                return this.formatLimitSelect(query);
        } else if (typeof query.$insert === 'object') {
            return this.formatInsert(query);
        } else if (typeof query.$update === 'object') {
            if (filtered === false) {
                throw new Error('Invalid update expression. Expected a valid where clause.');
            }
            return this.formatUpdate(query);
        } else if (typeof query.$delete === 'object' || typeof query.$delete === 'string') {
            if (filtered === false) {
                throw new Error('Invalid delete expression. Expected a valid where clause.');
            }
            return this.formatDelete(query);
        } else if (typeof query.$where === 'object') {
            return this.formatWhere(query.$where);
        } else {
            throw new Error('Invalid source expression. Expected a valid query expression.');
        }

    }
    $eq(left, right) {
        if (right == null) {
            return sprintf('%s IS NULL', this.escape(left));
        }
        if (Object.prototype.hasOwnProperty.call(right, '$value') && right.$value == null) {
            return sprintf('%s IS NULL', this.escape(left));
        }
        if (Array.isArray(right)) {
            return this.$in(left, right);
        }
        return sprintf('%s = %s', this.escape(left), this.escape(right));
    }
    $ne(left, right) {
        if (right == null) {
            return sprintf('(NOT %s IS NULL)', this.escape(left));
        }
        if (Object.prototype.hasOwnProperty.call(right, '$value') && right.$value == null) {
            return sprintf('(NOT %s IS NULL)', this.escape(left));
        }
        if (Array.isArray(right)) {
            return this.$nin(left, right);
        }
        return sprintf('(NOT %s = %s)', this.escape(left), this.escape(right));
    }
    $gt(left, right) {
        return sprintf('%s > %s', this.escape(left), this.escape(right));
    }
    $gte(left, right) {
        return sprintf('%s >= %s', this.escape(left), this.escape(right));
    }
    $lt(left, right) {
        return sprintf('%s < %s', this.escape(left), this.escape(right));
    }
    $lte(left, right) {
        return sprintf('%s <= %s', this.escape(left), this.escape(right));
    }
    $in(left, right) {
        let leftOperand = this.escape(left);
        if (right == null) {
            return sprintf('%s IS NULL', leftOperand);
        }
        if (Array.isArray(right)) {
            if (right.length === 0) {
                return sprintf('%s IS NULL', leftOperand);
            }
            let self = this;
            let values = right.map(function (x) {
                return self.escape(x);
            });
            let rightOperand = values.join(', ');
            return sprintf('%s IN (%s)', leftOperand, rightOperand);
        }
        throw new Error('Invalid in expression. Right operand must be an array');
    }
    $nin(left, right) {
        let leftOperand = this.escape(left);
        if (right == null) {
            return sprintf('NOT %s IS NULL', leftOperand);
        }
        if (Array.isArray(right)) {
            if (right.length === 0) {
                return sprintf('NOT %s IS NULL', leftOperand);
            }
            let self = this;
            let values = right.map(function (x) {
                return self.escape(x);
            });
            let rightOperand = values.join(', ');
            return sprintf('NOT %s IN (%s)', leftOperand, rightOperand);
        }
        throw new Error('Invalid in expression. Right operand must be an array');
    }
    $avg(arg) {
        return sprintf('AVG(%s)', typeof arg === 'string' ? this.escapeName(arg) : this.escape(arg));
    }
    $min(arg) {
        return sprintf('MIN(%s)', typeof arg === 'string' ? this.escapeName(arg) : this.escape(arg));
    }
    $max(arg) {
        return sprintf('MAX(%s)', typeof arg === 'string' ? this.escapeName(arg) : this.escape(arg));
    }
    $sum(arg) {
        return sprintf('SUM(%s)', typeof arg === 'string' ? this.escapeName(arg) : this.escape(arg));
    }
    $count(arg) {
        return sprintf('COUNT(%s)', typeof arg === 'string' ? this.escapeName(arg) : this.escape(arg));
    }
    $toLower(p0) {
        return this.$tolower(p0);
    }
    $toUpper(p0) {
        return this.$toupper(p0);
    }
    $dayOfMonth(p0) {
        return this.$day(p0);
    }
    $minutes(p0) {
        return this.$minute(p0);
    }
    $seconds(p0) {
        return this.$second(p0);
    }
    $subtract(p0, p1) {
        return this.$sub(p0, p1);
    }
    $multiply(p0, p1) {
        return this.$mul(p0, p1);
    }
    $divide(p0, p1) {
        return this.$div(p0, p1);
    }

    $cond(ifExpr, thenExpr, elseExpr) {
        // validate ifExpr which should an instance of QueryExpression or a comparison expression
        let ifExpression;
        if (instanceOf(ifExpr, QueryExpression)) {
            ifExpression = this.formatWhere(ifExpr.$where);
        } else if (this.isComparison(ifExpr) || this.isLogical(ifExpr)) {
            ifExpression = this.formatWhere(ifExpr);
        } else {
            throw new Error('Condition parameter should be an instance of query or comparison expression');
        }
        return sprintf('(CASE %s WHEN 1 THEN %s ELSE %s END)', ifExpression, this.escape(thenExpr), this.escape(elseExpr));
    }

    /**
     * Formats a switch expression
     * e.g. CASE WHEN weight>100 THEN 'Heavy' WHEN weight<20 THEN 'Light' ELSE 'Normal' END
     * @param {{branches: Array<{ case: *, then: * }>, default: *}} expr
     * @returns {string}
     */
    $switch(expr) {
        const branches = expr.branches;
        const defaultValue = expr.default;
        if (Array.isArray(branches) === false) {
            throw new Error('Switch branches must be an array');
        }
        if (branches.length === 0) {
            throw new Error('Switch branches cannot be empty');
        }
        let str = '(CASE';
        str += ' ';
        str += branches.map((branch) => {
            let caseExpression;
            if (instanceOf(branch.case, QueryExpression)) {
                caseExpression = this.formatWhere(branch.case.$where);
            } else if (this.isComparison(branch.case) || this.isLogical(branch.case)) {
                caseExpression = this.formatWhere(branch.case);
            } else {
                throw new Error('Case expression should be an instance of query or comparison expression');
            }
            return sprintf('WHEN %s THEN %s', caseExpression, this.escape(branch.then));
        }).join(' ');
        if (typeof defaultValue !== 'undefined') {
            str += ' ELSE ';
            str += this.escape(defaultValue);
        }
        str += ' END)';
        return str;
    }
    // eslint-disable-next-line no-unused-vars
    $or(arg) {
        const args = Array.from(arguments);
        if (args.length < 2) {
            throw new Error('A logical expression must have at least two operands.')
        }
        let sql = '(';
        sql += args.map((value) => {
            return this.formatWhere(value);
        }).join(' OR ');
        sql += ')';
        return sql;
    }

    // eslint-disable-next-line no-unused-vars
    $and(arg) {
        const args = Array.from(arguments);
        if (args.length < 2) {
            throw new Error('A logical expression must have at least two operands.')
        }
        let sql = '(';
        sql += args.map((value) => {
            return this.formatWhere(value);
        }).join(' AND ');
        sql += ')';
        return sql;
    }

    $not(arg) {
        let sql = '(NOT ';
        sql += this.formatWhere(arg);
        sql += ')';
        return sql;
    }

    /**
     * @abstract
     * @param {*} arg 
     * @returns {string}
     */
    /* eslint-disable-next-line no-unused-vars */
    $toString(arg) {
        throw new AbstractMethodError();
    }
    /**
     * @abstract
     * @param {*} arg 
     * @returns {string}
     */
     /* eslint-disable-next-line no-unused-vars */
    $toDouble(arg) {
        throw new AbstractMethodError();
    }

    /**
     * @abstract
     * @param {*} arg 
     * @returns {string}
     */
     /* eslint-disable-next-line no-unused-vars */
    $toDecimal(arg) {
        throw new AbstractMethodError();
    }

    /**
     * @abstract
     * @param {*} arg 
     * @returns {string}
     */
     /* eslint-disable-next-line no-unused-vars */
    $toInt(arg) {
        throw new AbstractMethodError();
    }

    /**
     * @abstract
     * @param {*} arg 
     * @returns {string}
     */
     /* eslint-disable-next-line no-unused-vars */
    $toLong(arg) {
        throw new AbstractMethodError();
    }

    /**
     * @abstract
     * @param {*} arg
     * @returns {string}
     */
    /* eslint-disable-next-line no-unused-vars */
    $toBoolean(arg) {
        throw new AbstractMethodError();
    }

    /**
     * @abstract
     * @param {*} arg
     * @param {string} type
     * @returns {string}
     */
    /* eslint-disable-next-line no-unused-vars */
    $toDate(arg, type) {
        throw new AbstractMethodError();
    }

    /**
     * Casts an expression to the specified type.
     * @param {*} arg
     * @param {string} type
     * @returns {string}
     */
    $cast(arg, type) {
        switch (type.toLowerCase()) {
            case 'int':
            case 'integer':
                return this.$toInt(arg);
            case 'boolean':
                return this.$toBoolean(arg);
            case 'long':
            case 'bigint':
                return this.$toLong(arg);
            case 'double':
            case 'float':
                return this.$toDouble(arg);
            case 'decimal':
                return this.$toDecimal(arg);
            case 'string':
                return this.$toString(arg);
            case 'date':
            case 'datetime':
            case 'timestamp':
                return this.$toDate(arg, type.toLowerCase());
            case 'guid':
            case 'uuid':
                return this.$toGuid(arg);
            default:
                throw new Error(`The specified cast type '${type}' is not supported.`);
        }
    }

    /**
     * 
     * @param {QueryExpression|*} arg 
     * @returns 
     */
    $query(arg)
    {
        if (typeof arg.$select === 'object') {
            return Number.isInteger(arg.$take) ? `(${this.formatLimitSelect(arg)})` : `(${this.formatSelect(arg)})`;
        }
        throw new Error('Invalid query expression. Expected a valid select expression.');
    }

    /**
     * @protected
     * @param expr
     */
    formatAdditionalJsonSelect(expr) {
        const [key] = Object.keys(expr);
        let sqlSelect = this.escape(expr[key]);
        const sqlAlias = this.escapeName(key);
        // get alias keyword e.g. AS
        const aliasKeyword = getAliasKeyword.bind(this)();
        // append alias
        if (sqlAlias) {
            if (aliasKeyword) {
                sqlSelect += aliasKeyword;
            }
            sqlSelect += sqlAlias;
        }
        return sqlSelect;
    }

    /**
     * @protected
     * @param {QueryEntity|string|*} expr The additional select expression
     * @returns {*}
     */
    formatAdditionalSelect(expr) {
        let sqlSelect = '';
        let sqlAlias = null;
        const aliasKeyword = getAliasKeyword.bind(this)();
        if (instanceOf(expr, QueryEntity)) {
            /**
             * @type {QueryEntity|{$alias: string}}
             */
            const queryEntity = expr;
            sqlSelect = this.escapeEntity(queryEntity.name);
            // get alias
            sqlAlias = queryEntity.$alias ? this.escapeName(queryEntity.$alias) : null;
        }  else if (typeof expr === 'string') {
            sqlSelect = this.escapeEntity(expr)
        } else {
            // try to validate if item is a query expression with a single field
            // e.g. { paymentMethods: { $jsonEach: 'paymentMethods' } }
            // which is equivalent to SELECT json_each(paymentMethods) AS paymentMethods
            const [key] = Object.keys(expr);
            if (expr[key] instanceof MethodCallExpression) {
                /**
                 * @type {MethodCallExpression}
                 */
                const methodCall = expr[key];
                sqlSelect = this.escape(methodCall.exprOf());
                sqlAlias = this.escapeName(key);
            } else if (Object.prototype.hasOwnProperty.call(expr[key], '$jsonEach')) {
                return this.formatAdditionalJsonSelect(expr);
            } else if (Object.prototype.hasOwnProperty.call(expr, '$select')) {
                /**
                 * @type {QueryExpression}
                 */
                const queryExpression = expr;
                // get alias
                sqlAlias = queryExpression.$alias ? this.escapeName(queryExpression.$alias) : null;
                sqlSelect = '(' + this.format(queryExpression) + ')';
            } else {
                throw new Error('Invalid additional select expression.');
            }
        }
        if (sqlAlias) {
            if (aliasKeyword) {
                sqlSelect += aliasKeyword;
            }
            sqlSelect += sqlAlias;
        }
        return sqlSelect;
    }

}

export {
    SqlFormatter
}
