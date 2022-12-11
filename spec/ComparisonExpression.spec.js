import { SqlFormatter, QueryEntity, QueryExpression, QueryField } from '../src/index';
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
    it('should format eq expression', async () => {
        const formatter = new SqlFormatter();
        let sql = formatter.formatWhere({
            '$eq': [
                { '$name': 'id' },
                100
            ]
        });
        expect(sql).toBe('id = 100');
        sql = formatter.formatWhere({
            '$eq': [
                {
                    '$year': {
                        '$name': 'dateCreated'
                    }
                },
                2020
            ]
        });
        expect(sql).toBe('YEAR(dateCreated) = 2020');
    });

    it('should format bitand', async () => {
        const Orders = new QueryEntity('OrderData');
        let a = new QueryExpression().select(
            'id',
            'orderedItem',
            'orderDate'
        ).from(Orders).where('orderStatus').equal(2).and('id').bit(1, 0);
        let result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.id & 1).toBe(0);
        });
        a = new QueryExpression().select(
            'id',
            'orderedItem',
            'orderDate'
        ).from(Orders).where('orderStatus').equal(2).and('orderDate').getMonth().bit(1, 0);
        result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect((x.orderDate.getMonth() - 1) & 1).toBe(0);
        });
    });

    it('should format in', async () => {
        const Orders = new QueryEntity('OrderData');
        let a = new QueryExpression().select(
            'id',
            'orderedItem',
            'orderStatus',
            'orderDate'
        ).from(Orders).where('orderedItem').equal(34).and('orderStatus').in([2, 3]);
        let results = await db.executeAsync(a);
        expect(results.length).toBeTruthy();
        results.forEach( x => {
            expect(x.orderedItem).toEqual(34);
            expect([2, 3].includes(x.orderStatus)).toBeTruthy();
        });
        a = new QueryExpression().select(
            'id',
            'orderedItem',
            'orderStatus',
            'orderDate'
        ).from(Orders).where('orderedItem').equal(34).and('orderStatus').equal([2, 3]);
        results = await db.executeAsync(a);
        expect(results.length).toBeTruthy();
        results.forEach( x => {
            expect(x.orderedItem).toEqual(34);
            expect([2, 3].includes(x.orderStatus)).toBeTruthy();
        });
    });

    it('should format in and join', async () => {
        const Orders = new QueryEntity('OrderData');
        const OrderStatusTypes = new QueryEntity('OrderStatusTypeData');
        let a = new QueryExpression().select(
            'id',
            'orderedItem',
            new QueryField('name').from('OrderStatusTypeData').as('orderStatus')
        ).from(Orders).join(
            OrderStatusTypes
        ).with(
            new QueryExpression().where(
                new QueryField('orderStatus').from('OrderData')
            ).equal(
                new QueryField('id').from('OrderStatusTypeData')
            )
        ).where('orderedItem').equal(34).and(
            new QueryField('name').from('OrderStatusTypeData')
        ).in([
            'Delivered',
            'Pickup'
        ]);
        let results = await db.executeAsync(a);
        expect(results.length).toBeTruthy();
        results.forEach( x => {
            expect(x.orderedItem).toEqual(34);
            expect([
                'Delivered',
                'Pickup'
            ].includes(x.orderStatus)).toBeTruthy();
        });
    });

    it('should format nin', async () => {
        const Orders = new QueryEntity('OrderData');
        let a = new QueryExpression().select(
            'id',
            'orderedItem',
            'orderStatus',
            'orderDate'
        ).from(Orders).where('orderedItem').equal(34).and('orderStatus').notIn([2, 3]);
        let results = await db.executeAsync(a);
        expect(results.length).toBeTruthy();
        results.forEach( x => {
            expect(x.orderedItem).toEqual(34);
            expect([2, 3].includes(x.orderStatus)).toBeFalsy();
        });
    });
    
});