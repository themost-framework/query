import { MemoryAdapter } from './test/TestMemoryAdapter';
import { QueryPipeline } from '@themost/query';

describe('QueryPipeline', () => {

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

    it('should format a query pipeline', () => {
        const pipeline = new QueryPipeline();
        expect(() => pipeline.format([])).toThrow('Pipeline must contain at least one stage');
    });

    it('should format a null query pipeline', () => {
        const pipeline = new QueryPipeline();
        expect(() => pipeline.format(null)).toThrow('Pipeline must be an array of stages');
    });

    it('should format a select query pipeline', async () => {
        const pipeline = new QueryPipeline();
        const q = pipeline.format([
            {
                $collection: {
                    products: 'ProductData'
                },
                $project: {
                    name: '$products.name',
                    category: '$products.category',
                    price: '$products.price'
                },
                $match: {
                    $expr: {
                        $eq: [
                            '$products.category',
                            'Laptops'
                        ]
                    }
                },
                $sort: {
                    $expr: {

                    }
                }
            }
        ]);
        expect(q).toBeInstanceOf(Object);
        const results = await db.executeAsync(q);
        expect(results.length).toBeTruthy();
        for (const result of results) {
            expect(Object.keys(result)).toEqual(expect.arrayContaining(['name', 'category', 'price']));
            expect(result.category).toBe('Laptops');
        }
    });



});