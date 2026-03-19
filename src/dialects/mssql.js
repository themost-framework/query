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
 * Represents the Microsoft SQL Server SQL dialect formatter.
 * @class MSSQLDialect
 * @augments {SqlFormatter}
 */
class MSSQLDialect extends SqlFormatter {

    static get NAME_FORMAT() {
        return '[$1]';
    }

    /**
     * @constructor
     */
    constructor() {
        super();
        this.settings = {
            nameFormat: MSSQLDialect.NAME_FORMAT,
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
            // escape single quotes
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
        const millisecond = zeroPad(val.getMilliseconds(), 3);
        return '\'' + year + '-' + month + '-' + day + 'T' + hour + ':' + minute + ':' + second + '.' + millisecond + '\'';
    }

    /**
     * Formats a SELECT statement with OFFSET/FETCH.
     * MSSQL uses OFFSET...FETCH NEXT...ROWS ONLY syntax for pagination.
     * An ORDER BY clause is required for OFFSET/FETCH to work properly.
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
        return sprintf('(CHARINDEX(%s,%s)-1)', this.escape(p1), this.escape(p0));
    }

    /**
     * Implements indexOf(str,substr) expression formatter.
     * @param {string} p0 The source string
     * @param {string} p1 The string to search for
     * @returns {string}
     */
    $indexOf(p0, p1) {
        return sprintf('(CHARINDEX(%s,%s)-1)', this.escape(p1), this.escape(p0));
    }

    /**
     * Implements contains(a,b) expression formatter.
     * @param {*} p0 The source string
     * @param {*} p1 The string to search for
     * @returns {string}
     */
    $text(p0, p1) {
        return sprintf('(CHARINDEX(%s,%s)-1)>=0', this.escape(p1), this.escape(p0));
    }

    /**
     * Implements simple regular expression formatter.
     * MSSQL does not support REGEXP natively; uses LIKE as fallback.
     * @param {*} p0 The source string or field
     * @param {*} p1 The string to search for
     * @returns {string}
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
        return sprintf('(%s LIKE \'%s\')', this.escape(p0), s1);
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
            return sprintf('SUBSTRING(%s,%s + 1,LEN(%s))', this.escape(p0), this.escape(pos), this.escape(p0));
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
        return sprintf('LEN(%s)', this.escape(p0));
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
        return sprintf('(%s LIKE \'%s\')', this.escape(p0), this.escape(p1, true) + '%');
    }

    $endswith(p0, p1) {
        return this.$endsWith(p0, p1);
    }

    $endsWith(p0, p1) {
        if (p0 == null || p1 == null)
            return '';
        return sprintf('(%s LIKE \'%s\')', this.escape(p0), '%' + this.escape(p1, true));
    }

    $contains(p0, p1) {
        if (p0 == null || p1 == null)
            return '';
        return sprintf('(%s LIKE \'%s\')', this.escape(p0), '%' + this.escape(p1, true) + '%');
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
        return sprintf('DATEPART(HOUR, %s)', this.escape(p0));
    }

    $hours(p0) {
        return this.$hour(p0);
    }

    $minute(p0) {
        return sprintf('DATEPART(MINUTE, %s)', this.escape(p0));
    }

    $minutes(p0) {
        return this.$minute(p0);
    }

    $second(p0) {
        return sprintf('DATEPART(SECOND, %s)', this.escape(p0));
    }

    $seconds(p0) {
        return this.$second(p0);
    }

    $date(p0) {
        return sprintf('CAST(%s AS DATE)', this.escape(p0));
    }

    /**
     * @param {*} p0
     * @param {*} p1
     * @returns {string}
     */
    $ifnull(p0, p1) {
        return sprintf('ISNULL(%s, %s)', this.escape(p0), this.escape(p1));
    }

    /**
     * @param {*} p0
     * @param {*} p1
     * @returns {string}
     */
    $ifNull(p0, p1) {
        return sprintf('ISNULL(%s, %s)', this.escape(p0), this.escape(p1));
    }

    $toString(expr) {
        return sprintf('CAST(%s AS NVARCHAR(MAX))', this.escape(expr));
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
        return sprintf('CAST(%s AS DECIMAL(%s,%s))', this.escape(expr), p, s);
    }

    $toLong(expr) {
        return sprintf('CAST(%s AS BIGINT)', this.escape(expr));
    }

    $toBoolean(expr) {
        return sprintf('CAST(%s AS BIT)', this.escape(expr));
    }

    /**
     * @param {*} expr
     * @param {('date'|'datetime'|'timestamp')} type
     * @returns {string}
     */
    $toDate(expr, type) {
        switch (type) {
            case 'date':
                return sprintf('CAST(%s AS DATE)', this.escape(expr));
            case 'datetime':
            case 'timestamp':
                return sprintf('CAST(%s AS DATETIME)', this.escape(expr));
            default:
                return sprintf('CAST(%s AS DATE)', this.escape(expr));
        }
    }

    $toGuid(expr) {
        return sprintf('CONVERT(UNIQUEIDENTIFIER, HASHBYTES(\'MD5\', %s))', this.escape(expr));
    }

    $uuid() {
        return 'NEWID()';
    }

    /**
     * @param {('date'|'datetime'|'timestamp')} type
     * @returns {string}
     */
    $getDate(type) {
        switch (type) {
            case 'date':
                return 'CAST(GETUTCDATE() AS DATE)';
            case 'datetime':
                return 'GETUTCDATE()';
            case 'timestamp':
                return 'GETUTCDATE()';
            default:
                return 'GETUTCDATE()';
        }
    }
}

export {
    MSSQLDialect
};
