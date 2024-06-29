import { QueryExpression, QueryEntity } from '../src/index';

// eslint-disable-next-line no-unused-vars
import { round, min, max, count } from '../src/index';
import { MemoryAdapter } from './test/TestMemoryAdapter';

/**
 * @interface Order
 * @property id
 * @property orderDate
 * @property orderedItem
 * @property orderStatus
 * @property merchant
 * @property customer
 */

describe('ClosureParser', () => {
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
     })
    it('should use object property to an equal expression', async () => {
        const People = new QueryEntity('PersonData');
        let a = new QueryExpression().select( x => {
            return {
                id: x.id,
                lastName: x.familyName,
                firstName: x.givenName
            }
        })
        .from(People).where( x => {
            return x.id === 355;
        });
        expect(a.$where).toEqual({
                $eq: [
                    { $name: 'PersonData.id' },
                    355
                ]
            });
        let result = await db.executeAsync(a);
        expect(result).toBeTruthy();
        expect(result.length).toBe(1);
        expect(result[0].id).toBe(355);
        
    });

    it('should use object destructuring', async () => {
        const People = new QueryEntity('PersonData');
        const identifier = 355;
        let a = new QueryExpression().select(({id, familyName, givenName}) => {
            id,
            familyName,
            givenName
        })
        .from(People).where( (x, identifier) => {
            return x.id === identifier;
        }, {
            identifier
        });
        expect(a.$where).toEqual({
                $eq: [
                    { $name: 'PersonData.id' },
                    355
                ]
            });
        let result = await db.executeAsync(a);
        expect(result).toBeTruthy();
        expect(result.length).toBe(1);
        expect(result[0].id).toBe(355);

    });

    it('should unpack object properties', async () => {
        const People = new QueryEntity('PersonData');
        let a = new QueryExpression().select(({id, familyName: lastName, givenName: firstName}) => {
            id,
            lastName,
            firstName
        }).from(People).where( x => {
            return x.id === 355;
        });
        let result = await db.executeAsync(a);
        expect(result).toBeTruthy();
        expect(result.length).toBe(1);

    });

    it('should unpack nested object properties', async () => {
        const People = new QueryEntity('PersonData');
        const PostalAddresses = new QueryEntity('PostalAddressData').as('address');
        let a = new QueryExpression().select(({
                id,
                familyName: lastName,
                givenName: firstName,
                address: { streetAddress }
            }) => {
            id,
            lastName,
            firstName,
            streetAddress
        }).from(People).where( x => {
            return x.id === 355;
        }).leftJoin(PostalAddresses).with((x, y) => {
            return x.address === y.id;
        });
        let result = await db.executeAsync(a);
        expect(result).toBeTruthy();
        expect(result.length).toBe(1);

    });

    it('should use greater than expression', async () => {
        const Products = new QueryEntity('ProductData');
        let a = new QueryExpression().select( x => {
            x.id,
            x.name,
            x.price
        })
        .from(Products).where( x => {
            return x.price > 1000;
        });
        let result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.price).toBeGreaterThan(1000);
        });
    });
    it('should use lower than expression', async () => {
        const Products = new QueryEntity('ProductData');
        let a = new QueryExpression().select( x => {
            x.id,
            x.name,
            x.price
        })
        .from(Products).where( x => {
            return x.price < 400;
        });
        let result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.price).toBeLessThan(1000);
        });
    });

    it('should use between expression', async () => {
        const Products = new QueryEntity('ProductData');
        let a = new QueryExpression().select( x => {
            x.id,
            x.name,
            x.price
        })
        .from(Products).where( x => {
            return x.price >= 400 && x.price < 500;
        });
        let result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.price).toBeGreaterThanOrEqual(400);
            expect(x.price).toBeLessThan(500);
        });
    });

    it('should use greater than or equal expression', async () => {
        const Products = new QueryEntity('ProductData');
        let a = new QueryExpression().select( x => {
            x.id,
            x.name,
            x.price
        })
        .from(Products).where( x => {
            return x.price >= 1000;
        });
        let result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.price).toBeGreaterThanOrEqual(1000);
        });
    });

    it('should use lower than or equal expression', async () => {
        const Products = new QueryEntity('ProductData');
        let a = new QueryExpression().select( x => {
            x.id,
            x.name,
            x.price
        })
        .from(Products).where( x => {
            return x.price <= 460.9;
        });
        let result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.price).toBeLessThanOrEqual(460.9);
        });
    });

    
    it('should use parameters', async () => {
        const Products = new QueryEntity('ProductData');
        let maximumPrice = 400;
        let a = new QueryExpression().select( x => {
            x.name,
            x.price
        })
        .from(Products).where( (x, maximumPrice) => {
            return x.price < maximumPrice;
        }, {
             maximumPrice
        });
        let result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.price).toBeLessThan(maximumPrice);
        });

        a = new QueryExpression().select( x => {
            x.name,
            x.price
        })
        .from(Products).where((x, maximumPrice, category) => {
            return x.price < maximumPrice && x.category === category;
        }, 1000, 'Desktops');
        result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.price).toBeLessThan(1000);
        });
    });

    it('should use Date.prototype.getFullYear()', async () => {
        const Orders = new QueryEntity('OrderData');
        let a = new QueryExpression().select( x => {
            x.id,
            x.orderedItem,
            x.orderDate
        })
        .from(Orders).where( x => {
            return x.OrderDate.getFullYear() === 2019;
        }).take(10);
        let result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.orderDate.getFullYear()).toBe(2019);
        });
    });

    it('should use Date.prototype.getYear()', async () => {
        const Orders = new QueryEntity('OrderData');
        let a = new QueryExpression().select( x => {
            x.id,
            x.orderedItem,
            x.orderDate
        })
        .from(Orders).where( x => {
            return x.OrderDate.getYear() >= 2019;
        }).take(10);
        let result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.orderDate.getYear()).toBeGreaterThanOrEqual(119);
        });
    });

    it('should use Date.prototype.getMonth()', async () => {
        const Orders = new QueryEntity('OrderData');
        let a = new QueryExpression().select( x => {
            x.id,
            x.customer,
            x.orderedItem,
            x.orderDate,
            x.merchant
        })
        .from(Orders).where( x => {
            return x.orderDate.getMonth() === 2;
        }).take(10);
        let result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.orderDate.getMonth()).toBe(1);
        });
    });

    it('should use Date.prototype.getDate()', async () => {
        const Orders = new QueryEntity('OrderData');
        let a = new QueryExpression().select( x => {
            x.id,
            x.orderedItem,
            x.orderDate
        })
        .from(Orders).where( x => {
            return x.orderDate.getDate() === 22;
        });
        let result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        // result.forEach( x => {
        //     expect(x.orderDate.getDate()).toBe(22);
        // });
    });

    it('should use Date.prototype.getHours()', async () => {
        const Orders = new QueryEntity('OrderData');
        let a = new QueryExpression().select( x => {
            x.id,
            x.orderedItem,
            x.orderDate
        })
        .from(Orders).where( x => {
            return x.orderDate.getHours() === 14;
        });
        let result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        // result.forEach( x => {
        //     expect(x.orderDate.getHours()).toBe(14);
        // });
    });

    it('should use Date.prototype.getMinutes()', async () => {
        const Orders = new QueryEntity('OrderData');
        let a = new QueryExpression().select( x => {
            x.id,
            x.orderedItem,
            x.orderDate
        })
        .from(Orders).where( x => {
            return x.orderDate.getMinutes() === 50;
        });
        let result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.orderDate.getMinutes()).toBe(50);
        });
    });

    it('should use Date.prototype.getSeconds()', async () => {
        const Orders = new QueryEntity('OrderData');
        let a = new QueryExpression().select( x => {
            x.id,
            x.orderedItem,
            x.orderDate
        })
        .from(Orders).where( x => {
            return x.OrderDate.getSeconds() > 50;
        }).take(10);
        let result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.orderDate.getSeconds()).toBeGreaterThan(50);
        });
    });


    it('should use String.prototype.toLowerCase()', async () => {
        const Products = new QueryEntity('ProductData');
        let a = new QueryExpression().select( x => {
            x.name
        }).from(Products).where( x => {
            return x.name.toLowerCase() === 'apple iphone 5s';
        }).take(10);
        let result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.name.toLowerCase()).toBe('apple iphone 5s');
        });
        a = new QueryExpression().select( x => {
            x.name
        }).from(Products).where( x => {
            return x.name.toLocaleLowerCase() === 'nintendo 2ds';
        }).take(10);
        result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.name.toLocaleLowerCase()).toBe('nintendo 2ds');
        });
    });


    it('should use String.prototype.toUpperCase()', async () => {
        const Products = new QueryEntity('ProductData');
        let a = new QueryExpression().select( x => {
            x.name
        }).from(Products).where( x => {
            return x.name.toUpperCase() === 'APPLE IPHONE 5S';
        }).take(10);
        let result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.name.toUpperCase()).toBe('APPLE IPHONE 5S');
        });
        a = new QueryExpression().select( x => {
            x.name
        }).from(Products).where( x => {
            return x.name.toLocaleUpperCase() === 'NINTENDO 2DS';
        }).take(10);
        result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.name.toLocaleUpperCase()).toBe('NINTENDO 2DS');
        });
    });


    it('should use String.prototype.startsWith()', async () => {
        const Products = new QueryEntity('ProductData');
        let a = new QueryExpression().select( x => {
            x.name
        }).from(Products).where( x => {
            return x.name.startsWith('Apple') === true;
        });
        let result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.name.startsWith('Apple')).toBeTrue();
        });

        a = new QueryExpression().select( x => {
            x.name
        }).from(Products).where( x => {
            return x.name.startsWith('Apple') === false;
        }).take(10);
        result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.name.startsWith('Apple')).toBeFalse();
        });

    });

    it('should use String.prototype.endsWith()', async () => {
        const Products = new QueryEntity('ProductData');
        let a = new QueryExpression().select( x => {
            x.name
        }).from(Products).where( x => {
            return x.name.endsWith('iPad') === true;
        });
        let result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.name.endsWith('iPad')).toBeTrue();
        });

        a = new QueryExpression().select( x => {
            x.name
        }).from(Products).where( x => {
            return x.name.endsWith('iPad') === false;
        }).take(10);
        result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.name.endsWith('iPad')).toBeFalse();
        });

    });

    it('should use String.prototype.indexOf()', async () => {
        const Products = new QueryEntity('ProductData');
        let a = new QueryExpression().select( x => {
            x.name
        }).from(Products).where( x => {
            return x.name.indexOf('iPad') >= 0;
        });
        let result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.name.indexOf('iPad')).toBeGreaterThan(0);
        });

        a = new QueryExpression().select( x => {
            x.name
        }).from(Products).where( x => {
            return x.name.indexOf('Microsoft') === 0;
        });
        result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.name.indexOf('Microsoft')).toBe(0);
        });

    });

    it('should use String.prototype.substr()', async () => {
        const Products = new QueryEntity('ProductData');
        let a = new QueryExpression().select( x => {
            x.name
        }).from(Products).where( x => {
            return x.name.substr(2) === 'msung Galaxy S4';
        });
        let result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.name.substr(2)).toBe('msung Galaxy S4');
        });
        a = new QueryExpression().select( x => {
            x.name
        }).from(Products).where( x => {
            return x.name.substr(2, 5) === 'msung';
        });
        result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.name.substr(2, 5)).toBe('msung');
        });
    });

    it('should use String.prototype.trim()', async () => {
        const Products = new QueryEntity('ProductData');
        let a = new QueryExpression().select( x => {
            x.name
        }).from(Products).where( x => {
            return x.name.trim() === 'Samsung Galaxy Note 3';
        });
        let result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.name.trim()).toBe('Samsung Galaxy Note 3');
        });
    });

    it('should use String.prototype.concat()', async () => {
        const Products = new QueryEntity('ProductData');
        let a = new QueryExpression().select( x => {
            x.name,
            x.category
        }).from(Products).where( x => {
            return x.name.concat(', Product') === 'Samsung Galaxy Note 3, Product';
        });
        let result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.name.concat(', Product')).toBe('Samsung Galaxy Note 3, Product');
        });
    });

    it('should use String.prototype.includes()', async () => {
        const Products = new QueryEntity('ProductData');
        let a = new QueryExpression().select( x => {
            x.name,
            x.category
        }).from(Products).where( x => {
            return x.name.includes('Apple') === true;
        });
        let result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.name.includes('Apple')).toBeTrue();
        });
    });

    it('should use add', async () => {
        const Products = new QueryEntity('ProductData');
        let a = new QueryExpression().select( x => {
            x.name,
            x.category,
            x.price
        }).from(Products).where( x => {
            return x.price + 50 > 450;
        }).take(10);
        let result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.price + 50).toBeGreaterThan(450);
        });
    });

    it('should use subtract', async () => {
        const Products = new QueryEntity('ProductData');
        let a = new QueryExpression().select( x => {
            x.name,
            x.category,
            x.price
        }).from(Products).where( x => {
            return x.price - 50 < 400;
        }).take(10);
        let result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.price - 50).toBeLessThan(400);
        });
    });

    it('should use multiply', async () => {
        const Products = new QueryEntity('ProductData');
        let a = new QueryExpression().select( x => {
            x.name,
            x.category,
            x.price
        }).from(Products).where( x => {
            return x.price * 0.75 < 400;
        }).take(10);
        let result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.price * 0.75).toBeLessThan(400);
        });

        a = new QueryExpression().select( x => {
            x.name,
            x.category,
            x.price
        }).from(Products).where( x => {
            return (x.price * 0.75) + 100 < 400;
        }).take(10);
        result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect((x.price * 0.75) + 100).toBeLessThan(400);
        });
    });

    it('should use divide', async () => {
        const Products = new QueryEntity('ProductData');
        let a = new QueryExpression().select( x => {
            x.name,
            x.category,
            x.price
        }).from(Products).where( x => {
            return x.price / 1.25 < 400;
        }).take(10);
        let result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.price / 1.25).toBeLessThan(400);
        });
    });

    it('should use modulo', async () => {
        const Products = new QueryEntity('ProductData');
        let a = new QueryExpression().select( x => {
            x.name,
            x.category,
            x.price
        }).from(Products).where( x => {
            return (x.price % 122) < 1;
        }).take(10);
        let result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.price % 122).toBeLessThan(1);
        });
    });

    it('should use bitand', async () => {
        const Orders = new QueryEntity('OrderData');
        let a = new QueryExpression().select( x => {
            x.id,
            x.orderedItem,
            x.orderDate
        }).from(Orders).where( x => {
            return (x.orderDate.getMonth() & 1) === 0;
        }).take(10);
        let result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect((x.orderDate.getMonth() + 1) & 1).toBe(0);
        });
    });

    it('should use floor', async () => {
        const Products = new QueryEntity('ProductData');
        let a = new QueryExpression().select( x => {
            x.name,
            x.category,
            x.price
        }).from(Products).where( x => {
            return Math.floor(x.price) === 122;
        }).take(10);
        let result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(Math.floor(x.price)).toBe(122);
        });
    });

    it('should use ceil', async () => {
        const Products = new QueryEntity('ProductData');
        let a = new QueryExpression().select( x => {
            x.name,
            x.category,
            x.price
        }).from(Products).where( x => {
            return Math.ceil(x.price) === 123;
        }).take(10);
        let result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(Math.ceil(x.price)).toBe(123);
        });
    });

    it('should use round', async () => {
        const Products = new QueryEntity('ProductData');
        let a = new QueryExpression().select( x => {
            x.name,
            x.category,
            x.price
        }).from(Products).where( x => {
            return round(x.price, 2) > 122 && round(x.price, 2) < 230;
        }).take(10);
        let result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(round(x.price, 2)).toBeGreaterThan(122);
            expect(round(x.price, 2)).toBeLessThan(230);
        });
    });

    it('should use min', async () => {
        const Products = new QueryEntity('ProductData');
        let a = new QueryExpression().select( x => {
            return {
                minimumPrice: min(x.price)
            }
        }).from(Products).where( x => {
            return x.category === 'Laptops';
        });
        let result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();

        a = new QueryExpression().select( (x) => {
            x.id,
            x.price
        }).from(Products).where( x => {
            return x.category === 'Laptops';
        });
        let results1 = await db.executeAsync(a);

        const results = results1.sort((a, b) => {
            if (a.price > b.price) {
                return 1;
            }
            if (a.price < b.price) {
                return -1;
            }
            return 0;
        });
        expect(result[0].minimumPrice).toBe(results[0].price);
        
    });

    it('should use max', async () => {
        const Products = new QueryEntity('ProductData');
        let a = new QueryExpression().select( x => {
            return {
                maximumPrice: max(x.price)
            }
        }).from(Products).where( x => {
            return x.category === 'Laptops';
        });
        let result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();

        a = new QueryExpression().select( x => {
            x.id,
            x.price
        }).from(Products).where( x => {
            return x.category === 'Laptops';
        });
        let results1 = await db.executeAsync(a);

        const results = results1.sort((a, b) => {
            if (a.price > b.price) {
                return -1;
            }
            if (a.price < b.price) {
                return 1;
            }
            return 0;
        });
        expect(result[0].maximumPrice).toBe(results[0].price);
        
    });

    it('should use order by', async () => {
        const Products = new QueryEntity('ProductData');
        let a = new QueryExpression().select( x => {
            x.name,
            x.price
        }).from(Products).where( x => {
            return x.category === 'Laptops';
        }).orderBy((x) => {
            x.price
        });
        let results = await db.executeAsync(a);
        expect(results.length).toBeTruthy();
        results.forEach( (x, index) => {
            if (index > 0) {
                expect(x.price).toBeGreaterThanOrEqual(results[index-1].price);
            }
        });
        
    });

    it('should use order by with expression', async () => {
        const Products = new QueryEntity('ProductData');
        let a = new QueryExpression().select( x => {
            x.name,
            x.price
        }).from(Products).where( x => {
            return x.category === 'Laptops';
        }).orderBy((x) => {
            return round(x.price, 1);
        }).thenByDescending((x) => {
            return x.releaseDate.getFullYear();
        });
        let results = await db.executeAsync(a);
        expect(results.length).toBeTruthy();
        results.forEach( (x, index) => {
            if (index > 0) {
                expect(x.price).toBeGreaterThanOrEqual(results[index-1].price);
            }
        });
    });

    it('should use order by descending', async () => {
        const Products = new QueryEntity('ProductData');
        let a = new QueryExpression().select( x => {
            x.name,
            x.price
        }).from(Products).where( x => {
            return x.category === 'Laptops';
        }).orderByDescending((x) => {
            x.price
        });
        let results = await db.executeAsync(a);
        expect(results.length).toBeTruthy();
        results.forEach( (x, index) => {
            if (index > 0) {
                expect(x.price).toBeLessThanOrEqual(results[index-1].price);
            }
        });
        
    });

    it('should use then by', async () => {
        const People = new QueryEntity('PersonData');
        let a = new QueryExpression().select( x => {
            x.id,
            x.familyName,
            x.givenName
        }).from(People).orderBy((x) => {
            x.familyName
        }).thenBy((x) => x.givenName);
        let results = await db.executeAsync(a);
        expect(results.length).toBeTruthy();
        results.forEach( (x, index) => {
            if (index > 0) {
                expect(x.familyName).toBeGreaterThanOrEqual(results[index-1].familyName);
                if (x.familyName === results[index-1].familyName) {
                    expect(x.givenName).toBeGreaterThanOrEqual(results[index-1].givenName);
                }
            }
        });
        
    });

    it('should use then by descending', async () => {
        const People = new QueryEntity('PersonData');
        let a = new QueryExpression().select( x => {
            x.familyName,
            x.givenName
        }).from(People)
            .orderByDescending((x) => x.familyName)
            .thenByDescending((x) => x.givenName).take(50);
        let results = await db.executeAsync(a);
        expect(results.length).toBeTruthy();
        results.forEach( (x, index) => {
            if (index > 0) {
                expect(x.familyName).toBeLessThanOrEqual(results[index-1].familyName);
                if (x.familyName === results[index-1].familyName) {
                    expect(x.givenName).toBeLessThanOrEqual(results[index-1].givenName);
                }
            }
        });
        
    });

    it('should use group by', async () => {
        const Orders = new QueryEntity('OrderData');
        let a = new QueryExpression().select( x => {
            return {
                orderedItem: x.orderedItem,
                total: count(x.id)
            }
        }).from(Orders)
            .groupBy((x) => x.orderedItem)
            .orderByDescending((x) => {
                return {
                    total: count(x.id)
                };
            })
            .take(10);
        let results = await db.executeAsync(a);
        expect(results.length).toBeTruthy();
    });

});