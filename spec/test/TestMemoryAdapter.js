import { SqliteAdapter } from '@themost/sqlite';

/**
 *
 */
class MemoryAdapter extends SqliteAdapter {

    constructor(options) {
        super(options);
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
