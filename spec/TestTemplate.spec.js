import { MemoryAdapter } from './test/TestMemoryAdapter';

describe('TestTemplate', () => {

    /**
     * @type {MemoryAdapter}
     */
    let db;
    beforeAll(() => {
        db = new MemoryAdapter({
            name: 'local',
            database: './spec/db/local.db'
        });
    });
    afterAll((done) => {
        if (db) {
            db.close();
            return done();
        }
    });
    it('should use test', async () => {
        // write your test here...
    });

});