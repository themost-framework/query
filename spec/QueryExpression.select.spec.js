import {MemberExpression, MethodCallExpression, OpenDataParser, QueryField} from '../index';
import { QueryEntity, QueryExpression } from '../index';
import { MemoryAdapter } from './test/TestMemoryAdapter';

describe('SqlFormatter', () => {

    /**
     * @type {MemoryAdapter}
     */
    let db;
    beforeAll(() => {
        db = new MemoryAdapter({
            name: 'local',
            database: './spec/db/local.db'
        });
    });
    afterAll((done) => {
        if (db) {
            db.close();
            return done();
        }
    });
    it('should use select statement', async () => {
        let query = new QueryExpression()
            .select('id', 'name', 'category', 'price')
            .from('ProductData')
            .take(25);
        let results = await db.executeAsync(query);
        expect(results.length).toBeTruthy();

        const Products = new QueryEntity('ProductData');
        query = new QueryExpression()
            .select((x) => {
                x.id,
                x.name,
                x.category,
                x.price
            })
            .from(Products)
            .take(25);
        results = await db.executeAsync(query);
        expect(results.length).toBeTruthy();
    });

    it('should use select and join', async () => {
        let query = new QueryExpression()
            .select(new QueryField('id').from('PersonData'), 
                new QueryField('familyName').from('PersonData'), 
                new QueryField('givenName').from('PersonData'),
                new QueryField('addressLocality').from('PostalAddressData'))
            .from('PersonData')
            .leftJoin('PostalAddressData').with(
                new QueryExpression().where(new QueryField('address').from('PersonData'))
                .equal(new QueryField('id').from('PostalAddressData'))
            )
            .take(25);
        let results = await db.executeAsync(query);
        expect(results.length).toBeTruthy();

        const People = new QueryEntity('PersonData');
        const PostalAddresses = new QueryEntity('PostalAddressData').as('address');
        query = new QueryExpression()
            .select((x) => {
                x.id,
                x.familyName,
                x.givenName,
                x.address.addressLocality
            })
            .from(People)
            .leftJoin(PostalAddresses).with((x, y) => {
                return x.address === y.id;
            }).where((x) => {
                return x.givenName.includes('Vin') === true;
            })
            .take(25);
        results = await db.executeAsync(query);
        expect(results.length).toBeTruthy();
    });

    it('should use select and nested filter', async () => {
        const People = new QueryEntity('PersonData').as('customer');
        const Orders = new QueryEntity('OrderData');
        const PostalAddresses = new QueryEntity('PostalAddressData').as('address');
        let query = new QueryExpression()
            .select((x) => {
                x.orderedItem,
                x.customer.familyName,
                x.customer.givenName,
                x.customer.address.addressLocality
            })
            .from(Orders)
            .leftJoin(People).with((x, y) => {
                return x.customer === y.id;
            })
            .leftJoin(PostalAddresses).with((x, y) => {
                return x.customer.address === y.id;
            }).where((x) => {
                return x.customer.address.addressLocality.includes('Cambridge') === true;
            })
            .take(25);
        let results = await db.executeAsync(query);
        expect(results.length).toBeTruthy();
        results.forEach((item) => {
            expect(item.addressLocality.includes('Cambridge')).toBeTruthy();
        });
    });

    it('should use select and constants', async () => {
        const Products = new QueryEntity('ProductData');
        let query = new QueryExpression()
            .select((x, today) => {
                return {
                    id: x.id,
                    date1: today,
                    name: x.name
                }
            }, {
                today: new Date()
            })
            .from(Products)
            .where((x) => {
                return x.category === 'Laptops';
            })
            .take(25);
        let results = await db.executeAsync(query);
        expect(results.length).toBeTruthy();
        results.forEach((item) => {
            expect(item.date1).toBeTruthy();
        });
    });

    it('should use fixed select query', async () => {
        const Products = new QueryEntity('ProductData');
        let query = new QueryExpression()
            .select(
                {
                    'id': {
                        '$value': 100
                    }
                },
                {
                    'name': {
                        '$value': 'Test Product'
                    }
                },
                {
                    'category': {
                        '$value': 'Laptops'
                    }
                }
            )
            .from(Products)
            .where((x) => {
                return x.category === 'Laptops';
            })
            .take(25);
        query.$fixed = true;
        let results = await db.executeAsync(query);
        expect(results.length).toBeTruthy();
    });

    it('should parse cast to double expression', async() => {
        const parser = new OpenDataParser();
        const expr = await parser.parseSelectSequenceAsync(
            'id,cast(price, \'double\') as priceAsDouble'
        );
        const query = new QueryExpression().select(
            ...expr.map((x) => x.exprOf())
        ).from('ProductData');

        let results = await db.executeAsync(query);
        expect(results.length).toBeTruthy();
    });

    it('should parse cast to string expression', async() => {
        const parser = new OpenDataParser();
        const expr = await parser.parseSelectSequenceAsync(
            'id,cast(price, \'Edm.EdmString\') as priceString'
        );
        const query = new QueryExpression().select(
            ...expr.map((x) => x.exprOf())
        ).from('ProductData');

        let results = await db.executeAsync(query);
        expect(results.length).toBeTruthy();
        const [result] = results;
        expect(typeof result.priceString).toBe('string');
    });

    it('should parse cast to decimal expression', async() => {
        const parser = new OpenDataParser();
        const expr = await parser.parseSelectSequenceAsync(
            'id,cast(price, \'Edm.EdmDecimal\') as priceDecimal'
        );
        const query = new QueryExpression().select(
            ...expr.map((x) => x.exprOf())
        ).from('ProductData');

        let results = await db.executeAsync(query);
        expect(results.length).toBeTruthy();
        /**
         * @type {{priceDecimal: number}}
         */
        const [result] = results;
        expect(typeof result.priceDecimal).toBe('number');
    });

});