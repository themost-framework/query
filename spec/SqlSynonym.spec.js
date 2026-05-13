import {OpenDataQueryFormatter, QueryExpression, SqlFormatter, SqlSynonym} from '../src/index';

describe('SqlSynonym', () => {
    const synonyms = SqlSynonym.getInstance();

    beforeEach(() => {
        synonyms.clear();
    });

    afterAll(() => {
        synonyms.clear();
    });

    it('should format query by using data object synonym', () => {
        synonyms.set('ProductData', 'MyProduct');
        const formatter = new SqlFormatter();
        formatter.settings.nameFormat = '`$1`';
        const query = new QueryExpression().select('id', 'name')
            .from('ProductData').where('id').equal(100);
        const sql = formatter.formatSelect(query);
        expect(sql).toBe('SELECT `MyProduct`.`id`, `MyProduct`.`name` FROM `MyProduct` WHERE (`id`=100)');
    });

    it('should format qualified object names by using synonym', () => {
        synonyms.set('Production.Product', 'MyProduct');
        const formatter = new SqlFormatter();
        formatter.settings.nameFormat = '`$1`';
        expect(formatter.escapeEntity('Production.Product')).toBe('`MyProduct`');
        expect(formatter.escapeName('Production.Product.ProductID')).toBe('`MyProduct`.`ProductID`');
    });

    it('should apply synonyms in formatter subclasses', () => {
        synonyms.set('Products', 'MyProducts');
        const formatter = new OpenDataQueryFormatter();
        expect(formatter.escapeName('Products.id')).toBe('MyProducts/id');
    });

    it('should construct synonyms from array entries', () => {
        const localSynonyms = new SqlSynonym([
            ['object1', 'synonym1'],
            ['object2', 'synonym2']
        ]);
        expect(localSynonyms.get('object1')).toBe('synonym1');
        expect(localSynonyms.get('object2')).toBe('synonym2');
    });
});
