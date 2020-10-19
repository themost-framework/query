
const {round, min, max} = require("../closures");
const {QueryExpression} = require("../query");
const Products = require('./test/config/models/Product.json');
const {migrateAsync} = require('./test/TestMemoryDatabase');
const {MemoryAdapter} = require('./test/TestMemoryAdapter');

/**
 * @class Product
 * @property {number} Product#ProductID
 * @property {number} Product#ProductName
 * @property {number} Product#Price
 * @property {number} Product#Category
 */

// closure parser test
describe('ClosureParser', function() {

    beforeAll(async ()=> {
        process.env.NODE_ENV = 'test';
        await migrateAsync(Products);
        process.env.NODE_ENV = 'development';
    });

    it('should use Math.floor()', async function () {
        let query = new QueryExpression()
            .where('ProductName').equal('Mozzarella di Giovanni')
            .select(function(x) {
                return {
                    ProductID: x.ProductID,
                    ProductName: x.ProductName,
                    Price: Math.floor(x.Price)
                };
            }).from('Products');
        const items = await new MemoryAdapter().executeAsync(query);
        expect(items).toBeTruthy();
        // get items[0]
        const product = items[0];
        expect(product).toBeTruthy();

        const rawItems = await new MemoryAdapter().executeAsync(
            new QueryExpression()
            .where('ProductName').equal('Mozzarella di Giovanni')
            .select('ProductID', 'ProductName', 'Price')
            .from('Products')
        );
        const rawProduct = rawItems[0];
        expect(rawProduct).toBeTruthy();
        expect(Math.floor(rawProduct.Price)).toBe(product.Price);

    });

    it('should use Math.ceil()', async function () {
        let query = new QueryExpression()
            .where('ProductName').equal('Mozzarella di Giovanni')
            .select(function(x) {
                return {
                    ProductID: x.ProductID,
                    ProductName: x.ProductName,
                    Price: Math.ceil(x.Price)
                };
            }).from('Products');
        const items = await new MemoryAdapter().executeAsync(query);
        expect(items).toBeTruthy();
        // get items[0]
        const product = items[0];
        expect(product).toBeTruthy();

        const rawItems = await new MemoryAdapter().executeAsync(
            new QueryExpression()
                .where('ProductName').equal('Mozzarella di Giovanni')
                .select('ProductID', 'ProductName', 'Price')
                .from('Products')
        );
        const rawProduct = rawItems[0];
        expect(rawProduct).toBeTruthy();
        expect(Math.ceil(rawProduct.Price)).toBe(product.Price);

    });

    it('should use round()', async function () {
        let query = new QueryExpression()
            .where('ProductName').equal('Escargots de Bourgogne')
            .select(function(x) {
                return {
                    ProductID: x.ProductID,
                    ProductName: x.ProductName,
                    Price: round(x.Price, 1)
                };
            }).from('Products');
        const items = await new MemoryAdapter().executeAsync(query);
        expect(items).toBeTruthy();
        // get items[0]
        const product = items[0];
        expect(product).toBeTruthy();

        const rawItems = await new MemoryAdapter().executeAsync(
            new QueryExpression()
                .where('ProductName').equal('Escargots de Bourgogne')
                .select('ProductID', 'ProductName', 'Price')
                .from('Products')
        );
        const rawProduct = rawItems[0];
        expect(rawProduct).toBeTruthy();
        expect(round(rawProduct.Price, 1)).toBe(product.Price);

    });

    it('should use min()', async function () {
        let query = new QueryExpression()
            .where('Category').equal(8)
            .select(function(x) {
                return {
                    Price: min(x.Price)
                };
            }).from('Products');
        const items = await new MemoryAdapter().executeAsync(query);
        expect(items).toBeTruthy();
        // get items[0]
        const minPrice = items[0].Price;
        expect(minPrice).toBeTruthy();

        const rawItems = await new MemoryAdapter().executeAsync(
            new QueryExpression()
                .where('Category').equal(8)
                .select('Price')
                .from('Products')
        );
        const rawPrices = rawItems.map((x) => {
            return x.Price;
        });
        const value = min(rawPrices);
        expect(value).toBe(minPrice);
    });

    it('should use max()', async function () {
        let query = new QueryExpression()
            .where('Category').equal(8)
            .select(function(x) {
                return {
                    Price: max(x.Price)
                };
            }).from('Products');
        const items = await new MemoryAdapter().executeAsync(query);
        expect(items).toBeTruthy();
        // get items[0]
        const maxPrice = items[0].Price;
        expect(maxPrice).toBeTruthy();

        const rawItems = await new MemoryAdapter().executeAsync(
            new QueryExpression()
                .where('Category').equal(8)
                .select('Price')
                .from('Products')
        );
        const rawPrices = rawItems.map((x) => {
            return x.Price;
        });
        const value = max(rawPrices);
        expect(value).toBe(maxPrice);
    });

    it('should use  a + b', async function () {
        let query = new QueryExpression()
            .where('ProductName').equal('Mozzarella di Giovanni')
            .select(function(x) {
                return {
                    Price: x.Price + 10
                };
            }).from('Products');
        let items = await new MemoryAdapter().executeAsync(query);
        expect(items).toBeTruthy();
        // get items[0]
        const product = items[0];
        expect(product).toBeTruthy();

        query = new QueryExpression()
            .where('ProductName').equal('Mozzarella di Giovanni')
            .select(function(x) {
                return {
                    Price: 10 + x.Price
                };
            }).from('Products');
        items = await new MemoryAdapter().executeAsync(query);
        const product2 = items[0];
        expect(product.Price).toBe(product2.Price);

        const rawItems = await new MemoryAdapter().executeAsync(
            new QueryExpression()
                .where('ProductName').equal('Mozzarella di Giovanni')
                .select('ProductID', 'ProductName', 'Price')
                .from('Products')
        );
        const rawProduct = rawItems[0];
        expect(rawProduct).toBeTruthy();
        expect(rawProduct.Price + 10).toBe(product.Price);

        const addPrice = 10;
        query = new QueryExpression()
            .where('ProductName').equal('Mozzarella di Giovanni')
            .select(function(x) {
                return {
                    Price: addPrice + x.Price
                };
            }, {
                addPrice
            }).from('Products');
        items = await new MemoryAdapter().executeAsync(query);
        expect(items).toBeTruthy();

    });

    it('should binary operators', async function () {

        let query = new QueryExpression()
            .where('ProductName').equal('Mozzarella di Giovanni')
            .select(function(x) {
                return {
                    priceOriginal: x.Price,
                    priceSubtract: x.Price - 10,
                    priceAdd: x.Price + 10,
                    priceMultiply: x.Price * 0.25,
                    priceDivide: x.Price / 2,
                    categoryOriginal: x.Category,
                    categoryModulo: x.Category % 2,
                    categoryBitAnd: x.Category & 2
                };
            }).from('Products');
        let items = await new MemoryAdapter().executeAsync(query);
        expect(items).toBeTruthy();
        let product = items[0];
        expect(product).toBeTruthy();
        expect(product.priceOriginal - 10).toBe(product.priceSubtract);
        expect(product.priceOriginal + 10).toBe(product.priceAdd);
        expect(product.priceOriginal * 0.25).toBe(product.priceMultiply);
        expect(product.priceOriginal / 2).toBe(product.priceDivide);
        expect(product.categoryOriginal % 2).toBe(product.categoryModulo);
        expect(product.categoryOriginal & 2).toBe(product.categoryBitAnd);

        const addPrice = 10;
        const dividePrice = 2;
        const multiplyPrice = 0.25;
        query = new QueryExpression()
            .where('ProductName').equal('Mozzarella di Giovanni')
            .select(function(x) {
                return {
                    priceOriginal: x.Price,
                    priceSubtract: x.Price - addPrice,
                    priceAdd: x.Price + addPrice,
                    priceMultiply: x.Price * multiplyPrice,
                    priceDivide: x.Price / dividePrice,
                };
            }, {
                addPrice,
                dividePrice,
                multiplyPrice
            }).from('Products');
        items = await new MemoryAdapter().executeAsync(query);
        expect(items).toBeTruthy();
        product = items[0];
        expect(product).toBeTruthy();
        expect(product.priceOriginal - 10).toBe(product.priceSubtract);
        expect(product.priceOriginal + 10).toBe(product.priceAdd);
        expect(product.priceOriginal * 0.25).toBe(product.priceMultiply);
        expect(product.priceOriginal / 2).toBe(product.priceDivide);

    });

});
