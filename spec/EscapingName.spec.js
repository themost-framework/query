import { QueryEntity, QueryExpression } from '../index';
import { MemoryAdapter } from './test/TestMemoryAdapter';
import { MemoryFormatter } from './test/TestMemoryFormatter';

describe('EscapingName', () => {

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
    afterAll(async () => {
        if (db) {
            await db.closeAsync();
        }
    });

    it('should allow subscriber to override name in escapeName', () => {
        const formatter = new MemoryFormatter();
        // synonyms map common names (e.g. Orders) to the underlying data object names (e.g. OrderData)
        const synonyms = new Map([
            ['Orders', 'OrderData'],
            ['Persons', 'PersonData']
        ]);
        formatter.escapingName.subscribe((event) => {
            if (synonyms.has(event.name)) {
                event.name = synonyms.get(event.name);
            }
        });
        expect(formatter.escapeName('Orders')).toBe('`OrderData`');
        expect(formatter.escapeName('Persons')).toBe('`PersonData`');
        // names not in the synonym map should be escaped normally
        expect(formatter.escapeName('id')).toBe('`id`');
    });

    it('should not affect escapeEntity when subscribing to escapingName', () => {
        const formatter = new MemoryFormatter();
        // synonym subscription on escapingName must not interfere with escapeEntity
        const synonyms = new Map([['Orders', 'OrderData']]);
        formatter.escapingName.subscribe((event) => {
            if (synonyms.has(event.name)) {
                event.name = synonyms.get(event.name);
            }
        });
        // escapeEntity should be unaffected by escapingName subscribers
        expect(formatter.escapeEntity('Orders')).toBe('`Orders`');
    });

    it('should allow subscriber to override entity name in escapeEntity', () => {
        const formatter = new MemoryFormatter();
        // synonyms map common entity names (e.g. Orders) to underlying data object names (e.g. OrderData)
        const synonyms = new Map([
            ['Orders', 'OrderData']
        ]);
        formatter.escapingEntity.subscribe((event) => {
            if (synonyms.has(event.name)) {
                event.name = synonyms.get(event.name);
            }
        });
        expect(formatter.escapeEntity('Orders')).toBe('`OrderData`');
        // entities not in the synonym map should be escaped normally
        expect(formatter.escapeEntity('Persons')).toBe('`Persons`');
    });

    it('should not affect escapeName when subscribing to escapingEntity', () => {
        const formatter = new MemoryFormatter();
        // synonym subscription on escapingEntity must not interfere with escapeName
        const synonyms = new Map([['Orders', 'OrderData']]);
        formatter.escapingEntity.subscribe((event) => {
            if (synonyms.has(event.name)) {
                event.name = synonyms.get(event.name);
            }
        });
        // escapeName should be unaffected by escapingEntity subscribers
        expect(formatter.escapeName('id')).toBe('`id`');
    });

    it('should apply escapingEntity subscription in SQL query generation', async () => {
        // query is written using the common synonym name "Orders"
        const orders = new QueryEntity('Orders');
        const q = new QueryExpression().select(
            ({id, orderDate}) => ({ id, orderDate })
        ).from(orders).take(5);
        const formatter = new MemoryFormatter();
        // remap synonym "Orders" to the real underlying data object "OrderData"
        const synonyms = new Map([['Orders', 'OrderData']]);
        formatter.escapingEntity.subscribe((event) => {
            if (synonyms.has(event.name)) {
                event.name = synonyms.get(event.name);
            }
        });
        // also remap column-qualifier occurrences: escapeName may receive 'Orders.id'
        formatter.escapingName.subscribe((event) => {
            const parts = event.name.split('.');
            if (parts.length > 1 && synonyms.has(parts[0])) {
                parts[0] = synonyms.get(parts[0]);
                event.name = parts.join('.');
            } else if (synonyms.has(event.name)) {
                event.name = synonyms.get(event.name);
            }
        });
        const sql = formatter.format(q);
        expect(sql).toContain('`OrderData`');
        // execute the formatted SQL against the underlying database engine to confirm it is valid
        const items = await db.executeAsync(sql);
        expect(items.length).toBeGreaterThan(0);
        items.forEach((item) => {
            expect(item).toHaveProperty('id');
        });
    });

    it('should apply escapingName subscription in SQL query generation', async () => {
        // query is written using the common synonym name "Orders"
        const orders = new QueryEntity('OrderData');
        const q = new QueryExpression().select(
            ({id, orderedItem}) => ({ id, orderedItem })
        ).from(orders).take(5);
        const formatter = new MemoryFormatter();
        // remap synonym field name "id" to the real underlying column name "id" (no-op synonym for test)
        const synonyms = new Map([['orderedItem', 'orderedItem']]);
        formatter.escapingName.subscribe((event) => {
            if (synonyms.has(event.name)) {
                event.name = synonyms.get(event.name);
            }
        });
        const sql = formatter.format(q);
        expect(sql).toContain('`orderedItem`');
    });

    it('should allow unsubscribing from escapingName', () => {
        const formatter = new MemoryFormatter();
        // synonym listener that remaps "Orders" to "OrderData"
        const listener = (event) => {
            if (event.name === 'Orders') {
                event.name = 'OrderData';
            }
        };
        const subscription = formatter.escapingName.subscribe(listener);
        expect(formatter.escapeName('Orders')).toBe('`OrderData`');
        subscription.unsubscribe();
        // After unsubscribe, synonym should no longer be resolved
        expect(formatter.escapeName('Orders')).toBe('`Orders`');
    });

    it('should allow unsubscribing from escapingEntity', () => {
        const formatter = new MemoryFormatter();
        // synonym listener that remaps "Orders" to "OrderData"
        const listener = (event) => {
            if (event.name === 'Orders') {
                event.name = 'OrderData';
            }
        };
        const subscription = formatter.escapingEntity.subscribe(listener);
        expect(formatter.escapeEntity('Orders')).toBe('`OrderData`');
        subscription.unsubscribe();
        // After unsubscribe, synonym should no longer be resolved
        expect(formatter.escapeEntity('Orders')).toBe('`Orders`');
    });

});
