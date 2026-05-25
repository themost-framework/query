import { QueryEntity, QueryExpression, QueryField } from '../src/index';
import { MemoryAdapter } from './test/TestMemoryAdapter';
import { MemoryFormatter } from './test/TestMemoryFormatter';

describe('ResolvingName', () => {

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

    it('should allow subscriber to override escaped name in escapeName', () => {
        const formatter = new MemoryFormatter();
        const subscriptions = new Map([
            ['OrderData', 'Orders'],
            ['PersonData', 'Persons']
        ]);
        formatter.resolvingName.subscribe((event) => {
            if (subscriptions.has(event.name)) {
                event.escapedName = `\`${subscriptions.get(event.name)}\``;
            }
        });
        expect(formatter.escapeName('OrderData')).toBe('`Orders`');
        expect(formatter.escapeName('PersonData')).toBe('`Persons`');
        // names not in the subscription map should be escaped normally
        expect(formatter.escapeName('id')).toBe('`id`');
    });

    it('should allow subscriber to override escaped entity name in escapeEntity', () => {
        const formatter = new MemoryFormatter();
        const subscriptions = new Map([
            ['OrderData', 'Orders']
        ]);
        formatter.resolvingName.subscribe((event) => {
            if (subscriptions.has(event.name)) {
                event.escapedName = `\`${subscriptions.get(event.name)}\``;
            }
        });
        expect(formatter.escapeEntity('OrderData')).toBe('`Orders`');
        // entities not in the subscription map should be escaped normally
        expect(formatter.escapeEntity('PersonData')).toBe('`PersonData`');
    });

    it('should apply resolvingName subscription in SQL query generation', async () => {
        const orders = new QueryEntity('OrderData');
        const q = new QueryExpression().select(
            ({id, status}) => ({ id, status })
        ).from(orders).take(5);
        const formatter = new MemoryFormatter();
        formatter.resolvingName.subscribe((event) => {
            if (event.name === 'OrderData') {
                event.escapedName = '`Orders`';
            }
        });
        const sql = formatter.format(q);
        expect(sql).toContain('`Orders`');
    });

    it('should allow unsubscribing from resolvingName', () => {
        const formatter = new MemoryFormatter();
        const listener = (event) => {
            event.escapedName = '`Overridden`';
        };
        const subscription = formatter.resolvingName.subscribe(listener);
        expect(formatter.escapeName('OrderData')).toBe('`Overridden`');
        subscription.unsubscribe();
        // After unsubscribe, name should be escaped normally
        expect(formatter.escapeName('OrderData')).toBe('`OrderData`');
    });

});
