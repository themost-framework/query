const { OpenDataParser, SqlFormatter } = require('../index');
const {trim} = require('lodash');
const { QueryExpression, QueryEntity } = require('../query');
const { QueryField } = require('../query');
const { AnyExpressionFormatter } = require('../expressions');
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
        parser.resolveMember = function(identifier, callback) {
            return callback(null, identifier.replace('/', '.'));
        }
        expr = await parser.parseSelectSequenceAsync('id,year(orderedItem/releaseDate) as yearReleased');
        expect(expr).toBeTruthy();
        let select =Object.assign( new QueryExpression(), {
            $select: {
                'Order': new AnyExpressionFormatter().formatMany(expr)
            }
        });
        select.join(new QueryEntity('Product').as('orderedItem')).with(
            new QueryExpression().where(new QueryField('product'))
                .equal(new QueryField('id').from('orderedItem'))
        );
        let formatter = new SqlFormatter();
        let selectSql = formatter.formatSelect(select);
        expect(selectSql).toBeTruthy();

        expr = await parser.parseSelectSequenceAsync('id,indexof(name, \'Samsung\') as index1');
        expect(expr).toBeTruthy();
    });

    it('should parse group by statement', async() => {
        const parser = new OpenDataParser();
        let expr = await parser.parseGroupBySequenceAsync('year(dateCreated),month(dateCreated),day(dateCreated)');
        expect(expr).toBeTruthy();
        let groupBy =new AnyExpressionFormatter().formatMany(expr);
        let formatter = new SqlFormatter();
        let groupBySql = formatter.formatGroupBy(groupBy);
        expect(trim(groupBySql)).toBe('GROUP BY YEAR(dateCreated), MONTH(dateCreated), DAY(dateCreated)');
    });

    it('should parser order by statement', async() => {
        const parser = new OpenDataParser();
        let expr = await parser.parseOrderBySequenceAsync('releaseDate desc,name');
        let orderBy = new AnyExpressionFormatter().formatMany(expr);
        let formatter = new SqlFormatter();
        let orderBySql = formatter.formatOrder(orderBy);
        expect(trim(orderBySql)).toBe('ORDER BY releaseDate DESC, name ASC');
        expr = await parser.parseOrderBySequenceAsync('year(releaseDate) desc,month(releaseDate) desc');
        formatter = new SqlFormatter();
        orderBy = new AnyExpressionFormatter().formatMany(expr);
        orderBySql = formatter.formatOrder(orderBy);
        expect(trim(orderBySql)).toBe('ORDER BY YEAR(releaseDate) DESC, MONTH(releaseDate) DESC');
    });

    it('should parse expand statement', async() => {
        const parser = new OpenDataParser();
        expect(parser.parseExpandSequence(
            'customer($select=id,name;$expand=address),orderedItem'
            )).toEqual([
            {
                name: 'customer',
                options: {
                    $select: 'id,name',
                    $expand: 'address'
                }
            },
            {
                name: 'orderedItem'
            }
        ]);
    });

    it('should parse expand statement with select', async() => {
        const parser = new OpenDataParser();
        expect(parser.parseExpandSequence(
            'customer($select=id,name,year(dateCreated) as dateCreated;$expand=address),orderedItem'
            )).toEqual([
            {
                name: 'customer',
                options: {
                    $select: 'id,name,year(dateCreated) as dateCreated',
                    $expand: 'address'
                }
            },
            {
                name: 'orderedItem'
            }
        ]);
    });

    it('should parse expand statement with another expand', async() => {
        const parser = new OpenDataParser();
        const expr = parser.parseExpandSequence(
            'customer($expand=address($expand=location)),orderedItem'
        );
        expect(expr).toEqual([
            {
                name: 'customer',
                options: {
                    $expand: 'address($expand=location)'
                }
            },
            {
                name: 'orderedItem'
            }
        ]);
    });

});