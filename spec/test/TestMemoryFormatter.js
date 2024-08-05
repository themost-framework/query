
import { SqliteFormatter } from '@themost/sqlite';

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
