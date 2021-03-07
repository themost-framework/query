import { TestAdapter } from './adapter/TestAdapter';
import { ClosureParser } from '../closures';
import { promisify } from 'util';
import { initDatabase } from './adapter/TestDatabase';
import { QueryExpression } from '../index';
describe('ClosureParser', () => {

    beforeAll((done) => {
        initDatabase().then(() => {
            return done();
        })
    });

    it('should create instance', () => {
        const parser = new ClosureParser();
        expect(parser).toBeTruthy();
    });

    it('should parse filter', async () => {
        const parser = new ClosureParser();
        const parserFilterAsync = promisify(parser.parseFilter.bind(parser));
        let query = await parserFilterAsync((x: { CustomerID: number; }) => {
            return x.CustomerID === 78;
        });
        expect(query).toBeTruthy();
        expect(query).toEqual({
                "CustomerID": 78
            });
    });

    it('should parse select', async () => {
        const parser = new ClosureParser();
        const parserSelectAsync = promisify(parser.parseSelect.bind(parser));
        let query = await parserSelectAsync((x: { ProductID: any; ProductName: any; Unit: any; Price: any; }) => {
            x.ProductID,
            x.ProductName,
            x.Unit,
            x.Price
        }, null);
        expect(query).toBeTruthy();
    });
});