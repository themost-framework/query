import { SqlFormatter, SimpleOpenDataParser } from '../index';
import { trim } from 'lodash';
import { QueryExpression, QueryEntity } from '../index';
import { QueryField } from '../index';
import { AnyExpressionFormatter } from '../index';
describe('SimpleOpenDataParser', () => {

    it('should parser filter', async() => {
        const parser = new SimpleOpenDataParser();
        let expr = parser.parseSync('id eq 100');
        expect(expr). toEqual({
            $eq: [
                { $name: 'id' },
                100
            ]
        });
        expr = parser.parseSync('active eq true and category eq \'Laptops\'');
        expect(expr).toEqual({
            $and: [
                {
                    $eq: [
                        { $name: 'active' },
                        true
                    ]
                },
                {
                    $eq: [
                        { $name: 'category' },
                        'Laptops'
                    ]
                }
            ]
        });
    });

    it('should parser filter with custom function', async() => {
        const parser = new SimpleOpenDataParser();
        let expr = parser.parseSync('createdBy eq me()');
        expect(expr). toEqual({
            $eq: [
                { $name: 'createdBy' },
                { $me: [] }
            ]
        });
    });

    it('should parse select statement', async() => {
        const parser = new SimpleOpenDataParser();
        let expr = parser.parseSelectSequenceSync('id,year(dateCreated) as yearCreated,name,dateCreated');
        expect(expr).toBeTruthy();
        parser.resolvingMember.subscribe((event) => {
            event.member = event.member.replace('/', '.');
        });
        expr = parser.parseSelectSequenceSync('id,year(dateCreated) as yearDateCreated,year(orderedItem/releaseDate) as yearReleased');
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

        expr = parser.parseSelectSequenceSync('id,indexof(name, \'Samsung\') as index1');
        expect(expr).toBeTruthy();
    });

    it('should parse group by statement', async() => {
        const parser = new SimpleOpenDataParser();
        let expr = parser.parseGroupBySequenceSync('year(dateCreated),month(dateCreated),day(dateCreated)');
        expect(expr).toBeTruthy();
        let groupBy =new AnyExpressionFormatter().formatMany(expr);
        let formatter = new SqlFormatter();
        let groupBySql = formatter.formatGroupBy(groupBy);
        expect(trim(groupBySql)).toBe('GROUP BY YEAR(dateCreated), MONTH(dateCreated), DAY(dateCreated)');
    });

    it('should parser order by statement', async() => {
        const parser = new SimpleOpenDataParser();
        let expr = parser.parseOrderBySequenceSync('releaseDate desc,name');
        let orderBy = new AnyExpressionFormatter().formatMany(expr);
        let formatter = new SqlFormatter();
        let orderBySql = formatter.formatOrder(orderBy);
        expect(trim(orderBySql)).toBe('ORDER BY releaseDate DESC, name ASC');
        expr = parser.parseOrderBySequenceSync('year(releaseDate) desc,month(releaseDate) desc');
        formatter = new SqlFormatter();
        orderBy = new AnyExpressionFormatter().formatMany(expr);
        orderBySql = formatter.formatOrder(orderBy);
        expect(trim(orderBySql)).toBe('ORDER BY YEAR(releaseDate) DESC, MONTH(releaseDate) DESC');
    });

    it('should parse expand statement', async() => {
        const parser = new SimpleOpenDataParser();
        const expr = parser.parseExpandSequenceSync(
            'customer($select=id,name;$expand=address),orderedItem'
        );
        expect(expr).toEqual([
            {
                name: 'customer',
                options: {
                    $select: 'id,name',
                    $expand: 'address'
                },
                source: 'customer($select=id,name;$expand=address)'
            },
            {
                name: 'orderedItem',
                source: 'orderedItem'
            }
        ]);
    });

    it('should parse expand statement with select', async() => {
        const parser = new SimpleOpenDataParser();
        const expr = parser.parseExpandSequenceSync(
            'customer($select=id,name,year(dateCreated) as dateCreated;$expand=address),orderedItem'
        );
        expect(expr).toEqual([
            {
                name: 'customer',
                options: {
                    $select: 'id,name,year(dateCreated) as dateCreated',
                    $expand: 'address'
                },
                source: 'customer($select=id,name,year(dateCreated) as dateCreated;$expand=address)'
            },
            {
                name: 'orderedItem',
                source: 'orderedItem'
            }
        ]);
    });

    it('should parse expand statement with another expand', async() => {
        const parser = new SimpleOpenDataParser();
        const expr = parser.parseExpandSequenceSync(
            'customer($expand=address($expand=location)),orderedItem'
        );
        expect(expr).toEqual([
            {
                name: 'customer',
                options: {
                    $expand: 'address($expand=location)'
                },
                source: 'customer($expand=address($expand=location))'
            },
            {
                name: 'orderedItem',
                source: 'orderedItem'
            }
        ]);
    });

    it('should parse expand statement with filter', async() => {
        const parser = new SimpleOpenDataParser();
        const expr = parser.parseExpandSequenceSync(
            'orders($filter=orderStatus/alternateName eq \'OrderStatusDelivered\';$top=10;$orderby=orderDate desc)'
        );
        expect(expr).toEqual([
            {
                name: 'orders',
                options: {
                    $filter: 'orderStatus/alternateName eq \'OrderStatusDelivered\'',
                    $top: 10,
                    $orderby: 'orderDate desc'
                },
                source: 'orders($filter=orderStatus/alternateName eq \'OrderStatusDelivered\';$top=10;$orderby=orderDate desc)'
            }
        ]);
    });

});