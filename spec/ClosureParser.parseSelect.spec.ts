import { QueryExpression, round } from '../index';
import { TestAdapter } from './adapter/TestAdapter';
import { initDatabase } from './adapter/TestDatabase';
import { QueryEntity } from '../query';

interface Customer {
    CustomerID?: number; 
    CustomerName: string;
}

interface Order {
    OrderID?: number; 
    Customer?: Customer | number | any; 
    Employee?: any;
    OrderDate?: Date;
    Shipper?: any;
}

interface Supplier {
    SupplierID?: number; 
    SupplierName: string;
}

interface Product {
    ProductID?: number; 
    ProductName?: string; 
    Supplier?: any | Supplier;
    Unit?: string;
    Price?: number;
}

interface OrderDetail {
    OrderDetailID?: number; 
    Order?: any | Order; 
    Product?: any | Product;
    Quantity?: number;
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

    it('should use select and join', async () => {
        const customer = 90;
        const Orders = new QueryEntity('Orders');
        const Customers: any = new QueryEntity('Customers');
        let a = new QueryExpression()
        .select( (x: Order) => {
            return {
                OrderID: x.OrderID,
                CustomerName: Customers.CustomerName
            }
        })
        .from(Orders)
        .join(Customers)
        .with((x: Order) => x.Customer, (x: Customer) => x.CustomerID)
        .where( (x: Order) => {
            return x.Customer.CustomerID === customer;
        }, {
            customer
        });
        console.log(JSON.stringify(a, null, 4));
        const result = await new TestAdapter().executeAsync(a);
        expect(result).toBeTruthy();
        
    });


    it('should use select and multiple joins', async () => {
        const customer = 90;
        const OrderDetails: any = new QueryEntity('Order_Details').as('OrderDetails');
        const Products: any = new QueryEntity('Products');
        const Orders: any = new QueryEntity('Orders');
        const Customers: any = new QueryEntity('Customers');
        let a = new QueryExpression()
        .select( (x: OrderDetail) => {
            return {
                OrderID: x.OrderDetailID,
                ProductName: Products.ProductName,
                CustomerName: Customers.CustomerName,
                OrderDate: Orders.OrderDate
            }
        })
        .from(OrderDetails)
        .join(Products)
        .with((x: OrderDetail) => x.Product, (x: Product) => x.ProductID)
        .join(Orders)
        .with((_x: any) => {
            return OrderDetails.Order === Orders.OrderID;
        })
        .join(Customers)
        .with((_x: any) => {
            return Orders.Customer === Customers.CustomerID;
        })
        .where( (x: Order) => {
            return x.Customer.CustomerID === customer;
        }, {
            customer
        });
        const result = await new TestAdapter().executeAsync(a);
        expect(result).toBeTruthy();
        
    });

    it('should use method on select', async () => {
        const a = new QueryExpression().select( (x: any) => {
            return {
                ProductID: x.ProductID,
                ProductName: x.ProductName,
                Price: round(x.Price, 2)
            };
            
        })
        .from('Products').where( (x: any) => {
            return x.Price < 30;
        });
        console.log(JSON.stringify(a, null, 4));
        const result = await new TestAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( (x: any) => {
            expect(x.Price).toBeLessThan(30);
        });
    });

});