import {SqlFormatter, QueryExpression, QueryField} from '../src/index';
import {MemoryAdapter} from './test/TestMemoryAdapter';

fdescribe('ConditionExpression', () => {

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
    })
    it('should format condition', async () => {
        const formatter = new SqlFormatter();
        let str = formatter.$cond(
            new QueryExpression().where('category').equal('Laptops'),
            'PCs and Laptops',
            'Other'
        );
        expect(str).toEqual('(CASE (category=\'Laptops\') WHEN 1 THEN \'PCs and Laptops\' ELSE \'Other\' END)');

        str = formatter.$cond(
            {
                $eq: [ { $name: 'category' }, null ]
            },
            'Unknown',
            new QueryField('category')
        );
        expect(str).toEqual('(CASE category IS NULL WHEN 1 THEN \'Unknown\' ELSE category END)');
    });

    it('should format field with condition', async () => {
        const formatter = new SqlFormatter();

        const queryField = Object.assign(new QueryField(), {
            categoryDescription: {
                $cond: [
                    {
                        $eq: [ { $name: 'category' }, null ]
                    },
                    'Unknown',
                    'Categorized'
                ]
            }
        });
        let str = formatter.formatFieldEx(queryField, '%f');
        expect(str).toEqual('(CASE category IS NULL WHEN 1 THEN \'Unknown\' ELSE \'Categorized\' END) AS categoryDescription');
    });

    it('should use condition on query expression', async () => {

        const query = new QueryExpression().select(
            'id',
            'name',
            new QueryField({
                priceDescription: {
                    $cond: [
                        {
                            gt: [ { $name: 'price' }, 1000 ]
                        },
                        'Expensive',
                        'Normal'
                    ]
                }
            })
        ).from('ProductData').take(10)
            .where('category').equal('Laptops')
            .orderBy('price');
        const results = await db.executeAsync(query);
        expect(results).toBeInstanceOf(Array);
        expect(results.length).toBeTruthy();
        const values = [
            'Expensive',
            'Normal'
        ];
        for (const result of results) {
            const priceDescription = Object.getOwnPropertyDescriptor(result, 'priceDescription');
            expect(priceDescription).toBeTruthy();
            expect(values.indexOf(priceDescription.value)).toBeGreaterThanOrEqual(0);
        }
    });
});