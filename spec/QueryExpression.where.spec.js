const { QueryEntity, QueryExpression } = require('../query');
// eslint-disable-next-line no-unused-vars
const { length, round, max, min, count, avg } = require('../closures');
const { MemoryAdapter } = require('./test/TestMemoryAdapter');

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
            db.close();
            return done();
        }
    });
    it('should use equal ', async () => {
        const People = new QueryEntity('PersonData');
        let query = new QueryExpression()
            .select((x) => {
                x.id,
                x.familyName,
                x.givenName,
                x.email,
                x.dateCreated
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

    it('should use not equal', async () => {
        const Products = new QueryEntity('ProductData');
        let query = new QueryExpression()
            .select((x) => {
                x.id,
                x.name,
                x.category,
                x.model,
                x.price
            })
            .from(Products)
            .where((x) => {
                return x.category != 'Laptops';
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
            .select((x) => {
                x.id,
                x.name,
                x.category,
                x.model,
                x.price
            })
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
            .select((x) => {
                x.id,
                x.name,
                x.category,
                x.model,
                x.price
            })
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

    it('should use floor', async () => {
        const Products = new QueryEntity('ProductData');
        let query = new QueryExpression()
            .select((x) => {
                x.id,
                x.name,
                x.category,
                x.model,
                x.price
            })
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
            .select((x) => {
                x.price
            })
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
            .select((x) => {
                x.price
            })
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
                    total: count(x.id)
                }
            })
            .from(Products)
            .where((x) => {
                return x.category === 'Laptops';
            })
            .take(1);
        let results = await db.executeAsync(query);
        expect(results.length).toBe(1);
        const total = results[0].total;

        query = new QueryExpression()
            .select((x) => {
                x.id,
                x.name
            })
            .from(Products)
            .where((x) => {
                return x.category === 'Laptops';
            });
        results = await db.executeAsync(query);
        expect(results.length).toBe(total);
    });

    fit('should use avg', async () => {
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

});