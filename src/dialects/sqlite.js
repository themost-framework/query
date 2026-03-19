// MOST Web Framework Codename Zero Gravity Copyright (c) 2017-2022, THEMOST LP All rights reserved
import { sprintf } from 'sprintf-js';
import { SqlFormatter, QueryField } from '../formatter';
import { isObjectDeep } from '../is-object';

const REGEXP_SINGLE_QUOTE = /\\'/g;
const SINGLE_QUOTE_ESCAPE = '\'\'';
const REGEXP_DOUBLE_QUOTE = /\\"/g;
const DOUBLE_QUOTE_ESCAPE = '"';
const REGEXP_SLASH = /\\\\/g;
const SLASH_ESCAPE = '\\';

function zeroPad(number, length) {
    number = number || 0;
    let res = number.toString();
    while (res.length < length) {
        res = '0' + res;
    }
    return res;
}

/**
 * Represents the SQLite SQL dialect formatter.
 * @class SqliteDialect
 * @augments {SqlFormatter}
 */
class SqliteDialect extends SqlFormatter {

    static get NAME_FORMAT() {
        return '`$1`';
    }

    /**
     * @constructor
     */
    constructor() {
        super();
        this.settings = {
            nameFormat: SqliteDialect.NAME_FORMAT,
            forceAlias: true
        };
    }

