const { OpenDataParser } = require('../index');
describe('OpenDataParser', () => {

    it('should parser filter', async() => {
        const parser = new OpenDataParser();
        let expr = await parser.parseAsync('id eq 100');
        expect(expr). toEqual({
            id: 100
        });
        expr = await parser.parseAsync('active eq true and category eq \'Laptops\'');
        expect(expr). toEqual({
            $and: [
                { active: true },
                { category: 'Laptops' }
            ]
        });
    });

    it('should parse select statement', async() => {
        const parser = new OpenDataParser();
        let expr = await parser.parseSelectSequenceAsync('id,year(dateCreated) as yearCreated,name,dateCreated');
        expect(expr).toBeTruthy();
        expr = await parser.parseSelectSequenceAsync('id,year(orderedItem/releaseDate) as yearReleased');
        expect(expr).toBeTruthy();
    });

    it('should parser order by statement', async() => {
        const parser = new OpenDataParser();
        let expr = await parser.parseOrderBySequenceAsync('releaseDate desc,name');
        expect(expr).toBeTruthy();
    });

});