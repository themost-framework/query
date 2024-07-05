import { QueryEntity, QueryExpression, QueryField } from '../src/index';
import { MemoryAdapter } from './test/TestMemoryAdapter';
import { MemoryFormatter } from './test/TestMemoryFormatter';

describe('QueryExpression.from', () => {

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
    it('should use select from multiple tables', async () => {
        const orders = await db.executeAsync(new QueryExpression().select('id').from('OrderData'));
        const q = new QueryExpression().select(
            new QueryField('id').from('OrderData'),
            new QueryField('customer').from('OrderData'),
            new QueryField('familyName').from('PersonData'),
            new QueryField('givenName').from('PersonData'),
        ).from('OrderData', 'PersonData').where(
            new QueryField('customer').from('OrderData')
        ).equal(
            new QueryField('id').from('PersonData')
        );
        expect(Array.isArray(q.$additionalSelect)).toBeTruthy();
        const [additionalSelect] = q.$additionalSelect;
        expect(additionalSelect instanceof QueryEntity).toBeTruthy();
        const sql = new MemoryFormatter().format(q);
        expect(sql).toBe('SELECT `OrderData`.`id` AS `id`, `OrderData`.`customer` AS `customer`, `PersonData`.`familyName` AS `familyName`, `PersonData`.`givenName` AS `givenName` FROM `OrderData`, `PersonData` WHERE (`OrderData`.`customer`=`PersonData`.`id`)');
        const items = await db.executeAsync(q);
        expect(items.length).toEqual(orders.length);
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            expect(item.familyName).toBeTruthy();
            expect(orders.find((x) => x.id === item.id)).toBeTruthy();
        }
    });

    it('should use multiple "from" expressions', async () => {
        const orders = await db.executeAsync(new QueryExpression().select('id').from('OrderData'));

        const people = new QueryExpression()
            .select('id', 'familyName', 'givenName').from('PersonData')
            .as('People');

        const q = new QueryExpression().select(
            new QueryField('id').from('OrderData'),
            new QueryField('customer').from('OrderData'),
            new QueryField('familyName').from('People'),
            new QueryField('givenName').from('People'),
        ).from('OrderData', people).where(
            new QueryField('customer').from('OrderData')
        ).equal(
            new QueryField('id').from('People')
        );
        expect(Array.isArray(q.$additionalSelect)).toBeTruthy();
        const [additionalSelect] = q.$additionalSelect;
        expect(additionalSelect instanceof QueryExpression).toBeTruthy();
        const items = await db.executeAsync(q);
        expect(items.length).toEqual(orders.length);
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            expect(item.familyName).toBeTruthy();
            expect(orders.find((x) => x.id === item.id)).toBeTruthy();
        }
    });

    it('should use multiple "from" expressions with closures', async () => {
        const orders = new QueryEntity('OrderData');
        const people = new QueryEntity('PersonData');
        const q = new QueryExpression().select(
            (x, y) => {
                return {
                    id: x.id,
                    customer: x.customer,
                    familyName: y.familyName,
                    givenName: y.givenName
                }
            }, people // pass additional entity as query parameter
        ).from(orders, people) // add multiple entities
        .where(
            (x, y) => {
                return x.customer === y.id;
            }, people // pass additional entity as query parameter
        );
        expect(Array.isArray(q.$additionalSelect)).toBeTruthy();
        const items = await db.executeAsync(q);
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            expect(item.familyName).toBeTruthy();
        }
    });

    it('should use multiple "from" expressions with object destructuring', async () => {
        const orders = new QueryEntity('OrderData');
        const people = new QueryEntity('PersonData');
        const q = new QueryExpression().select(
            ({id, customer}, {familyName, givenName}) => {
                return {
                    id,
                    customer,
                    familyName,
                    givenName
                }
            }, people // pass additional entity as query parameter
        ).from(orders, people) // add multiple entities
        .where(
            (x, {id}) => {
                return x.customer === id;
            }, people // pass additional entity as query parameter
        );
        expect(Array.isArray(q.$additionalSelect)).toBeTruthy();
        const items = await db.executeAsync(q);
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            expect(item.familyName).toBeTruthy();
        }
    });

});