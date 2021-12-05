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

});