    /**
     * Escapes an object or a value and returns the equivalent sql value.
     * @param {*} value - A value that is going to be escaped for SQL statements
     * @param {boolean=} unquoted - An optional value that indicates whether the resulted string will be quoted or not.
     * @returns {string} - The equivalent SQL string value
     */
    escape(value, unquoted) {
        if (typeof value === 'boolean') {
            return value ? '1' : '0';
        }
        if (value instanceof Date) {
            return this.escapeDate(value);
        }
        // serialize array of objects as json array
        if (Array.isArray(value)) {
            // find first non-object value
            const index = value.filter((x) => {
                return x != null;
            }).findIndex((x) => {
                return isObjectDeep(x) === false;
            });
            // if all values are objects
            if (index === -1) {
                return this.escape(JSON.stringify(value)); // return as json array
            }
        }
        let res = super.escape.bind(this)(value, unquoted);
        if (typeof value === 'string') {
            if (REGEXP_SINGLE_QUOTE.test(res))
                //escape single quote (that is already escaped)
                res = res.replace(/\\'/g, SINGLE_QUOTE_ESCAPE);
             //escape double quote (that is already escaped)
             res = res.replace(/\\"/g, DOUBLE_QUOTE_ESCAPE);
            if (REGEXP_SLASH.test(res))
                //escape slash (that is already escaped)
                res = res.replace(/\\\\/g, SLASH_ESCAPE);
        }
        return res;
    }

    /**
     * @param {Date|*} val
     * @returns {string}
     */
    escapeDate(val) {
        const year = val.getFullYear();
        const month = zeroPad(val.getMonth() + 1, 2);
        const day = zeroPad(val.getDate(), 2);
        const hour = zeroPad(val.getHours(), 2);
        const minute = zeroPad(val.getMinutes(), 2);
        const second = zeroPad(val.getSeconds(), 2);
        const millisecond = zeroPad(val.getMilliseconds(), 3);
        //format timezone
        const offset = val.getTimezoneOffset();
        const timezone = (offset <= 0 ? '+' : '-') + zeroPad(-Math.floor(offset / 60), 2) + ':' + zeroPad(offset % 60, 2);
        return '\'' + year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second + '.' + millisecond + timezone + '\'';
    }

    /**
     * Implements indexOf(str,substr) expression formatter.
     * @param {string} p0 The source string
     * @param {string} p1 The string to search for
     * @returns {string}
     */
    $indexof(p0, p1) {
        return sprintf('(INSTR(%s,%s)-1)', this.escape(p0), this.escape(p1));
    }

    /**
     * Implements indexOf(str,substr) expression formatter.
     * @param {string} p0 The source string
     * @param {string} p1 The string to search for
     * @returns {string}
     */
    $indexOf(p0, p1) {
        return sprintf('(INSTR(%s,%s)-1)', this.escape(p0), this.escape(p1));
    }

    /**
     * Implements contains(a,b) expression formatter.
     * @param {*} p0 The source string
     * @param {*} p1 The string to search for
     * @returns {string}
     */
    $text(p0, p1) {
        return sprintf('(INSTR(%s,%s)-1)>=0', this.escape(p0), this.escape(p1));
    }

    /**
     * Implements simple regular expression formatter.
     * Important Note: SQLite 3 does not provide a core sql function for regular expression matching.
     * @param {*} p0 The source string or field
     * @param {*} p1 The string to search for
     */
    $regex(p0, p1) {
        //escape expression
        let s1 = this.escape(p1, true);
        //implement starts with equivalent for LIKE T-SQL
        if (/^\^/.test(s1)) {
            s1 = s1.replace(/^\^/, '');
        } else {
            s1 = '%' + s1;
        }
        //implement ends with equivalent for LIKE T-SQL
        if (/\$$/.test(s1)) {
            s1 = s1.replace(/\$$/, '');
        } else {
            s1 += '%';
        }
        return sprintf('LIKE(\'%s\',%s) >= 1', s1, this.escape(p0));
    }

    /**
     * Implements concat(a,b) expression formatter.
     * @param {...*} arg
     * @returns {string}
     */
    // eslint-disable-next-line no-unused-vars
    $concat(arg) {
        const args = Array.from(arguments);
        if (args.length < 2) {
            throw new Error('Concat method expects two or more arguments');
        }
        let result = '(';
        result += Array.from(args).map((a) => {
            return `IFNULL(${this.escape(a)},'')`
        }).join(' || ');
        result += ')';
        return result;
    }

    /**
     * Implements substring(str,pos) expression formatter.
     * @param {String} p0 The source string
     * @param {Number} pos The starting position
     * @param {Number=} length The length of the resulted string
     * @returns {string}
     */
    $substring(p0, pos, length) {
        if (length) {
            return sprintf('SUBSTR(%s,%s + 1,%s)', this.escape(p0), this.escape(pos), this.escape(length));
        } else {
            return sprintf('SUBSTR(%s,%s + 1)', this.escape(p0), this.escape(pos));
        }
    }

    /**
     * Implements substring(str,pos) expression formatter.
     * @param {String} p0 The source string
     * @param {Number} pos The starting position
     * @param {Number=} length The length of the resulted string
     * @returns {string}
     */
    $substr(p0, pos, length) {
        if (length) {
            return sprintf('SUBSTR(%s,%s + 1,%s)', this.escape(p0), this.escape(pos), this.escape(length));
        } else {
            return sprintf('SUBSTR(%s,%s + 1)', this.escape(p0), this.escape(pos));
        }
    }

    /**
     * Implements length(a) expression formatter.
     * @param {*} p0
     * @returns {string}
     */
    $length(p0) {
        return sprintf('LENGTH(%s)', this.escape(p0));
    }

    $ceiling(p0) {
        return sprintf('CEIL(%s)', this.escape(p0));
    }

    $startswith(p0, p1) {
        return this.$startsWith(p0, p1);
    }

    $startsWith(p0, p1) {
        if (p0 == null || p1 == null)
            return '';
        return 'LIKE(\'' + this.escape(p1, true) + '%\',' + this.escape(p0) + ')';
    }

    $contains(p0, p1) {
        if (p0 == null || p1 == null)
            return '';
        return 'LIKE(\'%' + this.escape(p1, true) + '%\',' + this.escape(p0) + ')';
    }

    $endswith(p0, p1) {
        return this.$endsWith(p0, p1);
    }

    $endsWith(p0, p1) {
        if (p0 == null || p1 == null)
            return '';
        return 'LIKE(\'%' + this.escape(p1, true) + '\',' + this.escape(p0) + ')';
    }

    $day(p0) {
        return `CAST(strftime('%d', ${this.escape(p0)}) AS INTEGER)`;
    }

    $dayOfMonth(p0) {
        return `CAST(strftime('%d', ${this.escape(p0)}) AS INTEGER)`;
    }

    $month(p0) {
        return `CAST(strftime('%m', ${this.escape(p0)}) AS INTEGER)`;
    }

    $year(p0) {
        return `CAST(strftime('%Y', ${this.escape(p0)}) AS INTEGER)`;
    }

    $hour(p0) {
        return `CAST(strftime('%H', ${this.escape(p0)}) AS INTEGER)`;
    }

    $hours(p0) {
        return this.$hour(p0);
    }

    $minute(p0) {
        return `CAST(strftime('%M', ${this.escape(p0)}) AS INTEGER)`;
    }

    $minutes(p0) {
        return this.$minute(p0);
    }

    $second(p0) {
        return `CAST(strftime('%S', ${this.escape(p0)}) AS INTEGER)`;
    }

    $seconds(p0) {
        return this.$second(p0);
    }

    $date(p0) {
        return 'date(' + this.escape(p0) + ')';
    }

    /**
     * @param {*} p0
     * @param {*} p1
     * @returns {string}
     */
    $ifnull(p0, p1) {
        return sprintf('IFNULL(%s, %s)', this.escape(p0), this.escape(p1));
    }

    /**
     * @param {*} p0
     * @param {*} p1
     * @returns {string}
     */
    $ifNull(p0, p1) {
        return sprintf('IFNULL(%s, %s)', this.escape(p0), this.escape(p1));
    }

    $toString(p0) {
        return sprintf('CAST(%s AS TEXT)', this.escape(p0));
    }

    $toInt(expr) {
        return sprintf('CAST(%s AS INT)', this.escape(expr));
    }

    $toDouble(expr) {
        return this.$toDecimal(expr, 19, 8);
    }

    /**
     * @param {*} expr
     * @param {number=} precision
     * @param {number=} scale
     * @returns {string}
     */
    $toDecimal(expr, precision, scale) {
        const p = typeof precision === 'number' ? Math.floor(precision) : 19;
        const s = typeof scale === 'number' ? Math.floor(scale) : 8;
        return sprintf('CAST(%s as DECIMAL(%s,%s))', this.escape(expr), p, s);
    }

    $toLong(expr) {
        return sprintf('CAST(%s AS BIGINT)', this.escape(expr));
    }

    $toBoolean(expr) {
        return sprintf('CAST(%s AS INTEGER)', this.escape(expr));
    }

    /**
     * @param {*} expr
     * @param {('date'|'datetime'|'timestamp')} type
     * @returns {string}
     */
    // eslint-disable-next-line no-unused-vars
    $toDate(expr, type) {
        return sprintf('date(%s)', this.escape(expr));
    }

    $toGuid(expr) {
        return sprintf('uuid_str(crypto_md5(%s))', this.escape(expr));
    }

    $uuid() {
        return 'uuid4()';
    }

    /**
     * @param {('date'|'datetime'|'timestamp')} type
     * @returns {string}
     */
    $getDate(type) {
        switch (type) {
            case 'date':
                return 'date(\'now\')';
            case 'datetime':
                // eslint-disable-next-line quotes
                return `strftime('%F %H:%M:%f+00:00', 'now')`;
            case 'timestamp':
                // eslint-disable-next-line quotes
                return `STRFTIME('%Y-%m-%d %H:%M:%f', DATETIME('now', 'localtime')) || PRINTF('%+.2d:%.2d', ROUND((JULIANDAY('now', 'localtime') - JULIANDAY('now')) * 24), ABS(ROUND((JULIANDAY('now', 'localtime') - JULIANDAY('now')) * 24 * 60) % 60))`;
            default:
                // eslint-disable-next-line quotes
                return `strftime('%F %H:%M:%f+00:00', 'now')`;
        }
    }

    /**
     * @param {*} expr
     * @return {string}
     */
    $jsonGet(expr) {
        if (typeof expr.$name !== 'string') {
            throw new Error('Invalid json expression. Expected a string');
        }
        const parts = expr.$name.split('.');
        const extract = this.escapeName(parts.splice(0, 2).join('.'));
        return `json_extract(${extract}, '$.${parts.join('.')}')`;
    }

    /**
     * @param {*} expr
     * @return {string}
     */
    $jsonEach(expr) {
        return `json_each(${this.escapeName(expr)})`;
    }

    /**
     * @param {...*} expr
     * @returns {string}
     */
    $jsonObject(expr) {
        // handle select expression
        if (expr.$select) {
            // get select fields
            const args = Object.keys(expr.$select).reduce((previous, key) => {
                const fields = expr.$select[key];
                previous.push.apply(previous, fields.map((field) => {
                    if (typeof field === 'string') {
                        return new QueryField(field);
                    }
                    return field;
                }));
                return previous;
            }, []);
            const [key] = Object.keys(expr.$select);
            // prepare select expression to return json array
            expr.$select[key] = [
                {
                    $jsonObject: args // use json_object function
                }
            ];
            // format select expression using json_object
            return `(${this.format(expr)})`;
        }
        // expected an array of QueryField objects
        const args = Array.from(arguments).reduce((previous, current) => {
            // get the first key of the current object
            let [name] = Object.keys(current);
            let value;
            // if the name is not a string then throw an error
            if (typeof name !== 'string') {
                throw new Error('Invalid json object expression. The attribute name cannot be determined.');
            }
            // if the given name is a dialect function (starts with $) then use the current value as is
            // otherwise create a new QueryField object
            if (name.startsWith('$')) {
                value = new QueryField(current[name]);
                name = value.getName();
            } else {
                value = current instanceof QueryField ? new QueryField(current[name]) : current[name];
            }
            // escape json attribute name and value
            previous.push(this.escape(name), this.escape(value));
            return previous;
        }, []);
        return `json_object(${args.join(',')})`;
    }

    /**
     * @param {{ $jsonGet: Array<*> }} expr
     * @returns {string}
     */
    $jsonGroupArray(expr) {
        const [key] = Object.keys(expr);
        if (key !== '$jsonObject') {
            throw new Error('Invalid json group array expression. Expected a json object expression');
        }
        return `json_group_array(${this.escape(expr)})`;
    }

    /**
     * @param {import('../query').QueryExpression} expr
     * @returns {string}
     */
    $jsonArray(expr) {
        if (expr == null) {
            throw new Error('The given query expression cannot be null');
        }
        if (expr instanceof QueryField) {
            // escape expr as field and waiting for parsing results as json array
            return this.escape(expr);
        }
        // treat expr as select expression
        if (expr.$select) {
            // get select fields
            const args = Object.keys(expr.$select).reduce((previous, key) => {
                previous.push.apply(previous, expr.$select[key]);
                return previous;
            }, []);
            const [key] = Object.keys(expr.$select);
            // prepare select expression to return json array
            expr.$select[key] = [
                {
                    $jsonGroupArray: [ // use json_group_array function
                        {
                            $jsonObject: args // use json_object function
                        }
                    ]
                }
            ];
            return `(${this.format(expr)})`;
        }
        // treat expression as query field
        if (Object.prototype.hasOwnProperty.call(expr, '$name')) {
            return this.escape(expr);
        }
        // treat expression as value
        if (Object.prototype.hasOwnProperty.call(expr, '$value')) {
            if (Array.isArray(expr.$value)) {
                return this.escape(JSON.stringify(expr.$value));
            }
            return this.escape(expr);
        }
        if (Object.prototype.hasOwnProperty.call(expr, '$literal')) {
            if (Array.isArray(expr.$literal)) {
                return this.escape(JSON.stringify(expr.$literal));
            }
            return this.escape(expr);
        }
        throw new Error('Invalid json array expression. Expected a valid select expression');
    }
}

export {
    SqliteDialect
};
