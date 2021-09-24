const {QueryExpression} = require("../query");

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
        let a = new QueryExpression().select( x => {
            x.id,
            x.familyName,
            x.givenName
        })
        .from('PersonData').where( x => {
            return x.id === 355;
        });
        expect(a.$where).toEqual({
                "id": 355 
            });
        let result = await db.executeAsync(a);
        expect(result).toBeTruthy();
        expect(result.length).toBe(1);
        expect(result[0].id).toBe(355);
        
    });

    it('should use greater than expression', async () => {
        let a = new QueryExpression().select( x => {
            x.id,
            x.name,
            x.price
        })
        .from('ProductData').where( x => {
            return x.price > 1000;
        });
        let result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.price).toBeGreaterThan(1000);
        });
    });
    it('should use lower than expression', async () => {
        let a = new QueryExpression().select( x => {
            x.id,
            x.name,
            x.price
        })
        .from('ProductData').where( x => {
            return x.price < 400;
        });
        let result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.price).toBeLessThan(1000);
        });
    });

    it('should use between expression', async () => {
        let a = new QueryExpression().select( x => {
            x.id,
            x.name,
            x.price
        })
        .from('ProductData').where( x => {
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
        let a = new QueryExpression().select( x => {
            x.id,
            x.name,
            x.price
        })
        .from('ProductData').where( x => {
            return x.price >= 1000;
        });
        let result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.price).toBeGreaterThanOrEqual(1000);
        });
    });

    it('should use lower than or equal expression', async () => {
        let a = new QueryExpression().select( x => {
            x.id,
            x.name,
            x.price
        })
        .from('ProductData').where( x => {
            return x.price <= 460.9;
        });
        let result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.price).toBeLessThanOrEqual(460.9);
        });
    });

    
    it('should use parameters', async () => {
        let maximumPrice = 400;
        let a = new QueryExpression().select( x => {
            x.name,
            x.price
        })
        .from('ProductData').where( x => {
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

    fit('should use Date.prototype.getFullYear()', async () => {
        let a = new QueryExpression().select( x => {
            x.product,
            x.orderDate
        })
        .from('OrderData').where( x => {
            return x.OrderDate.getFullYear() === 2019;
        }).take(10);
        let result = await db.executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.orderDate.getFullYear()).toBe(2019);
        });
    });

    it('should use Date.prototype.getMonth()', async () => {
        let a = new QueryExpression().select( x => {
            x.OrderID,
            x.Customer,
            x.Employee,
            x.OrderDate,
            x.Shipper
        })
        .from('Orders').where( x => {
            return x.OrderDate.getMonth() === 2;
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.OrderDate.getMonth()).toBe(1);
        });
    });

    it('should use Date.prototype.getDate()', async () => {
        let a = new QueryExpression().select( x => {
            x.OrderID,
            x.Customer,
            x.Employee,
            x.OrderDate,
            x.Shipper
        })
        .from('Orders').where( x => {
            return x.OrderDate.getDate() === 22;
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.OrderDate.getDate()).toBe(22);
        });
    });

    it('should use Date.prototype.getHours()', async () => {
        let a = new QueryExpression().select( x => {
            x.OrderID,
            x.Customer,
            x.Employee,
            x.OrderDate,
            x.Shipper
        })
        .from('Orders').where( x => {
            return x.OrderDate.getHours() === 14;
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.OrderDate.getHours()).toBe(14);
        });
    });

    it('should use Date.prototype.getMinutes()', async () => {
        let a = new QueryExpression().select( x => {
            x.OrderID,
            x.Customer,
            x.Employee,
            x.OrderDate,
            x.Shipper
        })
        .from('Orders').where( x => {
            return x.OrderDate.getMinutes() === 50;
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.OrderDate.getMinutes()).toBe(50);
        });
    });

    it('should use Date.prototype.getSeconds()', async () => {
        let a = new QueryExpression().select( x => {
            x.OrderID,
            x.Customer,
            x.Employee,
            x.OrderDate,
            x.Shipper
        })
        .from('Orders').where( x => {
            return x.OrderDate.getSeconds() > 0;
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeFalsy();
    });

    it('should use QueryExpression.orderBy()', async () => {
        let a = new QueryExpression().select( x => {
            x.ProductID,
            x.ProductName,
            x.Price
        })
        .from('Products').where( x => {
            return x.Price < 10;
        }).orderBy( x => { 
             x.Price
            });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( (x, index) => {
            if (index>0) {
                expect(x.Price).toBeGreaterThanOrEqual(result[index-1].Price);
            }
            
        });
    });

    it('should use QueryExpression.orderByDescending()', async () => {
        let a = new QueryExpression().select( x => {
            x.ProductID,
            x.ProductName,
            x.Price
        })
        .from('Products').where( x => {
            return x.Price < 10;
        }).orderByDescending( x => { 
             x.Price
            });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( (x, index) => {
            if (index>0) {
                expect(x.Price).toBeLessThanOrEqual(result[index-1].Price);
            }
            
        });
    });

    it('should use QueryExpression.join()', async () => {
        let a = new QueryExpression().select( x => {
            x.OrderID,
            x.OrderDate,
            x.Customer
        })
        .from('Orders')
        .join('Customers')
        .with('Customer', 'CustomerID')
        .where( x => {
            return x.Customer === 14;
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
    });
    
});