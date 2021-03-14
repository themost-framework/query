import { QueryExpression, QueryEntity, min, max, count, mean, sum } from '../index';
import { TestAdapter } from './adapter/TestAdapter';
import { initDatabase } from './adapter/TestDatabase';
import { QueryField } from '../query';

describe('Aggregate Functions', () => {
    beforeAll(async () => {
        await initDatabase();
    });
    it('should use min()', async () => {
        const q = new QueryExpression().from('Products')
            .select(new QueryField().min('Price').as('SmallestPrice'));
        expect(q.$select).toBeTruthy();
        const a = new QueryExpression().select( (x: any) => {
            return {
                SmallestPrice: min(x.Price)
            }
        })
        .from('Products');
        expect(a.$select).toBeTruthy();
        const result = await new TestAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        expect(result[0].SmallestPrice).toBe(2.5);
    });
    it('should use max()', async () => {
        const a = new QueryExpression().select( (x: any) => {
            return {
                LargestPrice: max(x.Price)
            }
        })
        .from('Products');
        const result = await new TestAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        expect(result[0].LargestPrice).toBe(263.5);
    });
    it('should use avg()', async () => {
        const a = new QueryExpression().select( (x: any) => {
            return {
                AveragePrice: mean(x.Price)
            }
        })
        .from('Products');
        const result = await new TestAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        expect(result[0].AveragePrice).toBeGreaterThanOrEqual(28.866);
    });

    it('should use sum()', async () => {
        const OrderDetails = new QueryEntity('Order_Details');
        const a = new QueryExpression().select( (x: any) => {
            return {
                TotalQuantity: sum(x.Quantity)
            }
        })
        .from(OrderDetails);
        const result = await new TestAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        expect(result[0].TotalQuantity).toBeTruthy();
    });
    it('should use count()', async () => {
        const a = new QueryExpression().select( (x: any) => {
            return {
                TotalProducts: count(x.ProductID)
            }
        })
        .from('Products');
        const result = await new TestAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        expect(result[0].TotalProducts).toBeTruthy();
    });

});