import { MemoryAdapter } from './test/TestMemoryAdapter';
import {ArithmeticExpression, SimpleMethodCallExpression, SequenceExpression, Expression, MemberExpression, LogicalExpression, MethodCallExpression, ComparisonExpression} from '../index';

describe('Expression', () => {

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
    afterAll(async () => {
        if (db) {
            await db.closeAsync();
        }
    });
    it('should create an instance of ArithmeticExpression', async () => {
        const expression = new ArithmeticExpression(
            new MemberExpression('price'), '$mul', 0.75
        );
        expect(expression instanceof Expression).toBeTruthy();
        expect(expression).toBeTruthy();
        expect(expression.exprOf()).toEqual({
            $mul: [
                { $name: 'price' },
                0.75
            ]
        });
    });

    it('should create an instance of MemberExpression', async () => {
        const expr = new MemberExpression('price');
        expect(expr instanceof MemberExpression).toBeTruthy();
        expect(expr instanceof Expression).toBeTruthy();
        expect(expr.exprOf()).toEqual({ $name: 'price' });
    });

    it('should create an instance of LogicalExpression', async () => {
        const expr = new LogicalExpression(
            '$and',
            [
                new ComparisonExpression(
                    new MemberExpression('price'),
                    '$ge',
                    500
                ),
                new ComparisonExpression(
                    new MemberExpression('price'),
                    '$le',
                    1000
                )
            ]
        );
        expect(expr instanceof LogicalExpression).toBeTruthy();
        expect(expr instanceof Expression).toBeTruthy();
        expect(expr.exprOf()).toEqual({
            $and: [
                { $ge: [ { $name: 'price' }, 500 ] },
                { $le: [ { $name: 'price' }, 1000 ] }
            ]
        });
    });

    it ('should create an instance of ComparisonExpression', async () => {
        const expr = new ComparisonExpression(
            new MemberExpression('price'),
            '$ge',
            500
        );
        expect(expr instanceof ComparisonExpression).toBeTruthy();
        expect(expr instanceof Expression).toBeTruthy();
        expect(expr.exprOf()).toEqual({ $ge: [ { $name: 'price' }, 500 ] });
    });

    it ('should create an instance of MethodCallExpression', async () => {
        const expr = new MethodCallExpression(
            'round',
            [new MemberExpression('price'),
            2]
        );
        expect(expr instanceof MethodCallExpression).toBeTruthy();
        expect(expr instanceof Expression).toBeTruthy();
        const expr1 = expr.exprOf();
        expect(expr1).toEqual({
            $round: [
                { $name: 'price' },
                2
            ]
        });
    });

    it ('should create an instance of SimpleMethodCallExpression', async () => {
        const expr = new SimpleMethodCallExpression(
            'round',
            [new MemberExpression('price'),
                2]
        );
        expect(expr instanceof SimpleMethodCallExpression).toBeTruthy();
        expect(expr instanceof Expression).toBeTruthy();
        const expr1 = expr.exprOf();
        expect(expr1).toEqual({
            $round: [
                { $name: 'price' },
                2
            ]
        });
    });

    it ('should create an instance of SequenceExpression', async () => {
        const expr = new SequenceExpression();
        expr.value = [
            new MemberExpression('price'),
            new MemberExpression('weight')
        ]
        expect(expr instanceof SequenceExpression).toBeTruthy();
        expect(expr instanceof Expression).toBeTruthy();
        const expr1 = expr.exprOf();
        expect(expr1).toEqual({
            price: 1,
            weight: 1
        });
    });

});
