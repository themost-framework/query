import { sprintf } from 'sprintf-js';
import { isArray, isNil, forEach, map } from 'lodash';
import { ClosureParser } from '../src';

function zeroPad(num, length) {
    num = num || 0;
    if (typeof num !== 'number') {
        throw new TypeError('Expected number.');
    }
    let res = num.toString();
    if (!/^\d+$/g.test(res)) {
        throw new TypeError('Expected a positive integer.');
    }
    while (res.length < length) {
        res = '0' + res;
    }
    return res;
}

class OpenDataQuery {
    constructor() {
        /**
         * @private
         */
        Object.defineProperty(this, 'privates', {
            enumerable: false,
            configurable: false,
            writable: false,
            value: {}
        });
    }
    /**
     * @private
     * @returns this
     */
    append() {

        let self = this;
        let expressions;
        if (self.privates.left) {
            let expr = null;

            if (self.privates.op === 'in') {
                if (isArray(self.privates.right)) {
                    //expand values
                    expressions = [];
                    forEach(self.privates.right, (x) => {
                        expressions.push(self.privates.left + ' eq ' + this.escape(x));
                    });
                    if (expressions.length > 0)
                        expr = '(' + expressions.join(' or ') + ')';
                }
            }
            else if (self.privates.op === 'nin') {
                if (isArray(self.privates.right)) {
                    //expand values
                    expressions = [];
                    forEach(self.privates.right, (x) => {
                        expressions.push(self.privates.left + ' ne ' + this.escape(x));
                    });
                    if (expressions.length > 0)
                        expr = '(' + expressions.join(' and ') + ')';
                }
            }


            else
                expr = self.privates.left + ' ' + self.privates.op + ' ' + this.escape(self.privates.right);
            if (expr) {
                if (isNil(self.$filter))
                    self.$filter = expr;
                else {
                    self.privates.lop = self.privates.lop || 'and';
                    self.privates._lop = self.privates._lop || self.privates.lop;
                    if (self.privates._lop === self.privates.lop)
                        self.$filter = self.$filter + ' ' + self.privates.lop + ' ' + expr;


                    else
                        self.$filter = '(' + self.$filter + ') ' + self.privates.lop + ' ' + expr;
                    self.privates._lop = self.privates.lop;
                }
            }
        }
        delete self.privates.lop; delete self.privates.left; delete self.privates.op; delete self.privates.right;
        return this;
    }
    /**
     * @param {...string} attr
     * @returns this
     */
    select(attr) {
        let args = (arguments.length > 1) ? Array.prototype.slice.call(arguments) : attr;
        this.$select = map(args, function (arg) {
            if (isArray(arg)) {
                return arg.join(',');
            }
            return arg;
        }).join(',');
        return this;
    }
    /**
     * @param {number} val
     * @returns this
     */
    take(val) {
        this.$top = isNaN(val) ? 0 : val;
        return this;
    }
    /**
     * @param {number} val
     * @returns this
     */
    skip(val) {
        this.$skip = isNaN(val) ? 0 : val;
        return this;
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {string} name
     * @returns this
     */
    orderBy(name) {
        if (!isNil(name)) {
            this.$orderby = name.toString();
        }
        return this;
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {String} name
     * @returns this
     */
    orderByDescending(name) {
        if (!isNil(name)) {
            this.$orderby = name.toString() + ' desc';
        }
        return this;
    }
    /**
     * @param {String} name
     * @returns this
     */
    thenBy(name) {
        if (!isNil(name)) {
            this.$orderby += (this.$orderby ? ',' + name.toString() : name.toString());
        }
        return this;
    }
    /**
     * @param {String} name
     * @returns this
     */
    thenByDescending(name) {
        if (!isNil(name)) {
            this.$orderby += (this.$orderby ? ',' + name.toString() : name.toString()) + ' desc';
        }
        return this;
    }
    /**
     * @param {*} expr
     * @param {*=} params
     * @returns this
     */
    where(expr, params) {
        if (typeof expr === 'function') {
            // parse closure
            let closureParser = new ClosureParser();
            Object.assign(closureParser, {
                resolveMember: (member) => {
                    return member;
                }
            });
            // eslint-disable-next-line no-unused-vars
            const filter = closureParser.parseFilter(expr, params);
            return this;
        }
        this.privates.left = expr;
        return this;
    }
    /**
     * @param {String=} name
     * @returns this
     */
    and(name) {
        this.privates.lop = 'and';
        if (typeof name !== 'undefined')
            this.privates.left = name;
        return this;
    }
    /**
     * @param {String=} name
     * @returns this
     */
    or(name) {
        this.privates.lop = 'or';
        if (typeof name !== 'undefined')
            this.privates.left = name;
        return this;
    }
    /**
     * @param {*} value
     * @returns this
     */
    equal(value) {
        this.privates.op = 'eq'; this.privates.right = value; return this.append();
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {String} name
     * @returns this
     */
    indexOf(name) {
        this.privates.left = 'indexof(' + name + ')';
        return this;
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {*} name
     * @param {*} s
     * @returns this
     */
    endsWith(name, s) {
        this.privates.left = sprintf('endswith(%s,%s)', name, this.escape(s));
        return this;
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {*} name
     * @param {*} s
     * @returns this
     */
    startsWith(name, s) {
        this.privates.left = sprintf('startswith(%s,%s)', name, this.escape(s));
        return this;
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {*} name
     * @param {*} s
     * @returns this
     */
    substringOf(name, s) {
        this.privates.left = sprintf('substringof(%s,%s)', name, this.escape(s));
        return this;
    }
    /**
     * @param {*} name
     * @param {number} pos
     * @param {number} length
     * @returns this
     */
    substring(name, pos, length) {
        this.privates.left = sprintf('substring(%s,%s,%s)', name, pos, length);
        return this;
    }
    /**
     * @param {*} name
     * @returns this
     */
    length(name) {
        this.privates.left = sprintf('length(%s)', name);
        return this;
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {*} name
     * @returns this
     */
    toLower(name) {
        this.privates.left = sprintf('tolower(%s)', name);
        return this;
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {*} name
     * @returns this
     */
    toUpper(name) {
        this.privates.left = sprintf('toupper(%s)', name);
        return this;
    }
    /**
     * @param {*} name
     * @returns this
     */
    trim(name) {
        this.privates.left = sprintf('trim(%s)', name);
        return this;
    }
    /**
     * @param {*} s0
     * @param {*} s1
     * @param {*=} s2
     * @param {*=} s3
     * @param {*=} s4
     * @returns this
     */
    concat(s0, s1, s2, s3, s4) {
        this.privates.left = 'concat(' + this.escape(s0) + ',' + this.escape(s1);
        if (typeof s2 !== 'undefined')
            this.privates.left += ',' + this.escape(s2);
        if (typeof s3 !== 'undefined')
            this.privates.left += ',' + this.escape(s3);
        if (typeof s4 !== 'undefined')
            this.privates.left += ',' + this.escape(s4);
        this.privates.left += ')';
        return this;
    }
    field(name) {
        return { '$name': name };
    }
    /**
     * @param {String} name
     * @returns this
     */
    day(name) {
        this.privates.left = sprintf('day(%s)', name);
        return this;
    }
    /**
     * @param {String} name
     * @returns this
     */
    hour(name) {
        this.privates.left = sprintf('hour(%s)', name);
        return this;
    }
    /**
     * @param {String} name
     * @returns this
     */
    minute(name) {
        this.privates.left = sprintf('minute(%s)', name);
        return this;
    }
    /**
     * @param {String} name
     * @returns this
     */
    month(name) {
        this.privates.left = sprintf('month(%s)', name);
        return this;
    }
    /**
     * @param {String} name
     * @returns this
     */
    second(name) {
        this.privates.left = sprintf('second(%s)', name);
        return this;
    }
    /**
     * @param {String} name
     * @returns this
     */
    year(name) {
        this.privates.left = sprintf('year(%s)', name);
        return this;
    }
    /**
     * @param {String} name
     * @returns this
     */
    round(name) {
        this.privates.left = sprintf('round(%s)', name);
        return this;
    }
    /**
     * @param {String} name
     * @returns this
     */
    floor(name) {
        this.privates.left = sprintf('floor(%s)', name);
        return this;
    }
    /**
     * @param {String} name
     * @returns this
     */
    ceiling(name) {
        this.privates.left = sprintf('ceiling(%s)', name);
        return this;
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {*} value
     * @returns this
     */
    // noinspection JSUnusedGlobalSymbols
    notEqual(value) {
        this.privates.op = 'ne'; this.privates.right = value; return this.append();
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {*} value
     * @returns this
     */
    greaterThan(value) {
        this.privates.op = 'gt'; this.privates.right = value; return this.append();
    }
    /**
     * @param {*} value
     * @returns this
     */
    greaterOrEqual(value) {
        this.privates.op = 'ge'; this.privates.right = value; return this.append();
    }
    /**
     * @param {*} value
     * @returns this
     */
    lowerThan(value) {
        this.privates.op = 'lt'; this.privates.right = value; return this.append();
    }
    /**
     * @param {*} value
     * @returns this
     */
    lowerOrEqual(value) {
        this.privates.op = 'le'; this.privates.right = value; return this.append();
    }
    /**
     * @param {Array} values
     * @returns this
     */
    in(values) {
        this.privates.op = 'in'; this.privates.right = values; return this.append();
    }
    /**
     * @param {Array} values
     * @returns this
     */
    notIn(values) {
        this.privates.op = 'nin'; this.privates.right = values; return this.append();
    }

    escape(val) {
        if ((val == null) || (typeof val === 'undefined')) {
            return 'null';
        }
        if (typeof val === 'boolean') {
            return (val) ? 'true' : 'false';
        }
        if (typeof val === 'number') {
            return val + '';
        }
        if (val instanceof Date) {
            const dt = val;
            const year   = dt.getFullYear();
            const month  = zeroPad(dt.getMonth() + 1, 2);
            const day    = zeroPad(dt.getDate(), 2);
            const hour   = zeroPad(dt.getHours(), 2);
            const minute = zeroPad(dt.getMinutes(), 2);
            const second = zeroPad(dt.getSeconds(), 2);
            const millisecond = zeroPad(dt.getMilliseconds(), 3);
            // format timezone
            const offset = (new Date()).getTimezoneOffset();
            const timezone = (offset >= 0 ? '+' : '') + zeroPad(Math.floor(offset / 60), 2) +
                ':' + zeroPad(offset % 60, 2);
            return '\'' + year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second + '.' + millisecond + timezone + '\'';
        }
        if (val instanceof Array) {
            const values = [];
            val.forEach((x) => {
                values.push(this.escape_(x));
            });
            return values.join(',');
        }
        if (typeof val === 'string') {
            // eslint-disable-next-line no-control-regex
            const res = val.replace(/[\0\n\r\b\t\\'"\x1a]/g, (s) => {
                switch (s) {
                    case '\0': return '\\0';
                    case '\n': return '\\n';
                    case '\r': return '\\r';
                    case '\b': return '\\b';
                    case '\t': return '\\t';
                    case '\x1a': return '\\Z';
                    default: return '\\' + s;
                }
            });
            return '\'' + res + '\'';
        }
        // otherwise get valueOf
        if (Object.prototype.hasOwnProperty.call(val, '$name')) {
            return val.$name;
        } else {
            return this.escape_(val.valueOf());
        }
    }

}

export {
    OpenDataQuery
}