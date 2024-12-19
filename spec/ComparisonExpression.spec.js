import { SqlFormatter } from '../index';
import { MemoryAdapter } from './test/TestMemoryAdapter';

describe('SqlFormatter', () => {

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
    })
    it('should format eq expression', async () => {
        const formatter = new SqlFormatter();
        let sql = formatter.formatWhere({
            "$eq": [
                { "$name": "id" },
                100
            ]
        });
        expect(sql).toBe('id = 100');
        sql = formatter.formatWhere({
            "$eq": [
                {
                    "$year": {
                        "$name": "dateCreated"
                    }
                },
                2020
            ]
        });
        expect(sql).toBe('YEAR(dateCreated) = 2020');
    });
});