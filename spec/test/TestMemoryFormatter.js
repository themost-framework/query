
import { SqliteFormatter } from '@themost/sqlite';

class MemoryFormatter extends SqliteFormatter {
    constructor() {
        super();
    }
}

export {
    MemoryFormatter
};
