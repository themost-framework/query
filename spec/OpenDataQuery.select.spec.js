import { round, OpenDataQuery } from '../src/index';
import { OpenDataQueryFormatter } from '../src/index';
describe('OpenDataQuery.select', () => {

    it('should format $select', () => {
        let query = new OpenDataQuery()
            .select((x) => {
                x.id,
                x.name,
                x.category,
                x.price
            })
            .from('Products');
        expect(query).toBeTruthy();
        const formatter = new OpenDataQueryFormatter();
        let result = formatter.formatSelect(query);
        expect(result.$select).toEqual('id,name,category,price');
    });

    it('should format functions', () => {
        let query = new OpenDataQuery()
            .select((x) => {
                return {
                    id: x.id,
                    name: x.name,
                    category: x.category,
                    price: round(x.price,2)
                }
            })
            .from('Products');
        expect(query).toBeTruthy();
        const formatter = new OpenDataQueryFormatter();
        let result = formatter.formatSelect(query);
        expect(result.$select).toEqual('id,name,category,round(price,2) as price');
    });

    it('should format methods', () => {
        let query = new OpenDataQuery()
            .select((x) => {
                return {
                    id: x.id,
                    name: x.name,
                    category: x.category,
                    price: round(x.price,2),
                    releaseYear: x.releaseDate.getFullYear()
                }
            })
            .from('Products');
        expect(query).toBeTruthy();
        const formatter = new OpenDataQueryFormatter();
        let result = formatter.formatSelect(query);
        expect(result.$select).toEqual('id,name,category,round(price,2) as price,year(releaseDate) as releaseYear');
    });

    it('should format nested attributes', () => {
        let query = new OpenDataQuery().from('Orders');
        query.select((x) => {
                return {
                    id: x.id,
                    customer: x.customer.familyName,
                    streetAddress: x.customer.address.streetAddress,
                    orderedItem: x.orderedItem.name,
                    orderDate: x.orderDate
                }
            }).take(25);
        expect(query).toBeTruthy();
        const formatter = new OpenDataQueryFormatter();
        let result = formatter.formatSelect(query);
        expect(result.$select).toEqual('id,customer/familyName as customer,customer/address/streetAddress as streetAddress,orderedItem/name as orderedItem,orderDate');
        expect(result.$top).toEqual(25);
    });
});