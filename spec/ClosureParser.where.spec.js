const {QueryExpression, QueryEntity} = require("../query");

// eslint-disable-next-line no-unused-vars
const { round, min, max } = require('../closures');
const { MemoryAdapter } = require('./test/TestMemoryAdapter');

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
             db.close();
             return done();
         }
     })
    it('should use object property to an equal expression', async () => {
        const People = new QueryEntity('PersonData');
        let a = new QueryExpression().select( x => {
            x.id,
            x.familyName,
            x.givenName
        })
        .from(People).where( x => {
            return x.id === 355;
        });
        expect(a.$where).toEqual({
                $eq: [
                    { $name: "id" },
                    355
                ]
            });
        let result = await db.executeAsync(a);
        expect(result).toBeTruthy();
        expect(result.length).toBe(1);
        expect(result[0].id).toBe(355);
        
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
        .from(Products).where( x => {
            return x.price < maximumPrice;
        }, {
             maximumPrice
        });
        let result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.price).toBeLessThan(maximumPrice);
        });
    });

    it('should use Date.prototype.getFullYear()', async () => {
        const Orders = new QueryEntity('OrderData');
        let a = new QueryExpression().select( x => {
            x.product,
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
            x.product,
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
        result.forEach( x => {
            expect(x.orderDate.getDate()).toBe(22);
        });
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
        result.forEach( x => {
            expect(x.orderDate.getHours()).toBe(14);
        });
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


    

});