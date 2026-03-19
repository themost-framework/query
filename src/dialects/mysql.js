// MOST Web Framework Codename Zero Gravity Copyright (c) 2017-2022, THEMOST LP All rights reserved
import { sprintf } from 'sprintf-js';
import { SqlFormatter } from '../formatter';

const REGEXP_SINGLE_QUOTE = /\\'/g;
const SINGLE_QUOTE_ESCAPE = '\\\'';
const REGEXP_DOUBLE_QUOTE = /\\"/g;
const DOUBLE_QUOTE_ESCAPE = '\\"';
const REGEXP_SLASH = /\\\\/g;
const SLASH_ESCAPE = '\\\\';

function zeroPad(number, length) {
    number = number || 0;
    let res = number.toString();
    while (res.length < length) {
        res = '0' + res;
    }
    return res;
}

/**
 * Represents the MySQL SQL dialect formatter.
 * @class MySQLDialect
 * @augments {SqlFormatter}
 */
class MySQLDialect extends SqlFormatter {

    static get NAME_FORMAT() {
        return '`$1`';
    }

    /**
     * @constructor
     */
    constructor() {
        super();
        this.settings = {
            nameFormat: MySQLDialect.NAME_FORMAT,
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
        let res = super.escape.bind(this)(value, unquoted);
        if (typeof value === 'string') {
            if (REGEXP_SINGLE_QUOTE.test(res))
                res = res.replace(/\\'/g, SINGLE_QUOTE_ESCAPE);
            if (REGEXP_DOUBLE_QUOTE.test(res))
                res = res.replace(/\\"/g, DOUBLE_QUOTE_ESCAPE);
            if (REGEXP_SLASH.test(res))
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
        return '\'' + year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second + '.' + millisecond + '\'';
    }

    /**
     * Formats a SELECT statement with LIMIT/OFFSET.
     * @param {import('../query').QueryExpression} obj
     * @returns {string}
     */
    formatLimitSelect(obj) {
        let sql = this.formatSelect(obj);
        if (obj.$take) {
            if (obj.$skip) {
                sql = sql.concat(' LIMIT ', obj.$take.toString(), ' OFFSET ', obj.$skip.toString());
            } else {
                sql = sql.concat(' LIMIT ', obj.$take.toString());
            }
        }
        return sql;
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
     * @param {*} p0 The source string or field
     * @param {*} p1 The regular expression pattern
     * @returns {string}
     */
    $regex(p0, p1) {
        return sprintf('(%s REGEXP %s)', this.escape(p0), this.escape(p1, true));
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
        return sprintf('CONCAT(%s)', args.map((a) => this.escape(a)).join(', '));
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
            return sprintf('SUBSTRING(%s,%s + 1,%s)', this.escape(p0), this.escape(pos), this.escape(length));
        } else {
            return sprintf('SUBSTRING(%s,%s + 1)', this.escape(p0), this.escape(pos));
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
        return this.$substring(p0, pos, length);
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
        return sprintf('CEILING(%s)', this.escape(p0));
    }

    $startswith(p0, p1) {
        return this.$startsWith(p0, p1);
    }

    $startsWith(p0, p1) {
        if (p0 == null || p1 == null)
            return '';
        return sprintf('(%s LIKE %s)', this.escape(p0), this.escape(this.escape(p1, true) + '%', true));
    }

    $endswith(p0, p1) {
        return this.$endsWith(p0, p1);
    }

    $endsWith(p0, p1) {
        if (p0 == null || p1 == null)
            return '';
        return sprintf('(%s LIKE %s)', this.escape(p0), this.escape('%' + this.escape(p1, true), true));
    }

    $contains(p0, p1) {
        if (p0 == null || p1 == null)
            return '';
        return sprintf('(%s LIKE %s)', this.escape(p0), this.escape('%' + this.escape(p1, true) + '%', true));
    }

    $day(p0) {
        return sprintf('DAY(%s)', this.escape(p0));
    }

    $dayOfMonth(p0) {
        return sprintf('DAY(%s)', this.escape(p0));
    }

    $month(p0) {
        return sprintf('MONTH(%s)', this.escape(p0));
    }

    $year(p0) {
        return sprintf('YEAR(%s)', this.escape(p0));
    }

    $hour(p0) {
        return sprintf('HOUR(%s)', this.escape(p0));
    }

    $hours(p0) {
        return this.$hour(p0);
    }

    $minute(p0) {
        return sprintf('MINUTE(%s)', this.escape(p0));
    }

    $minutes(p0) {
        return this.$minute(p0);
    }

    $second(p0) {
        return sprintf('SECOND(%s)', this.escape(p0));
    }

    $seconds(p0) {
        return this.$second(p0);
    }

    $date(p0) {
        return sprintf('DATE(%s)', this.escape(p0));
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

    $toString(expr) {
        return sprintf('CAST(%s AS CHAR)', this.escape(expr));
    }

    $toInt(expr) {
        return sprintf('CAST(%s AS SIGNED INT)', this.escape(expr));
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
        return sprintf('CAST(%s AS DECIMAL(%s,%s))', this.escape(expr), p, s);
    }

    $toLong(expr) {
        return sprintf('CAST(%s AS SIGNED)', this.escape(expr));
    }

    $toBoolean(expr) {
        return sprintf('CAST(%s AS UNSIGNED)', this.escape(expr));
    }

    /**
     * @param {*} expr
     * @param {('date'|'datetime'|'timestamp')} type
     * @returns {string}
     */
    $toDate(expr, type) {
        switch (type) {
            case 'date':
                return sprintf('DATE(%s)', this.escape(expr));
            case 'datetime':
            case 'timestamp':
                return sprintf('CAST(%s AS DATETIME)', this.escape(expr));
            default:
                return sprintf('DATE(%s)', this.escape(expr));
        }
    }

    $toGuid(expr) {
        return sprintf('MD5(%s)', this.escape(expr));
    }

    $uuid() {
        return 'UUID()';
    }

    /**
     * @param {('date'|'datetime'|'timestamp')} type
     * @returns {string}
     */
    $getDate(type) {
        switch (type) {
            case 'date':
                return 'CURDATE()';
            case 'datetime':
                return 'NOW()';
            case 'timestamp':
                return 'NOW()';
            default:
                return 'NOW()';
        }
    }
}

export {
    MySQLDialect
};
