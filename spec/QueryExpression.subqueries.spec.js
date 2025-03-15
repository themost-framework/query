import { QueryEntity, QueryExpression } from '../src/index';
// eslint-disable-next-line no-unused-vars
import { length, round, max, min, count, avg } from '../src/index';
import { MemoryAdapter } from './test/TestMemoryAdapter';
import { QueryField } from '../src/query';

describe('Subqueries', () => {

    /**
     * @type {MemoryAdapter}
     */
    let db;
    beforeAll(() => {
        db = new MemoryAdapter();
    });
    afterAll(async () => {
        if (db) {
            await db.closeAsync();
        }
    });

    it('should use subqueries', async () => {
        const Orders = new QueryEntity('OrderData');
        const OrderStatusTypes = new QueryEntity('OrderStatusTypeData').as('orderStatus');
        const People = new QueryEntity('PersonData');
        let query = new QueryExpression()
            .select((x) => {
                x.id,
                x.orderDate
            })
            .from(Orders)
            .join(OrderStatusTypes)
            .with((x, y) => {
                return x.orderStatus === y.id;
            })
            .where((x) => {
                return x.orderStatus.alternateName === 'OrderPickup';
            });
        const {[Orders.name]: select} = query.$select;
        select.push(new QueryField({
            customer: {
                $query: [
                    new QueryExpression().select(
                        {
                            $concat: [
                                new QueryField('givenName').from(People),
                                ' ',
                                new QueryField('familyName').from(People)
                            ]
                        }
                    ).from(People).where(
                        new QueryField('id').from(People)
                    ).equal(
                        new QueryField('customer').from(Orders)
                    )
                ]
            }
        }))
        let results = await db.executeAsync(query);
        expect(results.length).toBeTruthy();
        results.forEach((item) => {
            expect(item.customer).toBeTruthy();
        });

    });

    it('should use aggregate subquery', async () => {
        const Orders = new QueryEntity('OrderData');
        const OrderStatusTypes = new QueryEntity('OrderStatusTypeData').as('orderStatus');
        let query = new QueryExpression()
            .select((x) => {
                x.id,
                x.orderDate
            })
            .from(Orders)
            .join(OrderStatusTypes)
            .with((x, y) => {
                return x.orderStatus === y.id;
            })
            .where((x) => {
                return x.orderStatus.alternateName === 'OrderPickup';
            }).orderByDescending(
                new QueryField('orderCount')
            );
        const {[Orders.name]: select} = query.$select;
        select.push(new QueryField({
            orderCount: {
                $query: [
                    new QueryExpression().select(
                        {
                            $count: [
                                new QueryField('id').from('a')
                            ]
                        }
                    ).from(new QueryEntity('OrderData').as('a')).where(
                        new QueryField('customer').from('a')
                    ).equal(
                        new QueryField('customer').from(Orders)
                    )
                ]
            }
        }))
        let results = await db.executeAsync(query);
        expect(results.length).toBeTruthy();
        results.forEach((item) => {
            expect(item.orderCount).toBeTruthy();
        });

    });

});