import { round, OpenDataQuery } from '../src/index';
import { OpenDataQueryFormatter } from '../src/index';
describe('OpenDataQuery.select', () => {

    it('should format $select', () => {
        let query = new OpenDataQuery()
            .select(({id, name, category, price}) => ({
                id,
                name,
                category,
                price
            }))
            .from('Products');
        expect(query).toBeTruthy();
        const formatter = new OpenDataQueryFormatter();
        let result = formatter.formatSelect(query);
        expect(result.$select).toEqual('id,name,category,price');
    });

    it('should format $select with object destructuring', () => {
        let query = new OpenDataQuery()
            .select(({id, name, category, price, releaseDate}) => ({
                id,
                name,
                category,
                price,
                releaseDate
            }))
            .from('Products');
        expect(query).toBeTruthy();
        let formatter = new OpenDataQueryFormatter();
        let result = formatter.formatSelect(query);
        expect(result.$select).toEqual('id,name,category,price,releaseDate');

        query = new OpenDataQuery()
            .select(({id, name, category: productCategory, price}) => ({
                id,
                name,
                productCategory,
                price
            }))
            .from('Products');
        expect(query).toBeTruthy();
        formatter = new OpenDataQueryFormatter();
        result = formatter.formatSelect(query);
        expect(result.$select).toEqual('id,name,category as productCategory,price');
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

    it('should format nested attributes with object destructuring', () => {
        let query = new OpenDataQuery().from('Orders');
        query.select(({ 
            id,
            orderedItem: { name: orderedItem },
            orderDate,
            customer: { familyName: customer, address: { streetAddress } }
        }) => {
                return { 
                    id,
                    customer,
                    streetAddress,
                    orderedItem,
                    orderDate
                }
            }).take(25);
        expect(query).toBeTruthy();
        const formatter = new OpenDataQueryFormatter();
        let result = formatter.formatSelect(query);
        expect(result.$select).toEqual('id,customer/familyName as customer,customer/address/streetAddress as streetAddress,orderedItem/name as orderedItem,orderDate');
        expect(result.$top).toEqual(25);
    });

    it('should select with return statement', () => {
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

    it('should select with function', () => {
        let query = new OpenDataQuery().from('Orders');
        query.select(function(x) {
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

    it('should select which returns object', () => {
        let query = new OpenDataQuery().from('Orders');
        query.select((x) => ({
                    id: x.id,
                    customer: x.customer.familyName,
                    streetAddress: x.customer.address.streetAddress,
                    orderedItem: x.orderedItem.name,
                    orderDate: x.orderDate
            })).take(25);
        expect(query).toBeTruthy();
        const formatter = new OpenDataQueryFormatter();
        let result = formatter.formatSelect(query);
        expect(result.$select).toEqual('id,customer/familyName as customer,customer/address/streetAddress as streetAddress,orderedItem/name as orderedItem,orderDate');
        expect(result.$top).toEqual(25);
    });

    it('should select with vars', () => {
        let query = new OpenDataQuery().from('Products');
        query.select((x) => {
                const id = x.id;
                const name = x.name;
                return {
                    id,
                    name
                }
            }).take(25);
        expect(query).toBeTruthy();
        const formatter = new OpenDataQueryFormatter();
        let result = formatter.formatSelect(query);
        expect(result.$select).toEqual('id,name');
        expect(result.$top).toEqual(25);
    });

    it('should select with vars and method calls', () => {
        let query = new OpenDataQuery().from('Products');
        query.select((x) => {
                const id = x.id;
                const name = x.name;
                const price = round(x.price, 2)
                return {
                    id,
                    name,
                    price
                }
            }).take(25);
        expect(query).toBeTruthy();
        const formatter = new OpenDataQueryFormatter();
        let result = formatter.formatSelect(query);
        expect(result.$select).toEqual('id,name,round(price,2) as price');
        expect(result.$top).toEqual(25);
    });

    it('should select with destructured vars', () => {
        let query = new OpenDataQuery().from('Products');
        query.select((x) => {
                const {id, name: productName} = x;
                return {
                    id,
                    productName
                }
            }).take(25);
        expect(query).toBeTruthy();
        const formatter = new OpenDataQueryFormatter();
        let result = formatter.formatSelect(query);
        expect(result.$select).toEqual('id,name as productName');
        expect(result.$top).toEqual(25);
    });

    it('should select with destructured nested vars', () => {
        let query = new OpenDataQuery().from('Orders');
        query.select((x) => {
                const {id, orderedItem: { name: productName }} = x;
                return {
                    id,
                    productName
                }
            }).take(25);
        expect(query).toBeTruthy();
        const formatter = new OpenDataQueryFormatter();
        let result = formatter.formatSelect(query);
        expect(result.$select).toEqual('id,orderedItem/name as productName');
        expect(result.$top).toEqual(25);
    });

    it('should format $concat', () => {
       let query = new OpenDataQuery()
            .select((x) => {
                return {
                    id: x.id,
                    familyName: x.familyName,
                    givenName: x.givenName,
                    name: x.givenName.concat(' ', x.familyName),
                  };
            })
            .from('People');
        expect(query).toBeTruthy();
        const formatter = new OpenDataQueryFormatter();
        let result = formatter.formatSelect(query);
        expect(result.$select).toEqual('id,familyName,givenName,concat(concat(givenName,\' \'),familyName) as name');
    });

});
