
var ClosureParser = require("../closures").ClosureParser;
var QueryExpression = require("../query").QueryExpression;
var QueryField = require("../query").QueryField;
var SqlFormatter = require("../formatter").SqlFormatter;

describe('ClosureParser', function() {

    it('should use Math.floor()', function () {
        var parser = new ClosureParser();
        var select = parser.parseSelect(function(x) {
            return {
                id: x.id,
                price: Math.floor(x.price)
            };
        });
        expect(select).toBeTruthy();
        // expect(select).toEqual([
        //     {
        //         "id": "id"
        //     },
        //     {
        //         "price": {
        //             "$floor": [
        //                 {
        //                     "$name": "price"
        //                 }
        //             ]
        //         }
        //     }
        // ]);

        var query = new QueryExpression().select(
            new QueryField('id').as('id'),
            QueryField.floor('price').as('price'),
            QueryField.year('dateCreated').as('yearCreated')
        ).from('Product');

        console.log(JSON.stringify(query, null, 4));
        var sql = new SqlFormatter().format(query);
        expect(sql).toBeTruthy();

        query = Object.assign(new QueryExpression(), {
            $select: {
                "Product": select
            }
        });
        sql = new SqlFormatter().format(query);
        expect(sql).toBeTruthy();

    });
});
