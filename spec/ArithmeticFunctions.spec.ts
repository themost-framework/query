import { QueryExpression, add, subtract, multiply, divide, bitAnd } from '../index';
import { TestAdapter } from './adapter/TestAdapter';
import { initDatabase } from './adapter/TestDatabase';

describe('Arithmetic Functions', () => {
    beforeAll(async () => {
        await initDatabase();
    });
    it('should use add operator', async () => {
        const a = new QueryExpression().select( (x: any) => {
            x.ProductID,
            x.ProductName,
            x.Price
        })
        .from('Products').where( (x: any) => {
            return x.Price + 10 > 30;
        });
        const result = await new TestAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( (x: any) => {
            expect(x.Price + 10 ).toBeGreaterThan(30);
        });
    });
    it('should use add method', async () => {
        const a = new QueryExpression().select( (x: any) => {
            x.ProductID,
            x.ProductName,
            x.Price
        })
        .from('Products').where( (x: any) => {
            return add(x.Price, 10) > 30;
        });
        const result = await new TestAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( (x: any) => {
            expect(x.Price + 10).toBeGreaterThan(30);
        });
    });
    it('should use subtract operator', async () => {
        const a = new QueryExpression().select( (x: any) => {
            x.ProductID,
            x.ProductName,
            x.Price
        })
        .from('Products').where( (x: any) => {
            return (x.Price - 10 < 30) && (x.Price - 10 > 0);
        });
        const result = await new TestAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( (x: any) => {
            expect(x.Price - 10).toBeLessThan(30);
            expect(x.Price - 10).toBeGreaterThan(0);
        });
    });

    it('should use subtract method', async () => {
        const a = new QueryExpression().select( (x: any) => {
            x.ProductID,
            x.ProductName,
            x.Price
        })
        .from('Products').where( (x: any) => {
            return (subtract(x.Price, 10) < 30) && (subtract(x.Price, 10) > 0);
        });
        const result = await new TestAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( (x: any) => {
            expect(x.Price - 10).toBeLessThan(30);
            expect(x.Price - 10).toBeGreaterThan(0);
        });
    });

    it('should use multiply operator', async () => {
        const a = new QueryExpression().select( (x: any) => {
            x.ProductID,
            x.ProductName,
            x.Price
        })
        .from('Products').where( (x: any) => {
            return x.Price * 0.8 < 30;
        });
        const result = await new TestAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( (x: any) => {
            expect(x.Price * 0.8).toBeLessThan(30);
        });
    });

    it('should use multiply method', async () => {
        const a = new QueryExpression().select( (x: any) => {
            x.ProductID,
            x.ProductName,
            x.Price
        })
        .from('Products').where( (x: any) => {
            return multiply(x.Price, 0.8) < 30;
        });
        const result = await new TestAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( (x: any) => {
            expect(x.Price * 0.8).toBeLessThan(30);
        });
    });

    it('should use divide operator', async () => {
        const a = new QueryExpression().select( (x: any) => {
            x.ProductID,
            x.ProductName,
            x.Price
        })
        .from('Products').where( (x: any) => {
            return x.Price / 1.25 < 30;
        });
        const result = await new TestAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( (x: any) => {
            expect(x.Price / 1.25).toBeLessThan(30);
        });
    });

    it('should use divide method', async () => {
        const a = new QueryExpression().select( (x: any) => {
            x.ProductID,
            x.ProductName,
            x.Price
        })
        .from('Products').where( (x: any) => {
            return divide(x.Price, 1.25) < 30;
        });
        const result = await new TestAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( (x: any) => {
            expect(x.Price / 1.25).toBeLessThan(30);
        });
    });

    it('should use bitwise and operator', async () => {

        const a = new QueryExpression().select( (x: any) => {
            x.ProductID,
            x.ProductName,
            x.Price
        })
        .from('Products').where( (x: any) => {
            // tslint:disable-next-line: no-bitwise
            return (x.ProductID & 2) === 2;
        });
        const result = await new TestAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( (x: any) => {
            // tslint:disable-next-line: no-bitwise
            expect(x.ProductID & 2).toBe(2);
        });
    });

    it('should use bitwise and method', async () => {
        const a = new QueryExpression().select( (x: any) => {
            x.ProductID,
            x.ProductName,
            x.Price
        })
        .from('Products').where( (x: any) => {
            return bitAnd(x.ProductID, 2) === 2;
        });
        const result = await new TestAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( (x: any) => {
            // tslint:disable-next-line: no-bitwise
            expect(x.ProductID & 2).toBe(2);
        });
    });
});