const { QueryField } = require('../query');
const { QueryEntity, QueryExpression } = require('../query');
const { MemoryAdapter } = require('./test/TestMemoryAdapter');

describe('SqlFormatter', () => {

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
    });
    it('should use select statement', async () => {
        let query = new QueryExpression()
            .select('id', 'name', 'category', 'price')
            .from('ProductData')
            .take(25);
        let results = await db.executeAsync(query);
        expect(results.length).toBeTruthy();

        const Products = new QueryEntity('ProductData');
        query = new QueryExpression()
            .select((x) => {
                x.id,
                x.name,
                x.category,
                x.price
            })
            .from(Products)
            .take(25);
        results = await db.executeAsync(query);
        expect(results.length).toBeTruthy();
    });

    it('should use select and join', async () => {
        let query = new QueryExpression()
            .select(new QueryField('id').from('PersonData'), 
                new QueryField('familyName').from('PersonData'), 
                new QueryField('givenName').from('PersonData'),
                new QueryField('addressLocality').from('PostalAddressData'))
            .from('PersonData')
            .leftJoin('PostalAddressData').with(
                new QueryExpression().where(new QueryField('address').from('PersonData'))
                .equal(new QueryField('id').from('PostalAddressData'))
            )
            .take(25);
        let results = await db.executeAsync(query);
        expect(results.length).toBeTruthy();

        const People = new QueryEntity('PersonData');
        const PostalAddresses = new QueryEntity('PostalAddressData').as('address');
        query = new QueryExpression()
            .select((x) => {
                x.id,
                x.familyName,
                x.givenName,
                x.address.addressLocality
            })
            .from(People)
            .leftJoin(PostalAddresses).with((x, y) => {
                return x.address === y.id;
            }).take(25);
        results = await db.executeAsync(query);
        expect(results.length).toBeTruthy();
    });
});