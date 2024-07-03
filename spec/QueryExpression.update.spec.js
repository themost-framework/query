import { QueryEntity, QueryExpression, SqlFormatter } from '../src/index';
import { MemoryAdapter } from './test/TestMemoryAdapter';

describe('SqlFormatter', () => {

    /**
     * @type {MemoryAdapter}
     */
    let db;
    beforeAll(() => {
        db = new MemoryAdapter();
    });
    afterAll((done) => {
        if (db) {
            db.close();
            return done();
        }
    });

    it('should create update statement', () => {

        const query = new QueryExpression()
            .update('Table1').set({
                price: 500
            }).where('id').equal(124);

        const sql = new SqlFormatter().format(query);
        expect(sql).toEqual('UPDATE Table1 SET price=500 WHERE (id=124)');

    });

    it('should create update statement with query entity', () => {

        const query = new QueryExpression()
            .update(new QueryEntity('Table1')).set({
                price: 500
            }).where('id').equal(124);

        const sql = new SqlFormatter().format(query);
        expect(sql).toEqual('UPDATE Table1 SET price=500 WHERE (id=124)');

    });

    it('should create update statement with query entity and alias', () => {

        const query = new QueryExpression()
            .update(new QueryEntity('Table1').as('MyTable')).set({
                price: 500
            }).where('id').equal(124);

        const sql = new SqlFormatter().format(query);
        expect(sql).toEqual('UPDATE Table1 SET price=500 WHERE (id=124)');

    });

});