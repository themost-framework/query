
const {ClosureParser} = require("../closures");
const {QueryExpression} = require("../query");
const Products = require('./test/config/models/Product.json');
const {migrateAsync} = require('./test/TestMemoryDatabase');
const {MemoryAdapter} = require('./test/TestMemoryAdapter');

/**
 * @class Product
 * @property {number} Product#ProductID
 * @property {number} Product#ProductName
 * @property {number} Product#Price
 */

// closure parser test
describe('ClosureParser', function() {

    beforeAll(async ()=> {
        await migrateAsync(Products);
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
});
