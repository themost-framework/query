import { QueryEntity, QueryExpression, QueryField } from '../src/index';
import { MemoryAdapter } from './test/TestMemoryAdapter';
import { MemoryFormatter } from './test/TestMemoryFormatter';

describe('EscapingName', () => {

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

    it('should allow subscriber to override name in escapeName', () => {
        const formatter = new MemoryFormatter();
        const subscriptions = new Map([
            ['OrderData', 'Orders'],
            ['PersonData', 'Persons']
        ]);
        formatter.escapingName.subscribe((event) => {
            if (subscriptions.has(event.name)) {
                event.name = subscriptions.get(event.name);
            }
        });
        expect(formatter.escapeName('OrderData')).toBe('`Orders`');
        expect(formatter.escapeName('PersonData')).toBe('`Persons`');
        // names not in the subscription map should be escaped normally
        expect(formatter.escapeName('id')).toBe('`id`');
    });

    it('should not affect escapeEntity when subscribing to escapingName', () => {
        const formatter = new MemoryFormatter();
        formatter.escapingName.subscribe((event) => {
            event.name = 'Overridden';
        });
        // escapeEntity should be unaffected by escapingName subscribers
        expect(formatter.escapeEntity('OrderData')).toBe('`OrderData`');
    });

    it('should allow subscriber to override entity name in escapeEntity', () => {
        const formatter = new MemoryFormatter();
        const subscriptions = new Map([
            ['OrderData', 'Orders']
        ]);
        formatter.escapingEntity.subscribe((event) => {
            if (subscriptions.has(event.name)) {
                event.name = subscriptions.get(event.name);
            }
        });
        expect(formatter.escapeEntity('OrderData')).toBe('`Orders`');
        // entities not in the subscription map should be escaped normally
        expect(formatter.escapeEntity('PersonData')).toBe('`PersonData`');
    });

    it('should not affect escapeName when subscribing to escapingEntity', () => {
        const formatter = new MemoryFormatter();
        formatter.escapingEntity.subscribe((event) => {
            event.name = 'Overridden';
        });
        // escapeName should be unaffected by escapingEntity subscribers
        expect(formatter.escapeName('id')).toBe('`id`');
    });

    it('should apply escapingEntity subscription in SQL query generation', async () => {
        const orders = new QueryEntity('OrderData');
        const q = new QueryExpression().select(
            ({id, status}) => ({ id, status })
        ).from(orders).take(5);
        const formatter = new MemoryFormatter();
        formatter.escapingEntity.subscribe((event) => {
            if (event.name === 'OrderData') {
                event.name = 'Orders';
            }
        });
        const sql = formatter.format(q);
        expect(sql).toContain('`Orders`');
    });

    it('should apply escapingName subscription in SQL query generation', async () => {
        const orders = new QueryEntity('Orders');
        const q = new QueryExpression().select(
            ({id, status}) => ({ id, status })
        ).from(orders).take(5);
        const formatter = new MemoryFormatter();
        formatter.escapingName.subscribe((event) => {
            if (event.name === 'id') {
                event.name = 'OrderID';
            }
        });
        const sql = formatter.format(q);
        expect(sql).toContain('`OrderID`');
    });

    it('should allow unsubscribing from escapingName', () => {
        const formatter = new MemoryFormatter();
        const listener = (event) => {
            event.name = 'Overridden';
        };
        const subscription = formatter.escapingName.subscribe(listener);
        expect(formatter.escapeName('OrderData')).toBe('`Overridden`');
        subscription.unsubscribe();
        // After unsubscribe, name should be escaped normally
        expect(formatter.escapeName('OrderData')).toBe('`OrderData`');
    });

    it('should allow unsubscribing from escapingEntity', () => {
        const formatter = new MemoryFormatter();
        const listener = (event) => {
            event.name = 'Overridden';
        };
        const subscription = formatter.escapingEntity.subscribe(listener);
        expect(formatter.escapeEntity('OrderData')).toBe('`Overridden`');
        subscription.unsubscribe();
        // After unsubscribe, entity should be escaped normally
        expect(formatter.escapeEntity('OrderData')).toBe('`OrderData`');
    });

});
