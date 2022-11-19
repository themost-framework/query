import { QueryEntity, QueryExpression } from '../src/index';
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
        .where((x, familyName) => {
            return x.customer.familyName === familyName;
        }, {
            familyName
        })
        .orderByDescending((x) => x.orderDate).take(25);
        const results = await db.executeAsync(q);
        expect(results.length).toBeTruthy();
    });


    it('should use multiple join statements with parameters', async () => {
        const Orders = new QueryEntity('OrderData').as('Orders');
        const Customers = new QueryEntity('PersonData').as('customer');
        const OrderStatusTypes = new QueryEntity('OrderStatusTypeData').as('orderStatus');
        const q = new QueryExpression().from(Orders).select((x) => {
            return {
                id: x.id,
                orderedItem: x.orderedItem,
                customerFamilyName: x.customer.familyName,
                customerGivenName: x.customer.givenName,
                orderStatus: x.orderStatus
            }
        }).join(OrderStatusTypes).with((x, y, status) => {
            return x.orderStatus === y.id && x.orderStatus.alternateName === status;
        }, {
            status: 'OrderPickup'
        }).leftJoin(Customers).with((x, y) => {
            return x.customer === y.id;
        }).orderByDescending((x) => x.orderDate).take(25);
        const results = await db.executeAsync(q);
        expect(results.length).toBeTruthy();
    });

    it('should use join statement with parameters', async () => {
        const Orders = new QueryEntity('OrderData').as('Orders');
        const Products = new QueryEntity('ProductData').as('orderedItem');
        const q = new QueryExpression().from(Orders).select((x) => {
            return {
                id: x.id,
                orderedItem: x.orderedItem,
                productName: x.orderedItem.name
            }
        }).join(Products).with((x, y) => {
            return x.orderedItem === y.id
        })
        .where((x, product) => {
            return x.orderedItem.name === product;
        }, {
            product: 'MSI GX70 3BE-007US'
        })
        .orderByDescending((x) => x.orderDate).take(25);
        const results = await db.executeAsync(q);
        expect(results.length).toBeTruthy();
        results.forEach((result) => {
            expect(result.productName).toBe('MSI GX70 3BE-007US');
        })
    });

    it('should use nested join statement with parameters', async () => {
        const Orders = new QueryEntity('OrderData').as('Orders');
        const Customers = new QueryEntity('PersonData').as('customer');
        const PostalAddresses = new QueryEntity('PostalAddressData').as('address');
        const q = new QueryExpression().from(Orders).select((x) => {
            return {
                id: x.id,
                orderedItem: x.orderedItem,
                customerEmail: x.customer.email,
                customerAddressLocality: x.customer.address.addressLocality
            }
        }).join(Customers).with((x, y) => {
            return x.customer === y.id
        }).leftJoin(PostalAddresses).with((x, y) => {
            return x.customer.address === y.id
        })
        .where((x, email) => {
            return x.customer.email === email;
        }, {
            email: 'cameron.ball@example.com'
        })
        .orderByDescending((x) => x.orderDate).take(25);
        const results = await db.executeAsync(q);
        expect(results.length).toBeTruthy();
        results.forEach((result) => {
            expect(result.customerEmail).toBe('cameron.ball@example.com');
        })
    });
});