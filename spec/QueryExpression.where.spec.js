import { QueryEntity, QueryExpression } from '../src/index';
// eslint-disable-next-line no-unused-vars
import { round, max, min, count, avg } from '../src/index';
import { MemoryAdapter } from './test/TestMemoryAdapter';

/**
 * @interface Thing
 * @property id
 * @property name
 * @property additionalType
 * @property sameAs
 * @property url
 * @property image
 * @property dateModified
 * @property dateCreated
 * @property createdBy
 * @property modifiedBy
 */

describe('QueryExpression.where', () => {

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
            return db.close(() => {
                return done();
            });
        }
        return done();
    });
    it('should use equal ', async () => {
        const People = new QueryEntity('PersonData');
        let query = new QueryExpression()
            .select((x) => {
                return {
                    id: x.id,
                    familyName: x.familyName,
                    givenName: x.givenName,
                    email: x.email,
                    dateCreated: x.dateCreated
                }
            })
            .from(People)
            .where((x) => {
                return x.email === 'cameron.ball@example.com';
            })
            .take(1);
        let results = await db.executeAsync(query);
        expect(results.length).toBe(1);
        expect(results[0].email).toBe('cameron.ball@example.com');
    });

    it('should use object destructuring and equal expression', async () => {
        const People = new QueryEntity('PersonData');
        let query = new QueryExpression()
            .select(({id, familyName, givenName,email}) => {
                return {
                    id,
                    familyName,
                    givenName,
                    email
                }
            })
            .from(People)
            .where(({email}) => {
                return email === 'cameron.ball@example.com';
            })
            .take(1);
        let results = await db.executeAsync(query);
        expect(results.length).toBe(1);
        expect(results[0].email).toBe('cameron.ball@example.com');
    });

    it('should use nested object destructuring and equal expression', async () => {
        const People = new QueryEntity('PersonData');
        const PostalAddresses = new QueryEntity('PostalAddressData').as('address');
        let query = new QueryExpression()
            .select(({id, familyName, givenName,email, address: { addressCountry }}) => {
                return {
                    id,
                    familyName,
                    givenName,
                    email,
                    addressCountry
                }
            })
            .from(People)
            .leftJoin(PostalAddresses).with((x, y) => {
                return x.address === y.id;
            })
            .where(({ address: { addressCountry }}) => {
                return addressCountry === 'UK';
            }).take(0);
        let results = await db.executeAsync(query);
        expect(results.length).toBeGreaterThan(0);
        for (const result of results) {
            expect(result.addressCountry).toEqual('UK');    
        }
    });

    it('should use where with object destructuring', async () => {
        const People = new QueryEntity('PersonData');
        let query = new QueryExpression()
            .select(({ id, familyName: lastName, givenName: firstName, email, dateCreated }) => {
                return { id, lastName, firstName, email, dateCreated }
            })
            .from(People)
            .where(({ email }) => {
                return email === 'cameron.ball@example.com';
            })
            .take(1);
        let results = await db.executeAsync(query);
        expect(results.length).toBe(1);
        expect(results[0].email).toEqual('cameron.ball@example.com');
        expect(results[0].firstName).toEqual('Cameron');
    });

    it('should use where with inline params', async () => {
        const People = new QueryEntity('PersonData');
        let query = new QueryExpression()
            .select(({ id, familyName: lastName, givenName: firstName, email, dateCreated }) => {
                return { id, lastName, firstName, email, dateCreated }
            })
            .from(People)
            .where(({ email }, customerEmail) => {
                return email === customerEmail;
            }, {
                customerEmail: 'cameron.ball@example.com'
            })
            .take(1);
        let results = await db.executeAsync(query);
        expect(results.length).toBe(1);
        expect(results[0].email).toEqual('cameron.ball@example.com');
        expect(results[0].firstName).toEqual('Cameron');
    });

    it('should use not equal', async () => {
        const Products = new QueryEntity('ProductData');
        let query = new QueryExpression()
            .select(({id, name, category, model, price}) => ({
                id, name, category, model, price
            }))
            .from(Products)
            .where((x) => {
                return x.category !== 'Laptops';
            })
            .take(10);
        let results = await db.executeAsync(query);
        expect(results.length).toBeTruthy();
        results.forEach((item) => {
            expect(item.category).not.toBe('Laptops');
        });
    });

    it('should use greater than', async () => {
        const Products = new QueryEntity('ProductData');
        let query = new QueryExpression()
            .select(({id, name, category, model, price}) => ({
                id, name, category, model, price
            }))
            .from(Products)
            .where((x) => {
                return x.price > 400;
            })
            .take(10);
        let results = await db.executeAsync(query);
        expect(results.length).toBeTruthy();
        results.forEach((item) => {
            expect(item.price).toBeGreaterThan(400);
        });
    });

    it('should use lower than', async () => {
        const Products = new QueryEntity('ProductData');
        let query = new QueryExpression()
            .select(({id, name, category, model, price}) => ({
                id, name, category, model, price
            }))
            .from(Products)
            .where((x) => {
                return x.price < 800 && x.category === 'Laptops';
            })
            .take(10);
        let results = await db.executeAsync(query);
        expect(results.length).toBeTruthy();
        results.forEach((item) => {
            expect(item.price).toBeLessThan(800);
            expect(item.category).toBe('Laptops');
        });
    });

    it('should use greater than or equal', async () => {
        const Products = new QueryEntity('ProductData');
        let query = new QueryExpression()
            .select(({id, name, category, model, price}) => ({
                id, name, category, model, price
            }))
            .from(Products)
            .where((x) => {
                return x.price >= 877.64 && x.category === 'Laptops';
            })
            .orderBy((x) => x.price)
            .take(10);
        let results = await db.executeAsync(query);
        expect(results.length).toBeTruthy();
        expect(results[0].price).toBeGreaterThanOrEqual(877.64);
        results.forEach((item) => {
            expect(item.price).toBeGreaterThanOrEqual(877.64);
            expect(item.category).toBe('Laptops');
        });
    });

    it('should use Math.floor', async () => {
        const Products = new QueryEntity('ProductData');
        let query = new QueryExpression()
            .select(({id, name, category, model, price}) => ({
                id, name, category, model, price
            }))
            .from(Products)
            .where((x) => {
                return Math.floor(x.price) === 877;
            })
            .orderBy((x) => x.price)
            .take(10);
        let results = await db.executeAsync(query);
        expect(results.length).toBeTruthy();
        results.forEach((item) => {
            expect(Math.floor(item.price)).toBe(877);
        });
    });

    it('should use ceil', async () => {
        const Products = new QueryEntity('ProductData');
        let query = new QueryExpression()
            .select((x) => {
                return {
                    id: x.id,
                    name: x.name,
                    category: x.category,
                    model: x.model,
                    price: x.price,
                    alternatePrice: Math.ceil(x.price)
                }
            })
            .from(Products)
            .where((x) => {
                return Math.ceil(x.price) === 878;
            })
            .orderBy((x) => x.price)
            .take(10);
        let results = await db.executeAsync(query);
        expect(results.length).toBeTruthy();
        results.forEach((item) => {
            expect(Math.ceil(item.price)).toBe(878);
            expect(item.alternatePrice).toBe(878);
        });
    });

    it('should use multiply', async () => {
        const Products = new QueryEntity('ProductData');
        let query = new QueryExpression()
            .select((x) => {
                return {
                    id: x.id,
                    name: x.name,
                    category: x.category,
                    model: x.model,
                    price: x.price,
                    newPrice: x.price * 0.75
                }
            })
            .from(Products)
            .where((x) => {
                return x.price > 500;
            })
            .take(10);
        let results = await db.executeAsync(query);
        results.forEach((item) => {
            expect(item.price * 0.75).toBe(item.newPrice);
        });
    });

    it('should use divide', async () => {
        const Products = new QueryEntity('ProductData');
        let query = new QueryExpression()
            .select((x) => {
                return {
                    id: x.id,
                    name: x.name,
                    category: x.category,
                    model: x.model,
                    price: x.price,
                    newPrice: x.price / 1.5
                }
            })
            .from(Products)
            .where((x) => {
                return x.price > 500;
            })
            .take(10);
        let results = await db.executeAsync(query);
        results.forEach((item) => {
            expect(item.price / 1.5).toBe(item.newPrice);
        });
    });

    it('should use subtract', async () => {
        const Products = new QueryEntity('ProductData');
        let query = new QueryExpression()
            .select((x) => {
                return {
                    id: x.id,
                    name: x.name,
                    category: x.category,
                    model: x.model,
                    price: x.price,
                    newPrice: x.price - 50
                }
            })
            .from(Products)
            .where((x) => {
                return (x.price - 50) > 500;
            })
            .take(10);
        let results = await db.executeAsync(query);
        results.forEach((item) => {
            expect(item.price - 50).toBe(item.newPrice);
        });
    });

    it('should use add', async () => {
        const Products = new QueryEntity('ProductData');
        let query = new QueryExpression()
            .select((x) => {
                return {
                    id: x.id,
                    name: x.name,
                    category: x.category,
                    model: x.model,
                    price: x.price,
                    newPrice: x.price + 50
                }
            })
            .from(Products)
            .where((x) => {
                return (x.price + 50) > 500;
            })
            .take(10);
        let results = await db.executeAsync(query);
        results.forEach((item) => {
            expect(item.price + 50).toBe(item.newPrice);
        });
    });

    it('should use round', async () => {
        const Products = new QueryEntity('ProductData');
        let query = new QueryExpression()
            .select((x) => {
                return {
                    id: x.id,
                    name: x.name,
                    category: x.category,
                    model: x.model,
                    price: x.price,
                    newPrice: round(x.price, 1)
                }
            })
            .from(Products)
            .where((x) => {
                return x.price > 500;
            })
            .take(10);
        let results = await db.executeAsync(query);
        results.forEach((item) => {
            expect(round(item.price, 1)).toBe(item.newPrice);
        });
    });

    it('should use max', async () => {
        const Products = new QueryEntity('ProductData');
        let query = new QueryExpression()
            .select((x) => {
                return {
                    maxPrice: max(x.price)
                }
            })
            .from(Products)
            .where((x) => {
                return x.category === 'Laptops';
            })
            .take(1);
        let results = await db.executeAsync(query);
        expect(results.length).toBe(1);
        const maxPrice = results[0].maxPrice;

        query = new QueryExpression()
            .select(({id, price}) => ({
                id,
                price
            }))
            .from(Products)
            .where((x) => {
                return x.category === 'Laptops';
            })
            .orderByDescending((x) => x.price)
            .take(1);
        results = await db.executeAsync(query);
        expect(results.length).toBe(1);
        expect(results[0].price).toBe(maxPrice);
    });

    it('should use min', async () => {
        const Products = new QueryEntity('ProductData');
        let query = new QueryExpression()
            .select((x) => {
                return {
                    minPrice: min(x.price)
                }
            })
            .from(Products)
            .where((x) => {
                return x.category === 'Laptops';
            })
            .take(1);
        let results = await db.executeAsync(query);
        expect(results.length).toBe(1);
        const minPrice = results[0].minPrice;

        query = new QueryExpression()
            .select(({id, price}) => ({
                id,
                price
            }))
            .from(Products)
            .where((x) => {
                return x.category === 'Laptops';
            })
            .orderBy((x) => x.price)
            .take(1);
        results = await db.executeAsync(query);
        expect(results.length).toBe(1);
        expect(results[0].price).toBe(minPrice);
    });

    it('should use count', async () => {
        const Products = new QueryEntity('ProductData');
        let query = new QueryExpression()
            .select((x) => {
                return {
                    category: x.category,
                    total: count(x.id)
                }
            })
            .from(Products)
            .groupBy((x) => x.category);
        let results = await db.executeAsync(query);
        expect(results.length).toBeTruthy();

        const total = results.find((item) => {
            return item.category === 'Laptops'
        }).total;

        query = new QueryExpression()
            .select(({id, name}) => ({
                id,
                name
            }))
            .from(Products)
            .where((x) => {
                return x.category === 'Laptops';
            });
        results = await db.executeAsync(query);
        expect(results.length).toBe(total);
    });

    it('should use avg', async () => {
        const Products = new QueryEntity('ProductData');
        let query = new QueryExpression()
            .select((x) => {
                return {
                    avgPrice: round(avg(x.price),2)
                }
            })
            .from(Products)
            .where((x) => {
                return x.category === 'Laptops';
            })
            .take(1);
        let results = await db.executeAsync(query);
        expect(results.length).toBe(1);
    });


    it('should use param array', async () => {
        const People = new QueryEntity('PersonData');
        const emailAddress = 'cameron.ball@example.com';
        let query = new QueryExpression()
            .select(({ id, familyName: lastName, givenName: firstName, email, dateCreated }) => {
                return { id, lastName, firstName, email, dateCreated }
            })
            .from(People)
            .where((x, value) => {
                return x.email === value;
            }, emailAddress)
            .take(1);
        let results = await db.executeAsync(query);
        expect(results.length).toBe(1);
        expect(results[0].email).toEqual('cameron.ball@example.com');
        expect(results[0].firstName).toEqual('Cameron');
    });

});
