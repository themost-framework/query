
import { SqliteDialect } from '../../src/dialects/sqlite';

// noinspection JSUnusedGlobalSymbols
/**
 * @augments {SqliteDialect}
 */
class MemoryFormatter extends SqliteDialect {
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
