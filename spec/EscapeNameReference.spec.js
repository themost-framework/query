import { QueryEntity, QueryExpression } from '../src/index';
import { MemoryAdapter } from './test/TestMemoryAdapter';

describe('EscapeNameReference', () => {

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
    it('should escape field reference', async () => {
        const Orders = new QueryEntity('OrderData').as('orders');
        let query = new QueryExpression()
            .select({
                'customer1': '$orders.customer'
            })
            .from(Orders).take(5);
        let results = await db.executeAsync(query);
        expect(results.length).toBeTruthy();
        for(const result of results) {
            expect(result.customer1).toBeTruthy()
        }
    });

    it('should escape field reference in function', async () => {
        const Products = new QueryEntity('ProductData').as('products');
        let query = new QueryExpression()
            .select({
                'maxPrice': {
                    '$max': [
                        {
                            '$round': [
                                {
                                    '$getField': 'products.price'
                                },
                                2
                            ]
                        }
                    ]
                }
            }).from(Products).where('category').equal('Laptops');
        let results = await db.executeAsync(query);
        expect(results.length).toEqual(1);
        const result0 = results[0];
        expect(result0.maxPrice).toBeInstanceOf(Number);
        expect(result0.maxPrice).toBeTruthy();
    });

    it('should not escape field reference', async () => {
        const Products = new QueryEntity('ProductData').as('products');
        let query = new QueryExpression()
            .select(
                'name',
                'price'
            ).from(Products).where('category').equal('$products.price');
        let results = await db.executeAsync(query);
        expect(results.length).toBeFalsy();
    });

});