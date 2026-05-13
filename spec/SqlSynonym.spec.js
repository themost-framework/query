import {OpenDataQueryFormatter, QueryExpression, SqlFormatter, SqlSynonym} from '../src/index';

describe('SqlSynonym', () => {
    const synonyms = SqlSynonym.getInstance();

    beforeEach(() => {
        synonyms.clear();
    });

    afterAll(() => {
        synonyms.clear();
    });

    it('should format query by using SQL synonym', () => {
        synonyms.set('Products', 'sales.Products');
        const formatter = new SqlFormatter();
        formatter.settings.nameFormat = '`$1`';
        const query = new QueryExpression().select('id', 'name')
            .from('Products').where('id').equal(100);
        const sql = formatter.formatSelect(query);
        expect(sql).toBe('SELECT `sales`.`Products`.`id`, `sales`.`Products`.`name` FROM `sales`.`Products` WHERE (`id`=100)');
    });

    it('should format qualified object names by using synonym', () => {
        synonyms.set('Products', 'Production.Product');
        const formatter = new SqlFormatter();
        formatter.settings.nameFormat = '`$1`';
        expect(formatter.escapeEntity('Products')).toBe('`Production`.`Product`');
        expect(formatter.escapeName('Products.ProductID')).toBe('`Production`.`Product`.`ProductID`');
    });

    it('should apply synonyms in formatter subclasses', () => {
        synonyms.set('Products', 'sales.Products');
        const formatter = new OpenDataQueryFormatter();
        expect(formatter.escapeName('Products.id')).toBe('sales/Products/id');
    });

    it('should construct synonyms from array entries', () => {
        const localSynonyms = new SqlSynonym([
            ['synonym1', 'schema1.object1'],
            ['synonym2', 'schema2.object2']
        ]);
        expect(localSynonyms.get('synonym1')).toBe('schema1.object1');
        expect(localSynonyms.get('synonym2')).toBe('schema2.object2');
    });
});
