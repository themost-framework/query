import { QueryExpression } from '../index';
import { TestAdapter } from './adapter/TestAdapter';
import { initDatabase } from './adapter/TestDatabase';

describe('ClosureParser.parseFilter()', () => {
    beforeAll(async () => {
        await initDatabase();
    });
    it('should use object property to an equal expression', async () => {
        const a = new QueryExpression().select( (x: { CustomerID: any; CustomerName: any; }) => {
            x.CustomerID,
            x.CustomerName
        })
        .from('Customers').where( (x: { CustomerID: number; }) => {
            return x.CustomerID === 78;
        });
        expect(a.$where).toEqual({
                "CustomerID": 78
            });
        const result = await new TestAdapter().executeAsync(a);
        expect(result).toBeTruthy();
        expect(result.length).toBe(1);
        expect(result[0].CustomerID).toBe(78);

    });

    it('should use object property to an equal expression', async () => {
        const a = new QueryExpression().select( (x: { CustomerID: any; CustomerName: any; }) => {
            return {
                CustomerID: x.CustomerID,
                Name: x.CustomerName
            };
        })
        .from('Customers').where( (x: { CustomerID: number; }) => {
            return x.CustomerID === 78;
        });
        const result = await new TestAdapter().executeAsync(a);
        expect(result).toBeTruthy();
        expect(result.length).toBe(1);
        expect(result[0].CustomerID).toBe(78);
        expect(result[0].Name).toBeTruthy();
    });

    it('should use greater than expression', async () => {
        const a = new QueryExpression().select( (x: { CustomerID: any; CustomerName: any; ContactName: any; }) => {
            x.CustomerID,
            x.CustomerName,
            x.ContactName
        })
        .from('Customers').where( (x: { CustomerID: number; }) => {
            return x.CustomerID > 78;
        });
        const result = await new TestAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( (x: { CustomerID: any; }) => {
            expect(x.CustomerID).toBeGreaterThan(78);
        });
    });
    it('should use lower than expression', async () => {
        const a = new QueryExpression().select( (x: { CustomerID: any; CustomerName: any; ContactName: any; }) => {
            x.CustomerID,
            x.CustomerName,
            x.ContactName
        })
        .from('Customers').where( (x: { CustomerID: number; }) => {
            return x.CustomerID < 78;
        });
        const result = await new TestAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( (x: { CustomerID: any; }) => {
            expect(x.CustomerID).toBeLessThan(78);
        });
    });

    it('should use between expression', async () => {
        const a = new QueryExpression().select( (x: { CustomerID: any; CustomerName: any; ContactName: any; }) => {
            x.CustomerID,
            x.CustomerName,
            x.ContactName
        })
        .from('Customers').where( (x: { CustomerID: number; }) => {
            return x.CustomerID > 78 && x.CustomerID < 81;
        });
        const result = await new TestAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( (x: { CustomerID: any; }) => {
            expect(x.CustomerID).toBeGreaterThan(78);
            expect(x.CustomerID).toBeLessThan(81);
        });
    });

    it('should use greater than or equal expression', async () => {
        const a = new QueryExpression().select( (x: { CustomerID: any; CustomerName: any; ContactName: any; }) => {
            x.CustomerID,
            x.CustomerName,
            x.ContactName
        })
        .from('Customers').where( (x: { CustomerID: number; }) => {
            return x.CustomerID >= 78;
        });
        const result = await new TestAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( (x: { CustomerID: any; }) => {
            expect(x.CustomerID).toBeGreaterThanOrEqual(78);
        });
    });

    it('should use lower than or equal expression', async () => {
        const a = new QueryExpression().select( (x: { CustomerID: any; CustomerName: any; ContactName: any; }) => {
            x.CustomerID,
            x.CustomerName,
            x.ContactName
        })
        .from('Customers').where( (x: { CustomerID: number; }) => {
            return x.CustomerID <= 78;
        });
        const result = await new TestAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( (x: { CustomerID: any; }) => {
            expect(x.CustomerID).toBeLessThanOrEqual(78);
        });
    });


    it('should use parameters', async () => {
        const maximumPrice = 30;
        const a = new QueryExpression().select( (x: { ProductID: any; ProductName: any; Price: any; }) => {
            x.ProductID,
            x.ProductName,
            x.Price
        })
        .from('Products').where( (x: { Price: number; }) => {
            return x.Price < maximumPrice;
        }, {
             maximumPrice
        });
        const result = await new TestAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( (x: { Price: number; }) => {
            expect(x.Price / 1.25).toBeLessThan(30);
        });
    });

    it('should use Date.prototype.getFullYear()', async () => {
        const a = new QueryExpression().select( (x: { OrderID: any; Customer: any; Employee: any; OrderDate: any; Shipper: any; }) => {
            x.OrderID,
            x.Customer,
            x.Employee,
            x.OrderDate,
            x.Shipper
        })
        .from('Orders').where( (x: { OrderDate: Date; }) => {
            return x.OrderDate.getFullYear() === 1996;
        });
        const result = await new TestAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( (x: { OrderDate: Date; }) => {
            expect(x.OrderDate.getFullYear()).toBe(1996);
        });
    });

    it('should use Date.prototype.getMonth()', async () => {
        const a = new QueryExpression().select( (x: { OrderID: any; Customer: any; Employee: any; OrderDate: any; Shipper: any; }) => {
            x.OrderID,
            x.Customer,
            x.Employee,
            x.OrderDate,
            x.Shipper
        })
        .from('Orders').where( (x: { OrderDate: Date; }) => {
            return x.OrderDate.getMonth() === 2;
        });
        const result = await new TestAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( (x: { OrderDate: Date; }) => {
            expect(x.OrderDate.getMonth()).toBe(1);
        });
    });

    it('should use Date.prototype.getDate()', async () => {
        const a = new QueryExpression().select( (x: { OrderID: any; Customer: any; Employee: any; OrderDate: any; Shipper: any; }) => {
            x.OrderID,
            x.Customer,
            x.Employee,
            x.OrderDate,
            x.Shipper
        })
        .from('Orders').where( (x: { OrderDate: Date; }) => {
            return x.OrderDate.getDate() === 22;
        });
        const result = await new TestAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( (x: { OrderDate: Date; }) => {
            expect(x.OrderDate.getDate()).toBe(22);
        });
    });

    it('should use Date.prototype.getHours()', async () => {
        const a = new QueryExpression().select( (x: { OrderID: any; Customer: any; Employee: any; OrderDate: any; Shipper: any; }) => {
            x.OrderID,
            x.Customer,
            x.Employee,
            x.OrderDate,
            x.Shipper
        })
        .from('Orders').where( (x: { OrderDate: { getHours: () => number; }; }) => {
            return x.OrderDate.getHours() === 14;
        });
        const result = await new TestAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( (x: { OrderDate: Date; }) => {
            expect(x.OrderDate.getHours()).toBe(14);
        });
    });

    it('should use Date.prototype.getMinutes()', async () => {
        const a = new QueryExpression().select( (x: { OrderID: any; Customer: any; Employee: any; OrderDate: any; Shipper: any; }) => {
            x.OrderID,
            x.Customer,
            x.Employee,
            x.OrderDate,
            x.Shipper
        })
        .from('Orders').where( (x: { OrderDate: Date; }) => {
            return x.OrderDate.getMinutes() === 50;
        });
        const result = await new TestAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( (x: { OrderDate: Date; }) => {
            expect(x.OrderDate.getMinutes()).toBe(50);
        });
    });

    it('should use Date.prototype.getSeconds()', async () => {
        const a = new QueryExpression().select( (x: { OrderID: any; Customer: any; Employee: any; OrderDate: any; Shipper: any; }) => {
            x.OrderID,
            x.Customer,
            x.Employee,
            x.OrderDate,
            x.Shipper
        })
        .from('Orders').where( (x: { OrderDate: Date; }) => {
            return x.OrderDate.getSeconds() > 0;
        });
        const result = await new TestAdapter().executeAsync(a);
        expect(result.length).toBeFalsy();
    });

    it('should use QueryExpression.orderBy()', async () => {
        const a = new QueryExpression().select( (x: { ProductID: any; ProductName: any; Price: any; }) => {
            x.ProductID,
            x.ProductName,
            x.Price
        })
        .from('Products').where( (x: { Price: number; }) => {
            return x.Price < 10;
        }).orderBy( (x: { Price: any; }) => {
             x.Price
            });
        const result = await new TestAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( (x: { Price: any; }, index: number) => {
            if (index>0) {
                expect(x.Price).toBeGreaterThanOrEqual(result[index-1].Price);
            }

        });
    });

    it('should use QueryExpression.orderByDescending()', async () => {
        const a = new QueryExpression().select( (x: { ProductID: any; ProductName: any; Price: any; }) => {
            x.ProductID,
            x.ProductName,
            x.Price
        })
        .from('Products').where( (x: { Price: number; }) => {
            return x.Price < 10;
        }).orderByDescending( (x: { Price: any; }) => {
             x.Price
            });
        const result = await new TestAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( (x: { Price: any; }, index: number) => {
            if (index>0) {
                expect(x.Price).toBeLessThanOrEqual(result[index-1].Price);
            }

        });
    });

    // it('should use QueryExpression.join()', async () => {
    //     const a = new QueryExpression().select( (x: { OrderID: any; OrderDate: any; Customer: any; }) => {
    //         x.OrderID,
    //         x.OrderDate,
    //         x.Customer
    //     })
    //     .from('Orders')
    //     .join('Customers')
    //     .with('Customer', 'CustomerID')
    //     .where( (x: { Customer: number; }) => {
    //         return x.Customer === 14;
    //     });
    //     const result = await new TestAdapter().executeAsync(a);
    //     expect(result.length).toBeTruthy();
    // });

});