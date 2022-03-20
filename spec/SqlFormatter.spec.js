import { SqlFormatter, QueryExpression } from '../index';

describe('SqlFormatter', () => {
    it('should create instance', () => {
        const query = new QueryExpression().from('User').select('name').where('id').equal(1);
        const formatter = new SqlFormatter();
        const sql = formatter.format(query);
        expect(sql).toBe('SELECT User.name FROM User WHERE (id=1)');
    });
});