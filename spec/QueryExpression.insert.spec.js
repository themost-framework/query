import { QueryEntity, QueryExpression, SqlFormatter, QueryField } from '../src/index';
import { MemoryAdapter } from './test/TestMemoryAdapter';
import { executeInTransactionAsync } from './utils';

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

    it('should use insert into with select', async () => {
        await executeInTransactionAsync(db, async () => {
            // create table
            await db.migrateAsync({
                appliesTo: 'OrderStatistics',
                version: '1.0.0',
                add: [
                    {
                        "name": "id",
                        "type": "Counter",
                        "primary": true
                    },
                    {
                        "name": "orderedItem",
                        "type": "Integer",
                        "nullable": false
                    },
                    {
                        "name": "total",
                        "type": "Integer",
                        "nullable": false
                    }
                ]
            });
            // use select insert into statement
            const q = new QueryExpression().insert(
                new QueryExpression()
                    .select(
                        new QueryField('orderedItem'),
                        new QueryField().count('id').as('total')
                    )
                    .from('OrderData')
                    .groupBy(
                        new QueryField('orderedItem')
                    )
            ).into('OrderStatistics');
            await db.executeAsync(q);
            const items= await db.executeAsync(new QueryExpression().select(
                'orderedItem',
                'total'
            ).from('OrderStatistics'));
            expect(items).toBeTruthy();
            expect(items.length).toBeTruthy();
        })
    });

    it('should use insert into with select #2', async () => {
        await executeInTransactionAsync(db, async () => {
            // create table
            await db.migrateAsync({
                appliesTo: 'OrderStatistics',
                version: '1.0.0',
                add: [
                    {
                        "name": "id",
                        "type": "Counter",
                        "primary": true
                    },
                    {
                        "name": "orderedItem",
                        "type": "Integer",
                        "nullable": false
                    },
                    {
                        "name": "total",
                        "type": "Integer",
                        "nullable": false
                    }
                ]
            });
            // use select insert into statement
            const q = new QueryExpression().insert(
                new QueryExpression()
                    .select(
                        {
                            "orderedItem": "orderedItem",
                        },
                        {
                            "total": {
                                "$count": [
                                    "id"
                                ]
                            }
                        }
                    )
                    .from('OrderData')
                    .groupBy(
                        new QueryField('orderedItem')
                    )
            ).into('OrderStatistics');
            await db.executeAsync(q);
            const items= await db.executeAsync(new QueryExpression().select(
                'orderedItem',
                'total'
            ).from('OrderStatistics'));
            expect(items).toBeTruthy();
            expect(items.length).toBeTruthy();
        })
    });

});