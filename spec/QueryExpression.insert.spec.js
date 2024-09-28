import { MemoryAdapter } from './test/TestMemoryAdapter';
import { MemoryFormatter } from './test/TestMemoryFormatter';
import { QueryExpression, SqlFormatter } from '../index';
import { executeInTransactionAsync } from './utils';
import { QueryField } from '../query';

describe('QueryExpression', () => {

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
    });
    it('should use insert into statement', async () => {
        const q = new QueryExpression().insert(
            new QueryExpression()
                .select('name', 'description', 'dateCreated', 'dateModified')
                .from('table1')
                .where('status').equal('active')
        ).into('table2');
        expect(q.$insert).toBeTruthy();
        const formatter = new SqlFormatter();
        const sql = formatter.format(q);
        expect(sql).toBe('INSERT INTO table2 (name, description, dateCreated, dateModified) SELECT table1.name, table1.description, table1.dateCreated, table1.dateModified FROM table1 WHERE (status=\'active\')');
    });

    it('should use insert into with select', async () => {
        await executeInTransactionAsync(db, async () => {
            // create table
            await db.migrateAsync({
                appliesTo: 'OrderStatistics',
                version: '1.0.0',
                add: [
                    {
                        "name": "id",
                        "type": "Counter",
                        "primary": true
                    },
                    {
                        "name": "orderedItem",
                        "type": "Integer",
                        "nullable": false
                    },
                    {
                        "name": "total",
                        "type": "Integer",
                        "nullable": false
                    }
                ]
            });
            // use select insert into statement
            const q = new QueryExpression().insert(
                new QueryExpression()
                    .select(
                        new QueryField('orderedItem'),
                        new QueryField().count('id').as('total')
                    )
                    .from('OrderData')
                    .groupBy(
                        new QueryField('orderedItem')
                    )
            ).into('OrderStatistics');
            await db.executeAsync(q);
            const items= await db.executeAsync(new QueryExpression().select(
                'orderedItem',
                'total'
            ).from('OrderStatistics'));
            expect(items).toBeTruthy();
            expect(items.length).toBeTruthy();
        })
    });

    it('should use insert into with select #2', async () => {
        await executeInTransactionAsync(db, async () => {
            // create table
            await db.migrateAsync({
                appliesTo: 'OrderStatistics',
                version: '1.0.0',
                add: [
                    {
                        "name": "id",
                        "type": "Counter",
                        "primary": true
                    },
                    {
                        "name": "orderedItem",
                        "type": "Integer",
                        "nullable": false
                    },
                    {
                        "name": "total",
                        "type": "Integer",
                        "nullable": false
                    }
                ]
            });
            // use select insert into statement
            const q = new QueryExpression().insert(
                new QueryExpression()
                    .select(
                        {
                            "orderedItem": "orderedItem",
                        },
                        {
                            "total": {
                                "$count": [
                                    "id"
                                ]
                            }
                        }
                    )
                    .from('OrderData')
                    .groupBy(
                        new QueryField('orderedItem')
                    )
            ).into('OrderStatistics');
            await db.executeAsync(q);
            const items= await db.executeAsync(new QueryExpression().select(
                'orderedItem',
                'total'
            ).from('OrderStatistics'));
            expect(items).toBeTruthy();
            expect(items.length).toBeTruthy();
        })
    });

});