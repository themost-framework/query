
const {ClosureParser} = require("../closures");
const {QueryExpression, QueryField} = require("../query");
const {SqlFormatter} = require("../formatter");

describe('ClosureParser', function() {

    it('should use Math.floor()', function () {
        const parser = new ClosureParser();
        let select = parser.parseSelect(function(x) {
            return {
                id: x.id,
                price: Math.floor(x.price)
            };
        });
        expect(select).toBeTruthy();
        let query = Object.assign(new QueryExpression(), {
            $select: {
                "Product": select
            }
        });
        let sql = new SqlFormatter().format(query);
        expect(sql).toBeTruthy();

    });
});
