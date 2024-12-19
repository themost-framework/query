import {QueryExpression, OpenDataParser} from '../index';
import {MemoryAdapter} from './test/TestMemoryAdapter';

describe('LogicalExpression', () => {

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
    it('should use or', async () => {
        let query = new QueryExpression().select('id', 'name', 'category').from('ProductData')
            .where('category').equal('Laptops')
                .or('category').equal('Monitors');
        let results = await db.executeAsync(query);

        const parser = new OpenDataParser();
        const where = await parser.parseAsync('indexof(category, \'Lap\') ge 0 or indexof(category, \'Mon\') ge 0');
        query = new QueryExpression().select('id', 'name', 'category').from('ProductData');
        query.$where = where;
        results = await db.executeAsync(query);
        expect(results.length).toBeTruthy();
    });

    it('should use and', async () => {
        const parser = new OpenDataParser();
        const where = await parser.parseAsync(
            'category eq \'Laptops\' and round(price,2) ge 550.40 and round(price,2) le 1050.40'
            );
        let query = new QueryExpression().select('id', 'name','price', 'category').from('ProductData');
        query.$where = where;
        let results = await db.executeAsync(query);
        expect(results.length).toBeTruthy();
    });

    it('should use complex and exprssion', async () => {
        const parser = new OpenDataParser();
        let where = await parser.parseAsync(
            '(category eq \'Laptops\' or category eq \'Desktops\') and round(price,2) ge 500 and round(price,2) le 1000'
            );
        let query = new QueryExpression().select('id', 'name','price', 'category').from('ProductData');
        query.$where = where;
        let results = await db.executeAsync(query);
        expect(results.length).toBeTruthy();
        for (const result of results) {
            expect([
                'Laptops',
                'Desktops'
            ]).toContain(result.category);
            expect(result.price).toBeGreaterThanOrEqual(500);
            expect(result.price).toBeLessThanOrEqual(1000);
        }

        where = await parser.parseAsync(
            '(category eq \'Laptops\' or category eq \'Desktops\') and (round(price,2) ge 500) and (round(price,2) le 1000)'
            );
        query = new QueryExpression().select('id', 'name','price', 'category').from('ProductData');
        query.$where = where;
        results = await db.executeAsync(query);
        expect(results.length).toBeTruthy();
        for (const result of results) {
            expect([
                'Laptops',
                'Desktops'
            ]).toContain(result.category);
            expect(result.price).toBeGreaterThanOrEqual(500);
            expect(result.price).toBeLessThanOrEqual(1000);
        }
    });


});