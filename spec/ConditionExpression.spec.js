import {SqlFormatter, QueryExpression, QueryField, OpenDataParser} from '../src/index';
import {MemoryAdapter} from './test/TestMemoryAdapter';

describe('ConditionExpression', () => {

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

    it('should use condition in select query', async () => {

        const query = new QueryExpression().select(
            'id',
            'name',
            {
                priceDescription: {
                    $cond: [
                        {
                            $gt: [
                                { $name: 'price' },
                                1000
                            ]
                        },
                        'Expensive',
                        'Normal'
                    ]
                }
            }
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

    it('should format switch expression', async () => {
        const formatter = new SqlFormatter();
        let str = formatter.$switch({
            branches: [
                {
                    case: {
                        $gt: [
                            { $name: 'weight' },
                            100
                        ]
                    },
                    then: 'Heavy'
                },
                {
                    case: {
                        $lt: [
                            { $name: 'weight' },
                            20
                        ]
                    },
                    then: 'Light'
                }
            ],
            default: 'Normal'
        });
        expect(str).toEqual('(CASE WHEN weight > 100 THEN \'Heavy\' WHEN weight < 20 THEN \'Light\' ELSE \'Normal\' END)');
    });

    it('should use switch expression as field', async () => {
        const formatter = new SqlFormatter();
        const queryField = Object.assign(new QueryField(), {
            priceDescription: {
                $switch: {
                    branches: [
                        {
                            case: {
                                $gt: [
                                    { $name: 'price' },
                                    1000
                                ]
                            },
                            then: 'Expensive'
                        },
                        {
                            case: {
                                $lt: [
                                    { $name: 'price' },
                                    500
                                ]
                            },
                            then: 'Cheap'
                        }
                        ],
                    default: 'Normal'
                }
            }
        });
        const str = formatter.formatFieldEx(queryField, '%f');
        expect(str).toEqual('(CASE WHEN price > 1000 THEN \'Expensive\' WHEN price < 500 THEN \'Cheap\' ELSE \'Normal\' END) AS priceDescription');
    });

    it('should use switch expression in select query', async () => {
        const priceDescription = Object.assign(new QueryField(), {
            priceDescription: {
                $switch: {
                    branches: [
                        {
                            case: {
                                $gt: [
                                    { $name: 'price' },
                                    1000
                                ]
                            },
                            then: 'Expensive'
                        },
                        {
                            case: {
                                $lt: [
                                    { $name: 'price' },
                                    500
                                ]
                            },
                            then: 'Cheap'
                        }
                    ],
                    default: 'Normal'
                }
            }
        });

        const query = new QueryExpression().select(
            'id',
            'name',
            'price',
            priceDescription
        ).from('ProductData').where('category').equal('Laptops');
        const results = await db.executeAsync(query);
        expect(results).toBeInstanceOf(Array);
        expect(results.length).toBeTruthy();
        const values = [
            'Expensive',
            'Normal',
            'Cheap'
        ];
        for (const result of results) {
            const priceDescriptionValue = Object.getOwnPropertyDescriptor(result, 'priceDescription');
            expect(priceDescriptionValue).toBeTruthy();
            expect(values.indexOf(priceDescriptionValue.value)).toBeGreaterThanOrEqual(0);
        }
    });
    it('should parse switch expression', async () => {
        const parser = new OpenDataParser();
        const result = await parser.parseAsync('case(price gt 1000:1,price lt 0:-1,true:0)');
        expect(result).toBeTruthy();
    });
});