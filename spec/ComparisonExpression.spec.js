import { SqlFormatter, QueryEntity, QueryExpression } from '../src/index';
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
    
});