import { SqlFormatter } from '../formatter';
import { QueryExpression } from '../query';
import { MemoryAdapter } from './test/TestMemoryAdapter';
import { executeInTransactionAsync } from './utils';

describe('Delete Query', () => {

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
        }
        return done();
    });
    it('should use delete statement', async () => {
        executeInTransactionAsync(db, async () => {
            const selectQuery = new QueryExpression().select(
                'id', 'name', 'price', 'category', 'description'
            ).from('ProductData').where('name').equal('Nintendo 2DS');
            let [item] = await db.executeAsync(selectQuery);
            expect(item).toBeTruthy();
            const deleteQuery = new QueryExpression().delete('ProductBase').where('id').equal(item.id);
            const formatter = new SqlFormatter();
            const sql = formatter.format(deleteQuery);
            expect(sql).toBe(`DELETE FROM ProductBase WHERE (id=${item.id})`);
            await db.executeAsync(deleteQuery);
            [item] = await db.executeAsync(selectQuery);
        });
    });

});