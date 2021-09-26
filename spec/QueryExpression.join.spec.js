const { QueryEntity, QueryExpression } = require('../query');
const { MemoryAdapter } = require('./test/TestMemoryAdapter');

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
    it('should use join statement', async () => {
        const Orders = new QueryEntity('OrderData').as('Orders');
        const Products = new QueryEntity('ProductData').as('Products');
        const OrderStatusTypes = new QueryEntity('OrderStatusTypeData').as('OrderStatusTypes');
        const q = new QueryExpression().from(Orders).select((x) => {
            return {
                id: x.id,
                orderedItem: x.orderedItem,
                orderStatus: x.orderStatus,
                orderStatusName: OrderStatusTypes.name,
                productName: Products.name
            }
        }).leftJoin(Products).with((x) => {
            return x.orderedItem === Products.id;
        }).leftJoin(OrderStatusTypes).with((x) => {
            return x.orderStatus === OrderStatusTypes.id;
        }).orderByDescending((x) => x.orderDate).take(25);
        const results = await db.executeAsync(q);
        expect(results.length).toBeTruthy();
    });
});