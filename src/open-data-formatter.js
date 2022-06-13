import {SqlFormatter} from './formatter';
import {sprintf} from 'sprintf-js';

class OpenDataFormatter extends SqlFormatter {

    constructor() {
        super();
        this.settings.nameFormat = '$1';
    }

    $eq(left, right) {
        if (right == null) {
            return sprintf('%s eq null', this.escape(left));
        }
        if (Array.isArray(right)) {
            if (right.length === 0) {
                return sprintf('%s eq null', this.escape(left));
            }
            const escapedLeft = this.escape(left);
            let str = '(';
            str += right.map((item) => {
                return sprintf('%s eq %s', escapedLeft, item == null ? 'null' : this.escape(item));
            }).join(' ');
            str += ')'
            return str;
        }
        return sprintf('%s eq %s', this.escape(left), this.escape(right));
    }

    $ne(left, right) {
        if (right == null) {
            return sprintf('%s ne null', this.escape(left));
        }
        if (Array.isArray(right)) {
            if (right.length === 0) {
                return sprintf('%s ne null', this.escape(left));
            }
            const escapedLeft = this.escape(left);
            let str = '(';
            str += right.map((item) => {
                return sprintf('%s ne %s', escapedLeft, item == null ? 'null' : this.escape(item));
            }).join(' ');
            str += ')'
            return str;
        }
        return sprintf('%s ne %s', this.escape(left), this.escape(right));
    }

    $gt(left, right) {
        return sprintf('%s gt %s', this.escape(left), this.escape(right));
    }

    $gte(left, right) {
        return sprintf('%s ge %s', this.escape(left), this.escape(right));
    }

    $lt(left, right) {
        return sprintf('%s lt %s', this.escape(left), this.escape(right));
    }

    $lte(left, right) {
        return sprintf('%s le %s', this.escape(left), this.escape(right));
    }

    $and(left, right) {
        return sprintf('(%s) and (%s)', this.escape(left), this.escape(right));
    }

    $or(left, right) {
        return sprintf('(%s) or (%s)', this.escape(left), this.escape(right));
    }

    $avg(arg) {
        return sprintf('avg(%s)', typeof arg === 'string' ? this.escapeName(arg) : this.escape(arg));
    }
    $min(arg) {
        return sprintf('min(%s)', typeof arg === 'string' ? this.escapeName(arg) : this.escape(arg));
    }
    $max(arg) {
        return sprintf('max(%s)', typeof arg === 'string' ? this.escapeName(arg) : this.escape(arg));
    }
    $sum(arg) {
        return sprintf('sum(%s)', typeof arg === 'string' ? this.escapeName(arg) : this.escape(arg));
    }
    $count(arg) {
        return sprintf('count(%s)', typeof arg === 'string' ? this.escapeName(arg) : this.escape(arg));
    }

    $add(left, right) {
        return sprintf('%s add %s', this.escape(left), this.escape(right));
    }

    $sub(left, right) {
        return sprintf('%s sub %s', this.escape(left), this.escape(right));
    }

    $subtract(p0, p1) {
        return this.$sub(p0, p1);
    }

    $mul(left, right) {
        return sprintf('%s mul %s', this.escape(left), this.escape(right));
    }

    $multiply(p0, p1) {
        return this.$mul(p0, p1);
    }

    $div(left, right) {
        return sprintf('%s div %s', this.escape(left), this.escape(right));
    }

    $divide(p0, p1) {
        return this.$div(p0, p1);
    }

    $mod(left, right) {
        return sprintf('%s mod %s', this.escape(left), this.escape(right));
    }

    $floor(p0) {
        return sprintf('floor(%s)', this.escape(p0));
    }

    $ceiling(p0) {
        return sprintf('ceiling(%s)', this.escape(p0));
    }

    $round(p0, p1) {
        return sprintf('ROUND(%s,%s)', this.escape(p0), this.escape(p1));
    }

    $startswith(p0, p1) {
        return sprintf('startswith(%s,%s)', this.escape(p0), this.escape(p1, true));
    }

    $endswith(p0, p1) {
        return sprintf('endswith(%s,%s)', this.escape(p0), this.escape(p1, true));
    }

    $length(p0) {
        return sprintf('length(%s)', this.escape(p0));
    }

    $indexof(p0, p1) {
        return sprintf('indexof(%s,%s)', this.escape(p0), this.escape(p1, true));
    }

    $indexOf(p0, p1) {
        return sprintf('indexof(%s,%s)', this.escape(p0), this.escape(p1, true));
    }

    $substring(p0, pos, length) {
        if (length)
            return sprintf('substring(%s,%s,%s)', this.escape(p0), Number(pos).toFixed(), Number(length).toFixed());
        else
            return sprintf('substring(%s,%s)', this.escape(p0), Number(pos).toFixed());
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

    $toLower(p0) {
        return this.$tolower(p0);
    }

    $toUpper(p0) {
        return this.$toupper(p0);
    }

    $trim(p0) {
        return sprintf('trim(%s)', this.escape(p0));
    }

    $contains(p0, p1) {
        return this.$text(p0, p1);
    }

    $text(p0, p1) {
        return sprintf('contains(%s,%s)', this.escape(p0), this.escape(p1, true));
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

    $minutes(p0) {
        return this.$minute(p0);
    }

    $second(p0) {
        return sprintf('second(%s)', this.escape(p0));
    }

    $seconds(p0) {
        return this.$second(p0);
    }

    $date(p0) {
        return sprintf('date(%s)', this.escape(p0));
    }

    escapeName(name) {
        const result = super.escapeName(name);
        if (this.$collection == null) {
            return result;
        }
        return result.replace(new RegExp('^' + this.$collection + '\\.', 'g'), '');
    }

    formatSelect(query) {
        // get entity name
        const $collection = Object.key(query.$select);
        Object.defineProperty(this, '$collection', {
            enumerable: false,
            configurable: true,
            writable: true,
            value: $collection
        });
        /**
         * @type {Array<*>}
         */
        const fields = query.$select[$collection];
        // get $select query option
        const $select = fields.map((field) => {
            return this.format(field,'%f');
        }).join(',');
        const $orderby = this.formatOrder(query.$order);
        const $groupby = this.formatOrder(query.$group);
        const $filter = this.formatWhere(query.$where);
        delete this.$collection;
        return {
            $select,
            $filter,
            $orderby,
            $groupby
        };
    }

    formatWhere(where) {
        if (where == null) {
            return;
        }
        return super.formatWhere(where);
    }

    formatOrder(expr) {
        if (Array.isArray(expr) === false) {
            return;
        }
        if (expr.length === 0) {
            return;
        }
        return expr.map((x) => {
            let f = x.$desc ? x.$desc : x.$asc;
            if (f == null)
                throw new Error('An order by object must have either ascending or descending property.');
            if (Array.isArray(f)) {
                return f.map((a) => {
                    return this.format(a, '%ff').concat(x.$desc ? ' desc' : ' asc');
                }).join(',');
            }
            return this.format(f, '%ff').concat(x.$desc ? ' desc' : ' asc');
        }).join(',');
    }

    formatGroupBy(expr) {
        let self = this;
        if (Array.isArray(expr) === false)
            return;
        if (expr.length === 0) {
            return;
        }
        return expr.map((x) => {
            return self.format(x, '%ff');
        }).join(',');
    }

    formatLimitSelect(query) {
        const result = this.formatSelect(query);
        const $top = query.$take;
        const $skip = query.$skip;
        return Object.assign(result,{
            $top,
            $skip
        });
    }

}

export {
    OpenDataFormatter
}