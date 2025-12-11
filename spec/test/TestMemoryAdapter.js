
import { SqliteAdapter } from '@themost/sqlite';
import path from 'path';
import os from 'os';
import fs from 'fs';

class MemoryAdapter extends SqliteAdapter {
    /**
     *
     * @param {*=} options
     */
    constructor(options) {
        super(options || {
            name: 'local',
            database: './spec/db/local.db',
            logLevel: 'debug'
        });
    }

    /**
     * @param {{ name: string, database: string, logLevel: string }} options
     * @returns {Promise<MemoryAdapter>}
     */
    static create(options) {
        const { name, database: source, logLevel } = options;
        const sourcePath = path.resolve(process.cwd(), source);
        const { base } = path.parse(sourcePath);
        const destPath = path.resolve(os.tmpdir(), base);
        return new Promise((resolve, reject) => {
            void fs.copyFile(sourcePath, destPath, (err) => {
                if (err) {
                    return reject(err);
                }
                const test = true;
                const database = destPath;
                resolve(new MemoryAdapter({
                    name,
                    test,
                    database,
                    logLevel
                }));
            });
        });
    }

    static drop(adapter) {
        return new Promise((resolve, reject) => {
            if (adapter?.options?.test) {
                void fs.unlink(adapter.options.database, (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            } else {
                return resolve();
            }
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