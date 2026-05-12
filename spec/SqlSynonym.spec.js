import {OpenDataQueryFormatter, QueryExpression, SqlFormatter, SqlSynonym} from '../src/index';

describe('SqlSynonym', () => {
    beforeEach(() => {
        SqlSynonym.clear();
    });

    afterAll(() => {
        SqlSynonym.clear();
    });

    it('should format query by using data object synonym', () => {
        SqlSynonym.add('ProductData', 'MyProduct');
        const formatter = new SqlFormatter();
        formatter.settings.nameFormat = '`$1`';
        const query = new QueryExpression().select('id', 'name')
            .from('ProductData').where('id').equal(100);
        const sql = formatter.formatSelect(query);
        expect(sql).toBe('SELECT `MyProduct`.`id`, `MyProduct`.`name` FROM `MyProduct` WHERE (`id`=100)');
    });

    it('should format qualified object names by using synonym', () => {
        SqlSynonym.add('Production.Product', 'MyProduct');
        const formatter = new SqlFormatter();
        formatter.settings.nameFormat = '`$1`';
        expect(formatter.escapeEntity('Production.Product')).toBe('`MyProduct`');
        expect(formatter.escapeName('Production.Product.ProductID')).toBe('`MyProduct`.`ProductID`');
    });

    it('should apply synonyms in formatter subclasses', () => {
        SqlSynonym.add('Products', 'MyProducts');
        const formatter = new OpenDataQueryFormatter();
        expect(formatter.escapeName('Products.id')).toBe('MyProducts/id');
    });

    it('should add synonyms from array entries', () => {
        SqlSynonym.add([
            ['object1', 'synonym1'],
            ['object2', 'synonym2']
        ]);
        expect(SqlSynonym.get('object1')).toBe('synonym1');
        expect(SqlSynonym.get('object2')).toBe('synonym2');
    });
});
