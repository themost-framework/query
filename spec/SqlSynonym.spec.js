import { SqlSynonym } from '@themost/query';
import {MemoryAdapter} from './test/TestMemoryAdapter';

describe('SqlSynonym', () => {

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

    it('should create synonyms', async () => {
        const synonyms = new SqlSynonym();
        synonyms.set('P', 'ProductData');
        expect(synonyms.get('P')).toBe('ProductData');
        expect(synonyms.format('P')).toBe('ProductData');
        expect(synonyms.format('P.name')).toBe('ProductData.name');
    });

    it('should add synonyms', async () => {
        const synonyms = new SqlSynonym();
        synonyms.set('P', 'ProductData');
        expect(synonyms.get('P')).toBe('ProductData');
        expect(synonyms.format('P')).toBe('ProductData');
        expect(synonyms.format('P.name')).toBe('ProductData.name');
    });

    it('should use synonym', async () => {
        const synonyms = new SqlSynonym();
        synonyms.set('P', 'ProductData');
        synonyms.set('P.title', 'ProductDataView.title');
        expect(synonyms.format('P.title')).toBe('ProductDataView.title');
        synonyms.set('ProductData', 'dbo.ProductData');
        expect(synonyms.format('ProductData')).toBe('dbo.ProductData');
    });



});