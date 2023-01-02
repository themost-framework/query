import { sprintf } from 'sprintf-js';
import { SqlFormatter } from './formatter';

class UnsupportedFormatError extends Error {
    constructor() {
        super('The operation is not supported by OData query language.');
    }
}

class OpenDataQueryFormatter extends SqlFormatter {
    constructor() {
        super();
        this.settings.forceAlias = false;
    }

    $startswith(p0, p1) {
        return this.$startsWith(p0, p1);
    }

    $startsWith(p0, p1) {
        return sprintf('startswith(%s,%s)', this.escape(p0), this.escape(p1));
    }

    $endswith(p0, p1) {
        return this.$endsWith(p0, p1);
    }

    $endsWith(p0, p1) {
        return sprintf('endswith(%s,%s)', this.escape(p0), this.escape(p1));
    }

    $length(p0) {
        return sprintf('length(%s)', this.escape(p0));
    }

    $trim(p0) {
        return sprintf('trim(%s)', this.escape(p0));
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

    /**
     * Implements indexOf(str,substr) expression formatter.
     * @param {string} p0 The source string
     * @param {string} p1 The string to search for
     * @returns {string}
     */
    $indexOf(p0, p1) {
        return sprintf('indexof(%s,%s)', this.escape(p0), this.escape(p1));
    }

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
     * @param {...*} _arg 
     * @returns 
     */
    $concat(_arg) {
        let args = Array.from(arguments);
        let self = this;
        // try to format expression like concat(concat(s0,s1),s3)...
        let str = '';
        let index = 0;
        if (args.length < 2) {
            throw new Error('concat() dialect function expects two or more arguments')
        }
        while(index < args.length) {
            const s0 = args[index];
            if (str.length === 0) {
                index += 1;
                const s1 = args[index];
                str = sprintf('concat(%s,%s)', self.escape(s0), self.escape(s1));
            } else {
                str = sprintf('concat(%s,%s)', self.escape(s0), str);
            }
            index += 1;
        }
        return str;
    }

    $substring(p0, pos, length) {
        if (length)
            return sprintf('substring(%s,%s,%s)', this.escape(p0), this.escape(pos), this.escape(length));
        else
            return sprintf('substring(%s,%s)', this.escape(p0),  this.escape(pos));
    }

    $substr(p0, pos, length) {
        return this.$substring(p0, pos, length);
    }

    $tolower(p0) {
        return sprintf('tolower(%s)', this.escape(p0));
    }

    $toupper(p0) {
        return sprintf('toupper(%s)', this.escape(p0));
    }

    $day(p0) {
        return sprintf('day(%s)', this.escape(p0));
    }

    $dayOfMonth(p0) {
        return this.$day(p0);
    }

    $month(p0) {
        return sprintf('month(%s)', this.escape(p0));
    }

    $year(p0) {
        return sprintf('year(%s)', this.escape(p0));
    }

    $hour(p0) {
        return sprintf('hour(%s)', this.escape(p0));
    }

    $minute(p0) {
        return sprintf('minute(%s)', this.escape(p0));
    }

    $second(p0) {
        return sprintf('second(%s)', this.escape(p0));
    }

    $floor(p0) {
        return sprintf('floor(%s)', this.escape(p0));
    }

    $ceiling(p0) {
        return sprintf('ceiling(%s)', this.escape(p0));
    }

    $round(p0, p1) {
        if (p1 == null)
            p1 = 0;
        return sprintf('round(%s,%s)', this.escape(p0), this.escape(p1));
    }

    $eq(p0, p1) {
        return sprintf('%s eq %s', this.escape(p0), this.escape(p1));
    }

    $ne(p0, p1) {
        return sprintf('%s ne %s', this.escape(p0), this.escape(p1));
    }

    $gt(p0, p1) {
        return sprintf('%s gt %s', this.escape(p0), this.escape(p1));
    }

    $gte(p0, p1) {
        return sprintf('%s ge %s', this.escape(p0), this.escape(p1));
    }

    $lt(p0, p1) {
        return sprintf('%s lt %s', this.escape(p0), this.escape(p1));
    }

    $lte(p0, p1) {
        return sprintf('%s le %s', this.escape(p0), this.escape(p1));
    }

    $and(p0, p1) {
        return sprintf('(%s and %s)', this.escape(p0), this.escape(p1));
    }

    $or(p0, p1) {
        return sprintf('(%s or %s)', this.escape(p0), this.escape(p1));
    }

    $add(p0, p1) {
        return sprintf('(%s add %s)', this.escape(p0), this.escape(p1));
    }

    $sub(p0, p1) {
        return sprintf('(%s sub %s)', this.escape(p0), this.escape(p1));
    }

    $mul(p0, p1) {
        return sprintf('(%s mul %s)', this.escape(p0), this.escape(p1));
    }

    $multiply(p0, p1) {
        return this.$mul(p0, p1);
    }

    $div(p0, p1) {
        return sprintf('(%s div %s)', this.escape(p0), this.escape(p1));
    }

    $divide(p0, p1) {
        return this.$div(p0, p1);
    }

    $mod(p0, p1) {
        return sprintf('(%s mod %s)', this.escape(p0), this.escape(p1));
    }

    $contains(p0, p1) {
        return sprintf('contains(%s, %s)', this.escape(p0), this.escape(p1));
    }

    $count(p0) {
        return sprintf('count(%s)', this.escape(p0));
    }

    $min(p0) {
        return sprintf('min(%s)', this.escape(p0));
    }

    $max(p0) {
        return sprintf('max(%s)', this.escape(p0));
    }

    $avg(p0) {
        return sprintf('avg(%s)', this.escape(p0));
    }

    $sum(p0) {
        return sprintf('sum(%s)', this.escape(p0));
    }

    formatFixedSelect() {
        throw new UnsupportedFormatError();
    }

    formatCount() {
        throw new UnsupportedFormatError();
    }

    formatInsert() {
        throw new UnsupportedFormatError();
    }

    formatUpdate() {
        throw new UnsupportedFormatError();
    }

    formatDelete() {
        throw new UnsupportedFormatError();
    }

    formatComparison() {
        throw new UnsupportedFormatError();
    }

    escapeName(name) {
        const result = super.escapeName(name).replace(/\./g, '/');
        if (this.$collection) {
            // trim collection name e.g. Products.id 
            return result.replace(new RegExp('^' + this.$collection + '\\/', 'g'), '');
        }
        return result;
    }

    formatLimitSelect(expr) {
        return this.formatSelect(expr);
    }

    formatSelect(expr) {
        //get entity fields
        const collection = expr.$collection;
        if (collection == null) {
            throw new Error('The target entity set cannot be empty at this context');
        }
        
        Object.defineProperty(this, '$collection', {
            enumerable: false,
            configurable: true,
            writable: true,
            value: expr.$collection
        });
        let $select;
        let selectDescriptor;
        if (expr.$select) {
            selectDescriptor = Object.getOwnPropertyDescriptor(expr.$select, collection);
        }
        if (selectDescriptor != null) {
            const fields = selectDescriptor.value;
            if (fields && fields.length) {
                $select = fields.map((field) => {
                    let result = this.format(field, '%ff');
                    if (typeof field === 'string') {
                        return result;
                    }
                    // do not use alias
                    if (Object.prototype.hasOwnProperty.call(field, '$name')) {
                        return result;
                    }
                    for(const key in field) {
                        // add alias
                        if (Object.prototype.hasOwnProperty.call(field, key)) {
                            // if alias is equal to field expression
                            if (result === key) {
                                // return field without alias
                                return result;
                            }
                            result += ' as ';
                            result += key;
                            return result;
                        }
                    }
                    return result;
                }).join(',');
            }
        }
        let result = {};
        if ($select) {
            Object.assign(result, {
                $select
            });
        }
        // format where
        const $filter = this.formatWhere(expr.$where);
        if ($filter) {
            Object.assign(result, {
                $filter
            });
        }
        // format order by
        const $orderby = this.formatOrder(expr.$order);
        if ($orderby) {
            Object.assign(result, {
                $orderby
            });
        }
        // format group by
        const $groupby = this.formatGroupBy(expr.$group);
        if ($groupby) {
            Object.assign(result, {
                $groupby
            });
        }
        // format group by
        const $expand = this.formatExpand(expr.$expand);
        if ($expand) {
            Object.assign(result, {
                $expand
            });
        }
        if (typeof expr.$skip === 'number') {
            Object.assign(result, {
                $skip: expr.$skip
            });
        }
        if (typeof expr.$take === 'number') {
            Object.assign(result, {
                $top: expr.$take
            });
        }
        delete this.$collection;
        return result;
        
    }

    formatExpand(expr) {
        const results = [];
        if (expr == null) {
            return null;
        }
        if (Array.isArray(expr) === false) {
            throw new Error('Expected an array of expand expressions');
        }
        for (const arg of expr) {
            if (typeof arg === 'object') {
                // get expand name
                const expand = arg.$collection;
                if (expand == null) {
                    throw new Error('Expand attribute cannot be empty at this context');
                }
                // get expand params
                const params = new OpenDataQueryFormatter().formatSelect(arg);
                const str = Object.keys(params).filter((key) => {
                    return Object.prototype.hasOwnProperty.call(params, key);
                }).map((key) => {
                    return `${key}=${params[key]}`;
                }).join(';');
                if (str.length > 0) {
                    results.push(`${expand}(${str})`);
                } else {
                    results.push(expand);
                }
            } else if (typeof arg === 'string') {
                results.push(arg)
            } else {
                throw new Error('Expected string or instance of query expression');
            }
        }
        if (results.length === 0) {
            return null;
        }
        return results.join(',');
    }

    formatWhere(expr) {
        if (expr == null) {
            return;
        }
        const result = super.formatWhere(expr);
        return result;
    }

    formatOrder(expr) {
        if (expr == null) {
            return;
        }
        if (Array.isArray(expr)) {
            return expr.map((item) => {
                if (Object.prototype.hasOwnProperty.call(item, '$asc')) {
                    return this.format(item.$asc, '%ff');
                } else if (Object.prototype.hasOwnProperty.call(item, '$desc')) {
                    return this.format(item.$desc, '%ff') + ' desc';
                }
                // otherwise, throw error
                throw new Error('Invalid order direction');
            }).join(',');
        }
    }

    formatGroupBy(expr) {
        if (expr == null) {
            return;
        }
        return super.formatGroupBy(expr);
    }

}
export {
    OpenDataQueryFormatter
}