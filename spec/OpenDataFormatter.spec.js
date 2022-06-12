import {OpenDataFormatter} from '../src/open-data-formatter';
import {QueryExpression, QueryEntity} from '../src';

fdescribe('OpenDataFormatter', () => {
    it('should use select', () => {
        const Products = new QueryEntity('products');
        const query = new QueryExpression().from(Products).select(x => {
            x.id,
            x.name,
            x.price
        })
        const str = new OpenDataFormatter().format(query);
        expect(str);
    });
});