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
    it('should use nested join statements', async () => {
        const Orders = new QueryEntity('OrderData').as('Orders');
        const Customers = new QueryEntity('PersonData').as('customer');
        const PostalAddresses = new QueryEntity('PostalAddressData').as('address');
        const OrderStatusTypes = new QueryEntity('OrderStatusTypeData').as('orderStatus');
         const q = new QueryExpression().from(Orders).select((x) => {
            return {
                id: x.id,
                orderedItem: x.orderedItem,
                customerFamilyName: x.customer.familyName,
                customerGivenName: x.customer.givenName,
                customerAddressLocality: x.customer.address.addressLocality,
                orderStatus: x.orderStatus,
                orderStatusName: x.orderStatus.name
            }
        }).leftJoin(Customers).with((x, y) => {
            return x.customer === y.id;
        }).leftJoin(PostalAddresses).with((x, y) => {
            return x.customer.address === y.id;
        }).leftJoin(OrderStatusTypes).with((x, y) => {
            return x.orderStatus === y.id;
        })
        .orderByDescending((x) => x.orderDate).take(25);
        const results = await db.executeAsync(q);
        expect(results.length).toBeTruthy();
    });

    it('should use multiple join statements', async () => {
        const Orders = new QueryEntity('OrderData').as('Orders');
        const Customers = new QueryEntity('PersonData').as('customer');
        const OrderStatusTypes = new QueryEntity('OrderStatusTypeData').as('orderStatus');
        const familyName = 'Thomas'
        const q = new QueryExpression().from(Orders).select((x) => {
            return {
                id: x.id,
                orderedItem: x.orderedItem,
                customerFamilyName: x.customer.familyName,
                customerGivenName: x.customer.givenName,
                orderStatus: x.orderStatus,
                orderStatusName: x.orderStatus.name
            }
        }).leftJoin(Customers).with((x, y) => {
            return x.customer === y.id;
        }).leftJoin(OrderStatusTypes).with((x, y) => {
            return x.orderStatus === y.id;
        })
        .where((x) => {
            return x.customer.familyName === familyName;
        }, {
            familyName
        })
        .orderByDescending((x) => x.orderDate).take(25);
        const results = await db.executeAsync(q);
        expect(results.length).toBeTruthy();
    });
});