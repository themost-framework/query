import { OpenDataQuery, round, QueryEntity } from '../src/index';
import { OpenDataQueryFormatter } from '../src/index';
describe('OpenDataQueryFormatter', () => {

    it('should format $select', () => {
        let query = new OpenDataQuery()
            .select('id', 'name', 'category', 'price')
            .from('Products');
        expect(query).toBeTruthy();
        const formatter = new OpenDataQueryFormatter();
        let result = formatter.formatSelect(query);
        expect(result.$select).toEqual('id,name,category,price');
        query = new OpenDataQuery()
            .select( x => {
                x.id,
                x.name,
                x.category,
                x.price
            })
            .from('Products');
        result = formatter.formatSelect(query);
        expect(result.$select).toEqual('id,name,category,price');
    });

    it('should format $select with alias', () => {
        const formatter = new OpenDataQueryFormatter();
        const query = new OpenDataQuery()
            .select( x => {
                return {
                    id: x.id,
                    name: x.name,
                    category: x.category,
                    price: round(x.price, 2)
                }
            })
            .from('Products');
        const result = formatter.formatSelect(query);
        expect(result.$select).toEqual('id,name,category,round(price,2) as price');
    });

    it('should format $eq operator', () => {
        const formatter = new OpenDataQueryFormatter();
        const query = new OpenDataQuery()
            .select( x => {
                return {
                    id: x.id,
                    name: x.name,
                    category: x.category,
                    price: round(x.price, 2)
                }
            })
            .from('Products')
            .where((x) => {
                return x.id === 100;
            });
        const result = formatter.formatSelect(query);
        expect(result.$filter).toEqual('id eq 100');
    });

    it('should format $ne operator', () => {
        const formatter = new OpenDataQueryFormatter();
        const query = new OpenDataQuery()
            .select( x => {
                x.id,
                x.name,
                x.category
            })
            .from('Products')
            .where((x) => {
                return x.category !== 'Laptops';
            });
        const result = formatter.formatSelect(query);
        expect(result.$filter).toEqual('category ne \'Laptops\'');
    });

    it('should format $gt and $ge operators', () => {
        const formatter = new OpenDataQueryFormatter();
        let query = new OpenDataQuery()
            .select( x => {
                x.id,
                x.name,
                x.category
            })
            .from('Products')
            .where((x) => {
                return x.price >= 500;
            });
        let result = formatter.formatSelect(query);
        expect(result.$filter).toEqual('price ge 500');
        query = new OpenDataQuery()
            .select( x => {
                x.id,
                x.name,
                x.category
            })
            .from('Products')
            .where((x) => {
                return x.price > 500;
            });
        result = formatter.formatSelect(query);
        expect(result.$filter).toEqual('price gt 500');
    });

    it('should format $lt and $le operators', () => {
        const formatter = new OpenDataQueryFormatter();
        let query = new OpenDataQuery()
            .select( x => {
                x.id,
                x.name,
                x.category
            })
            .from('Products')
            .where((x) => {
                return x.price <= 500;
            });
        let result = formatter.formatSelect(query);
        expect(result.$filter).toEqual('price le 500');
        query = new OpenDataQuery()
            .select( x => {
                x.id,
                x.name,
                x.category
            })
            .from('Products')
            .where((x) => {
                return x.price < 500;
            });
        result = formatter.formatSelect(query);
        expect(result.$select).toEqual('id,name,category');
        expect(result.$filter).toEqual('price lt 500');
    });

    it('should format $and', async () => {
        const Products = new QueryEntity('Products');
        let query = new OpenDataQuery()
            .select((x) => {
                x.id,
                x.name,
                x.category,
                x.model,
                x.price
            })
            .from(Products)
            .where((x) => {
                return x.price < 800 && x.category === 'Laptops';
            })
            .take(10);
        let result = new OpenDataQueryFormatter().formatSelect(query);
        expect(result.$select).toEqual('id,name,category,model,price');
        expect(result.$filter).toEqual('(price lt 800 and category eq \'Laptops\')');
    });

    it('should format $or', async () => {
        const Products = new QueryEntity('Products');
        let query = new OpenDataQuery()
            .select((x) => {
                x.id,
                x.name,
                x.category,
                x.model,
                x.price
            })
            .from(Products)
            .where((x) => {
                return x.category === 'Tablets' || x.category === 'Laptops';
            })
            .take(10);
        let result = new OpenDataQueryFormatter().formatSelect(query);
        expect(result.$select).toEqual('id,name,category,model,price');
        expect(result.$filter).toEqual('(category eq \'Tablets\' and category eq \'Laptops\')');
    });

    it('should format $add', async () => {
        const Products = new QueryEntity('Products');
        let query = new OpenDataQuery()
            .from(Products)
            .where((x) => {
                return x.price + 2.45 === 5.00;
            })
            .take(10);
        let result = new OpenDataQueryFormatter().formatSelect(query);
        expect(result.$filter).toEqual('(price add 2.45) eq 5');
    });

    it('should format $sub', async () => {
        const Products = new QueryEntity('Products');
        let query = new OpenDataQuery()
            .from(Products)
            .where((x) => {
                return x.price - 0.45 === 2.00;
            })
            .take(10);
        let result = new OpenDataQueryFormatter().formatSelect(query);
        expect(result.$filter).toEqual('(price sub 0.45) eq 2');
    });

    it('should format $mul', async () => {
        const Products = new QueryEntity('Products');
        let query = new OpenDataQuery()
            .from(Products)
            .where((x) => {
                return x.price * 2 === 5.1;
            })
            .take(10);
        let result = new OpenDataQueryFormatter().formatSelect(query);
        expect(result.$filter).toEqual('(price mul 2) eq 5.1');
    });

    it('should format $div', async () => {
        const Products = new QueryEntity('Products');
        let query = new OpenDataQuery()
            .from(Products)
            .where((x) => {
                return x.rating / 2 === 2;
            })
            .take(10);
        let result = new OpenDataQueryFormatter().formatSelect(query);
        expect(result.$filter).toEqual('(rating div 2) eq 2');
    });

    it('should format $mod', async () => {
        const Products = new QueryEntity('Products');
        let query = new OpenDataQuery()
            .from(Products)
            .where((x) => {
                return (x.rating % 5) === 0;
            })
            .take(10);
        let result = new OpenDataQueryFormatter().formatSelect(query);
        expect(result.$filter).toEqual('(rating mod 5) eq 0');
    });

    it('should format $day', async () => {
        const Employees = new QueryEntity('Employees');
        let query = new OpenDataQuery()
            .select((x) => {
                x.id,
                x.givenName,
                x.familyName
            })
            .from(Employees)
            .where((x) => {
                return x.birthDate.getDate() === 8;
            })
            .take(10);
        let result = new OpenDataQueryFormatter().formatSelect(query);
        expect(result.$filter).toEqual('day(birthDate) eq 8');
    });

    it('should format $month and year', async () => {
        const Employees = new QueryEntity('Employees');
        let query = new OpenDataQuery()
            .select((x) => {
                x.id,
                x.givenName,
                x.familyName
            })
            .from(Employees)
            .where((x) => {
                return x.birthDate.getMonth() === 8 && x.birthDate.getFullYear() === 2002;
            })
            .take(10);
        let result = new OpenDataQueryFormatter().formatSelect(query);
        expect(result.$filter).toEqual('(month(birthDate) eq 8 and year(birthDate) eq 2002)');
    });

    it('should format $orderby', async () => {
        const People = new QueryEntity('People');
        let query = new OpenDataQuery()
            .select((x) => {
                x.id,
                x.givenName,
                x.familyName,
                x.birthDate
            })
            .from(People)
            .where((x) => {
                return x.birthDate.getMonth() === 8 && x.birthDate.getFullYear() === 2002;
            })
            .orderBy((x) => x.birthDate)
            .thenByDescending((x) => {
                x.familyName
            })
            .take(10);
        let result = new OpenDataQueryFormatter().formatSelect(query);
        expect(result.$filter).toEqual('(month(birthDate) eq 8 and year(birthDate) eq 2002)');
        expect(result.$orderby).toEqual('birthDate,familyName desc');
    });

});