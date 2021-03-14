import { QueryExpression } from '../index';
import { TestAdapter } from './adapter/TestAdapter';
import { initDatabase } from './adapter/TestDatabase';
import { QueryEntity } from '../query';

interface Customer {
    CustomerID?: number; CustomerName: string;
}

interface Order {
    OrderID?: number; 
    Customer?: Customer | number | any; 
    Employee?: any;
    OrderDate?: Date;
    Shipper?: any;
}

describe('ClosureParser.parseSelect()', () => {
    beforeAll(async () => {
        await initDatabase();
    });
    it('should use query params', async () => {
        const customer = 78;
        let a = new QueryExpression().select(
            (x: Customer) => {
            x.CustomerID,
            x.CustomerName
        })
        .from('Customers').where( (x: Customer) => {
            return x.CustomerID === customer;
        }, {
            customer
        });
        expect(a.$where).toEqual({
                CustomerID: 78
            });
        const result = await new TestAdapter().executeAsync(a);
        expect(result).toBeTruthy();
        expect(result.length).toBe(1);
        expect(result[0].CustomerID).toBe(customer);
        
    });

    it('should use alias', async () => {
        const customer = 78;
        let a = new QueryExpression().select( (x: Customer) => {
            return {
                id: x.CustomerID,
                name: x.CustomerName
            }
        })
        .from('Customers').where( (x: Customer) => {
            return x.CustomerID === customer;
        }, {
            customer
        });
        const result = await new TestAdapter().executeAsync(a);
        expect(result).toBeTruthy();
        expect(result.length).toBe(1);
        expect(result[0].id).toBe(customer);
        
    });

});