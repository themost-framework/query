import { SqlFormatter } from '../formatter';
import { QueryField } from '../query';
import { QueryExpression, QueryEntity } from '../query';
import { MemoryAdapter } from './test/TestMemoryAdapter';
import { executeInTransactionAsync } from './utils';

describe('Delete Query', () => {

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
        }
        return done();
    });
    it('should use delete statement', async () => {
        await executeInTransactionAsync(db, async () => {
            const selectQuery = new QueryExpression().select(
                'id', 'name', 'price', 'category', 'description'
            ).from('ProductData').where('name').equal('Nintendo 2DS');
            let [item] = await db.executeAsync(selectQuery);
            expect(item).toBeTruthy();
            const deleteQuery = new QueryExpression().delete().from('ProductBase').where('id').equal(item.id);
            const formatter = new SqlFormatter();
            const sql = formatter.format(deleteQuery);
            expect(sql).toBe(`DELETE FROM ProductBase WHERE (id=${item.id})`);
            await db.executeAsync(deleteQuery);
            [item] = await db.executeAsync(selectQuery);
            expect(item).toBeFalsy();
        });
    });

    it('should use delete statement with query entity', async () => {
        await executeInTransactionAsync(db, async () => {
            const selectQuery = new QueryExpression().select(
                'id', 'name', 'price', 'category', 'description'
            ).from('ProductData').where('name').equal('Nintendo 2DS');
            let [item] = await db.executeAsync(selectQuery);
            expect(item).toBeTruthy();
            const Products = new QueryEntity('ProductBase').as('Products');
            const deleteQuery = new QueryExpression().delete().from(Products).where('id').equal(item.id);
            const formatter = new SqlFormatter();
            const sql = formatter.format(deleteQuery);
            expect(sql).toBe(`DELETE FROM ProductBase WHERE (id=${item.id})`);
            await db.executeAsync(deleteQuery);
            [item] = await db.executeAsync(selectQuery);
        });
    });

    it('should use delete statement with query', async () => {
        await executeInTransactionAsync(db, async () => {

            const Orders = new QueryEntity('OrderBase').as('Orders');
            const Products = new QueryEntity('ProductData').as('Products');

            const selectQuery = new QueryExpression().select(
                'id',
                'orderedItem',
                'orderDate'
            ).from(Orders)
                .join(Products).with(
                    new QueryExpression().where(
                        new QueryField('orderedItem').from('Orders')
                    ).equal(
                        new QueryField('id').from('Products')
                    )
                )
            .where(
                new QueryField('name').from('Products')
            ).equal('Nintendo 2DS');
            let items = await db.executeAsync(selectQuery);
            expect(items.length).toBeTruthy();
            const deleteQuery = new QueryExpression().delete().from(Orders).where('id').in(
                new QueryExpression().select('id').from(Orders)
                    .join(Products).with(
                        new QueryExpression().where(
                            new QueryField('orderedItem').from('Orders')
                        ).equal(
                            new QueryField('id').from('Products')
                        )
                    )
                .where(
                    new QueryField('name').from('Products')
                ).equal('Nintendo 2DS')
            );
            const formatter = new SqlFormatter();
            const sql = formatter.format(deleteQuery);
            expect(sql).toBeTruthy();
            expect(sql).toBe(`DELETE FROM OrderBase WHERE (id IN (SELECT Orders.id FROM OrderBase AS Orders INNER JOIN ProductData AS Products ON (Orders.orderedItem=Products.id) WHERE (Products.name='Nintendo 2DS')))`);
            await db.executeAsync(deleteQuery);
            items = await db.executeAsync(selectQuery);
            expect(items.length).toBeFalsy();
        });
    });

});