
import { SqliteFormatter } from '@themost/sqlite';
import {sprintf} from 'sprintf-js';

Object.assign(SqliteFormatter.prototype, {
    $toString(arg) {
        return `CAST(${this.escape(arg)} AS TEXT)`;
    },
    $toDouble(arg) {
        return `CAST(${this.escape(arg)} AS NUMERIC)`;
    },
    $toDecimal(arg) {
        return `CAST(${this.escape(arg)} AS NUMERIC)`;
    },
    $toInt(arg) {
        return `CAST(${this.escape(arg)} AS INTEGER)`;
    },
    $toLong(arg) {
        return `CAST(${this.escape(arg)} AS INTEGER)`;
    }
});

// noinspection JSUnusedGlobalSymbols
/**
 * @augments {SqlFormatter}
 */
class MemoryFormatter extends SqliteFormatter {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    $toDecimal(expr, precision, scale) {
        const p = typeof precision === 'number' ? Math.floor(precision) : 19;
        const s = typeof scale === 'number' ? Math.floor(scale) : 8;
        return sprintf('CAST(%s as DECIMAL(%s,%s))', this.escape(expr), p, s);
    }

    $toDouble(arg) {
        return this.$toDecimal(arg, 19, 8);
    }

    $toInt(arg) {
        return sprintf('CAST(%s AS BIGINT)', this.escape(arg));
    }

    $toLong(arg) {
        return sprintf('CAST(%s AS BIGINT)', this.escape(arg));
    }
}

export {
    MemoryFormatter
};