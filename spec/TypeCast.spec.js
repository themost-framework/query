import { SqlFormatter, QueryEntity, QueryExpression, QueryField } from '../src/index';
import { MemoryAdapter } from './test/TestMemoryAdapter';
import { MemoryFormatter } from './test/TestMemoryFormatter';

describe('Type Casting', () => {

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
    it('should use $toString function', async () => {
        const Product = new QueryEntity('ProductData');
        const Order = new QueryEntity('OrderData');
        const id = new QueryField('id').from(Product);
        let orderedItem = new QueryField('orderedItem').from(Order);
        let expr = new QueryExpression().where(id).equal(orderedItem);
        const formatter = new MemoryFormatter();
        let sql = formatter.formatWhere(expr.$where);
        expect(sql).toEqual('(`ProductData`.`id`=`OrderData`.`orderedItem`)');
        orderedItem =new QueryField({
            '$toString': [
                new QueryField('orderedItem').from(Order)
            ]
        });
        expr = new QueryExpression().where(id).equal(orderedItem);
        sql = formatter.formatWhere(expr.$where);
        expect(sql).toEqual('(`ProductData`.`id`=CAST(`OrderData`.`orderedItem` AS TEXT))');
    });

    it('should use $toString inside closure', async () => {
        const Products = new QueryEntity('ProductData');
        const q = new QueryExpression().select(({id, name, price}) => {
            return {
                id,
                price,
                priceString: price.toString(),
                name
            }
        }).from(Products);
        const formatter = new MemoryFormatter();
        const items = await db.executeAsync(q);
        items.forEach(({price, priceString}) => {
            expect(typeof priceString).toEqual('string');
            const fromString = parseFloat(priceString);
            expect(price).toEqual(fromString);
        });
    });

    it('should use $toInt inside closure', async () => {
        const Products = new QueryEntity('ProductData');
        const q = new QueryExpression().select(({id, name, price}) => {
            return {
                id,
                price,
                priceInt: parseInt(price),
                name
            }
        }).from(Products);
        const items = await db.executeAsync(q);
        items.forEach(({price, priceInt}) => {
            expect(typeof priceInt).toEqual('number');
            const fromInt = parseInt(price);
            expect(priceInt).toEqual(fromInt);
        });
    });
});