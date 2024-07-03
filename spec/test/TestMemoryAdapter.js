import { SqliteAdapter } from '@themost/sqlite';
import { copyFileSync } from 'fs';
/**
 *
 */
class MemoryAdapter extends SqliteAdapter {

    constructor() {
        copyFileSync('./spec/db/local.db', './spec/db/test.db');
        super({
            name: 'local',
            database: './spec/db/test.db'
        });
    }

}

/**
 * Creates an instance of MemoryAdapter class
 * @param {*} options
 * @returns {MemoryAdapter}
 */
function createInstance(options) {
    return new MemoryAdapter(options);
}

export {
    MemoryAdapter,
    createInstance
};
