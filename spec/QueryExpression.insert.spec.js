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

    it('should create insert statement', () => {

        const query = new QueryExpression()
            .insert({
                id: 1451,
                name: 'New Product',
                model: 'NP800',
                price: 505.5
            })
            .into('Table1');

        const sql = new SqlFormatter().format(query);
        expect(sql).toEqual('INSERT INTO Table1(id, name, model, price) VALUES (1451, \'New Product\', \'NP800\', 505.5)');

    });

    it('should create insert statement with query entity', () => {

        const query = new QueryExpression()
            .insert({
                id: 1451,
                name: 'New Product',
                model: 'NP800',
                price: 505.5
            })
            .into(new QueryEntity('Table1'));

        const sql = new SqlFormatter().format(query);
        expect(sql).toEqual('INSERT INTO Table1(id, name, model, price) VALUES (1451, \'New Product\', \'NP800\', 505.5)');
    });

    it('should create insert statement with query entity and alias', () => {

        const query = new QueryExpression()
            .insert({
                id: 1451,
                name: 'New Product',
                model: 'NP800',
                price: 505.5
            })
            .into(new QueryEntity('Table1').as('MyTable'));

        const sql = new SqlFormatter().format(query);
        expect(sql).toEqual('INSERT INTO Table1(id, name, model, price) VALUES (1451, \'New Product\', \'NP800\', 505.5)');
    });

});