// MOST Web Framework Codename Zero Gravity Copyright (c) 2017-2022, THEMOST LP All rights reserved
import { sprintf } from 'sprintf-js';
import { SqlFormatter } from '../formatter';

function zeroPad(number, length) {
    number = number || 0;
    let res = number.toString();
    while (res.length < length) {
        res = '0' + res;
    }
    return res;
}

/**
 * Represents the Oracle SQL dialect formatter.
 * @class OracleDialect
 * @augments {SqlFormatter}
 */
class OracleDialect extends SqlFormatter {

    static get NAME_FORMAT() {
        return '"$1"';
    }

    /**
     * @constructor
     */
    constructor() {
        super();
        this.settings = {
            nameFormat: OracleDialect.NAME_FORMAT,
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
            // escape single quotes by doubling them
            res = res.replace(/\\'/g, '\'\'');
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
        return `TIMESTAMP '${year}-${month}-${day} ${hour}:${minute}:${second}'`;
    }

    /**
     * Formats a SELECT statement with OFFSET/FETCH (Oracle 12c+).
     * @param {import('../query').QueryExpression} obj
     * @returns {string}
     */
    formatLimitSelect(obj) {
        let sql = this.formatSelect(obj);
        if (obj.$take) {
            const skip = obj.$skip || 0;
            sql = sql.concat(' OFFSET ', skip.toString(), ' ROWS FETCH NEXT ', obj.$take.toString(), ' ROWS ONLY');
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
     * Implements simple regular expression formatter using Oracle's REGEXP_LIKE.
     * @param {*} p0 The source string or field
     * @param {*} p1 The regular expression pattern
     * @returns {string}
     */
    $regex(p0, p1) {
        return sprintf('REGEXP_LIKE(%s, %s)', this.escape(p0), this.escape(p1));
    }

    /**
     * Implements concat(a,b) expression formatter.
     * Oracle supports both CONCAT() (two-argument) and the || operator.
     * For multiple arguments we nest CONCAT calls.
     * @param {...*} arg
     * @returns {string}
     */
    // eslint-disable-next-line no-unused-vars
    $concat(arg) {
        const args = Array.from(arguments);
        if (args.length < 2) {
            throw new Error('Concat method expects two or more arguments');
        }
        // Build nested CONCAT(a, CONCAT(b, c)) for more than two args
        let result = this.escape(args[args.length - 1]);
        for (let i = args.length - 2; i >= 0; i--) {
            result = sprintf('CONCAT(%s, %s)', this.escape(args[i]), result);
        }
        return result;
    }

    /**
     * Implements substring(str,pos) expression formatter.
     * Oracle uses SUBSTR (1-based index).
     * @param {String} p0 The source string
     * @param {Number} pos The starting position (0-based)
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
     * @param {Number} pos The starting position (0-based)
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
        return sprintf('CEIL(%s)', this.escape(p0));
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
        return sprintf('EXTRACT(DAY FROM %s)', this.escape(p0));
    }

    $dayOfMonth(p0) {
        return sprintf('EXTRACT(DAY FROM %s)', this.escape(p0));
    }

    $month(p0) {
        return sprintf('EXTRACT(MONTH FROM %s)', this.escape(p0));
    }

    $year(p0) {
        return sprintf('EXTRACT(YEAR FROM %s)', this.escape(p0));
    }

    $hour(p0) {
        return sprintf('EXTRACT(HOUR FROM %s)', this.escape(p0));
    }

    $hours(p0) {
        return this.$hour(p0);
    }

    $minute(p0) {
        return sprintf('EXTRACT(MINUTE FROM %s)', this.escape(p0));
    }

    $minutes(p0) {
        return this.$minute(p0);
    }

    $second(p0) {
        return sprintf('EXTRACT(SECOND FROM %s)', this.escape(p0));
    }

    $seconds(p0) {
        return this.$second(p0);
    }

    $date(p0) {
        return sprintf('TRUNC(%s)', this.escape(p0));
    }

    /**
     * @param {*} p0
     * @param {*} p1
     * @returns {string}
     */
    $ifnull(p0, p1) {
        return sprintf('NVL(%s, %s)', this.escape(p0), this.escape(p1));
    }

    /**
     * @param {*} p0
     * @param {*} p1
     * @returns {string}
     */
    $ifNull(p0, p1) {
        return sprintf('NVL(%s, %s)', this.escape(p0), this.escape(p1));
    }

    $toString(expr) {
        return sprintf('TO_CHAR(%s)', this.escape(expr));
    }

    $toInt(expr) {
        return sprintf('CAST(%s AS NUMBER(10,0))', this.escape(expr));
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
        return sprintf('CAST(%s AS NUMBER(%s,%s))', this.escape(expr), p, s);
    }

    $toLong(expr) {
        return sprintf('CAST(%s AS NUMBER(19,0))', this.escape(expr));
    }

    $toBoolean(expr) {
        return sprintf('CAST(%s AS NUMBER(1,0))', this.escape(expr));
    }

    /**
     * @param {*} expr
     * @param {('date'|'datetime'|'timestamp')} type
     * @returns {string}
     */
    $toDate(expr, type) {
        switch (type) {
            case 'date':
                return sprintf('TRUNC(CAST(%s AS DATE))', this.escape(expr));
            case 'datetime':
                return sprintf('CAST(%s AS DATE)', this.escape(expr));
            case 'timestamp':
                return sprintf('CAST(%s AS TIMESTAMP)', this.escape(expr));
            default:
                return sprintf('TRUNC(CAST(%s AS DATE))', this.escape(expr));
        }
    }

    $toGuid(expr) {
        return sprintf('LOWER(RAWTOHEX(DBMS_CRYPTO.HASH(UTL_RAW.CAST_TO_RAW(%s), 2)))', this.escape(expr));
    }

    $uuid() {
        return 'LOWER(RAWTOHEX(SYS_GUID()))';
    }

    /**
     * @param {('date'|'datetime'|'timestamp')} type
     * @returns {string}
     */
    $getDate(type) {
        switch (type) {
            case 'date':
                return 'TRUNC(SYSDATE)';
            case 'datetime':
                return 'SYSDATE';
            case 'timestamp':
                return 'SYSTIMESTAMP';
            default:
                return 'SYSDATE';
        }
    }
}

export {
    OracleDialect
};
