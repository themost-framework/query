import { QueryEntity, QueryExpression, count } from '../index';
import { MemoryAdapter } from './test/TestMemoryAdapter';

describe('QueryExpression(groupBy)', () => {

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
    it('should use groupBy statement', async () => {
        const Orders = new QueryEntity('OrderData');
        const Products = new QueryEntity('ProductData').as('orderedItem');
        let query = new QueryExpression()
            .select((x) => {
                return {
                    total: count(x.id),
                    product: x.orderedItem.name,
                    category: x.orderedItem.category
                }
            })
            .from(Orders)
            .join(Products).with((x, y) => {
                return x.orderedItem === y.id;
            })
            .groupBy(x => x.orderedItem.name, x => x.orderedItem.category, {
                category: 'Laptops'
            });
        let results = await db.executeAsync(query);
        expect(results.length).toBeTruthy();
    });

    it('should use groupBy statement with function', async () => {
        const Orders = new QueryEntity('OrderData');
        const Products = new QueryEntity('ProductData').as('orderedItem');
        let query = new QueryExpression()
            .select((x) => {
                return {
                    total: count(x.id),
                    product: x.orderedItem.name,
                    orderYear: x.orderDate.getFullYear()
                }
            })
            .from(Orders)
            .join(Products).with((x, y) => {
                return x.orderedItem === y.id;
            })
            .groupBy(x => x.orderedItem.name, x => x.orderDate.getFullYear());
        let results = await db.executeAsync(query);
        expect(results.length).toBeTruthy();
        for (const result of results) {
            expect(typeof result.orderYear).toBe('number');
        }
    });

});