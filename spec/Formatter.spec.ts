import { QueryExpression, round, SqlFormatter } from '../index';
import { TestAdapter } from './adapter/TestAdapter';
import { initDatabase } from './adapter/TestDatabase';
import { QueryEntity, QueryField } from '../query';
import { ClosureParser } from '../closures';

describe('SqlFormatter', () => {
    it('should parse field', ()=> {

        const results = new ClosureParser().parseSelect((x) => {
            return {
                Price: round(x.Price, 2)
            };
        });

        const formatter = new SqlFormatter();
        const sql = formatter.formatFieldEx(Object.assign(new QueryField(),results[0]), '%f');
        expect(sql).toBe('ROUND(Price,2) AS Price');
    });
});