
import { SqliteFormatter } from '@themost/sqlite';

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
}

export {
    MemoryFormatter
};
