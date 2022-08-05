import {OpenDataFormatter} from '../src';
import {QueryExpression, QueryEntity} from '../src';
import {OpenDataQueryExpression} from '../src';

describe('OpenDataFormatter', () => {
    it('should use select', () => {
        const Products = new QueryEntity('Products');
        const query = new OpenDataQueryExpression().from(Products).select((x) => {
            x.id, x.name, x.price
        }).orderBy((x) => x.price);
        const params = new OpenDataFormatter().format(query);
        expect(params).toBeTruthy();
        expect(params.$select).toEqual('id,name,price');
        expect(params.$orderby).toEqual('price asc');
    });

    it('should use filter', () => {
        const Products = new QueryEntity('Products');
        let query = new OpenDataQueryExpression().from(Products).select((x) => {
            x.id, x.name, x.price
        }).where((x) => {
            return x.price < 500 && x.category === 'Laptops'
        }).orderBy((x) => x.price);
        let params = new OpenDataFormatter().format(query);
        expect(params).toBeTruthy();
        expect(params.$select).toEqual('id,name,price');
        expect(params.$orderby).toEqual('price asc');
        expect(params.$filter).toEqual('(price lt 500) and (category eq \'Laptops\')');

        query = new QueryExpression().from(Products).select((x) => {
            x.id, x.name, x.price
        }).where((x) => {
            return (x.price > 500 && x.price <= 750 && x.category === 'Laptops')
        }).orderBy((x) => x.price);
        params = new OpenDataFormatter().format(query);
        expect(params).toBeTruthy();
        expect(params.$select).toEqual('id,name,price');
        expect(params.$orderby).toEqual('price asc');
        expect(params.$filter).toEqual('((price gt 500) and (price le 750)) and (category eq \'Laptops\')');

        query = new OpenDataQueryExpression().from(Products).select((x) => {
            x.id, x.name, x.price
        }).where((x) => {
            return (x.price < 500 && (x.category === 'Laptops' || x.category === 'Tablets'))
        }).orderBy((x) => x.price);
        params = new OpenDataFormatter().format(query);
        expect(params).toBeTruthy();
        expect(params.$select).toEqual('id,name,price');
        expect(params.$orderby).toEqual('price asc');
        expect(params.$filter).toEqual('(price lt 500) and ((category eq \'Laptops\') or (category eq \'Tablets\'))');
    });

    it('should use expand', () => {
        const Products = new QueryEntity('Products');
        const query = new OpenDataQueryExpression().from(Products).select((x) => {
            x.id, x.name, x.price
        }).expand(
            /**
             * @param {{isRelatedTo: *,isSimilarTo: *}} x
             */
            (x) => {
            x.isRelatedTo, x.isSimilarTo
        }).orderBy((x) => x.price);
        const params = new OpenDataFormatter().format(query);
        expect(params).toBeTruthy();
        expect(params.$select).toEqual('id,name,price');
        expect(params.$orderby).toEqual('price asc');
        expect(params.$expand).toEqual('isRelatedTo,isSimilarTo');
    });

    it('should use expand with expression', () => {
        const Products = new QueryEntity('Products');
        const query = new OpenDataQueryExpression().from(Products).select((x) => {
            x.id, x.name, x.price
        }).expand(new OpenDataQueryExpression().from('isRelatedTo').select(
            (x) => {
                x.id, x.name, x.price
            }
        )).orderBy((x) => x.price);
        const params = new OpenDataFormatter().format(query);
        expect(params).toBeTruthy();
        expect(params.$select).toEqual('id,name,price');
        expect(params.$orderby).toEqual('price asc');
        expect(params.$expand).toEqual('isRelatedTo($select=id,name,price)');
    });
});