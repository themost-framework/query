import { QueryEntity, QueryExpression, SqlFormatter } from '../src/index';
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
    });

    it('should create delete statement', () => {

        const query = new QueryExpression()
            .delete('Table1').where('id').equal(124);

        const sql = new SqlFormatter().format(query);
        expect(sql).toEqual('DELETE FROM Table1 WHERE (id=124)');

    });

    it('should create delete statement with query entity', () => {

        const query = new QueryExpression()
            .delete(new QueryEntity('Table1')).where('id').equal(124);
        const sql = new SqlFormatter().format(query);
        expect(sql).toEqual('DELETE FROM Table1 WHERE (id=124)');

    });

    it('should create delete statement with query entity and alias', () => {

        const query = new QueryExpression()
            .delete(new QueryEntity('Table1').as('MyTable')).where('id').equal(124);
        const sql = new SqlFormatter().format(query);
        expect(sql).toEqual('DELETE FROM Table1 WHERE (id=124)');

    });

});