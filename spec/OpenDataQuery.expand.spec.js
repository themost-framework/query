import { OpenDataQuery, any } from '../src/index';
import { OpenDataQueryFormatter } from '../src/index';

describe('OpenDataQuery.expand', () => {

    it('should format $expand', () => {
        let query = new OpenDataQuery().from('Orders')
            .select((x) => {
                x.id,
                x.orderStatus,
                x.orderDate
            }).expand(
                (x) => x.customer,
                (x) => x.orderedItem
            );
        expect(query).toBeTruthy();
        const formatter = new OpenDataQueryFormatter();
        let result = formatter.formatSelect(query);
        expect(result.$select).toEqual('id,orderStatus,orderDate');
        expect(result.$expand).toEqual('customer,orderedItem');
    });

    it('should format nested $expand', () => {
        let query = new OpenDataQuery().from('Orders')
            .select((x) => {
                x.id,
                x.orderStatus,
                x.orderDate
            }).expand(
                (x) => x.customer.address,
                (x) => x.orderedItem
            );
        expect(query).toBeTruthy();
        const formatter = new OpenDataQueryFormatter();
        let result = formatter.formatSelect(query);
        expect(result.$select).toEqual('id,orderStatus,orderDate');
        expect(result.$expand).toEqual('customer($expand=address),orderedItem');
    });

    it('should format $expand with options', () => {
        let query = new OpenDataQuery().from('Orders')
            .select((x) => {
                x.id,
                x.orderStatus,
                x.orderDate
            }).expand(
                any((x) => x.customer).select((y) => {
                    y.id,
                    y.givenName,
                    y.familyName
                })
            );
        expect(query).toBeTruthy();
        const formatter = new OpenDataQueryFormatter();
        let result = formatter.formatSelect(query);
        expect(result.$select).toEqual('id,orderStatus,orderDate');
        expect(result.$expand).toEqual('customer($select=id,givenName,familyName)');
    });

    it('should format $expand with filter options', () => {
        let query = new OpenDataQuery().from('Users')
            .select((x) => {
                x.id,
                x.name,
                x.alternateName
            }).expand(
                any((x) => x.groups).select((y) => {
                    y.id,
                    y.name
                }).where((y) => y.name === 'Administrators')
            );
        expect(query).toBeTruthy();
        const formatter = new OpenDataQueryFormatter();
        let result = formatter.formatSelect(query);
        expect(result.$select).toEqual('id,name,alternateName');
        expect(result.$expand).toEqual('groups($select=id,name;$filter=name eq \'Administrators\')');
    });
});