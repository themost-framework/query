import {SqlFormatter, QueryExpression, ObjectNameValidator, QueryEntity, QueryField} from '../src/index';

const TRIM_QUALIFIED_NAME_REGEXP = /^(\w+)((\.(\w+))+)/;
const TRIM_SAME_ALIAS_REGEXP = /^(.*)\sAS\s(.*)$/;

class SimpleSqlFormatter extends SqlFormatter {
    // _validator = new SimpleObjectNameValidator();
    constructor(options) {
        super();
        this.settings = Object.assign({
            nameFormat: '$1',
            forceAlias: false
        }, options);
    }
    // get validator() {
    //     return this._validator;
    // }

    /**
     * @param {*} name
     * @returns {string}
     */
    escapeName(name) {
        if (typeof name === 'object' && Object.prototype.hasOwnProperty.call(name, '$name')) {
            return this.escapeName(name.$name);
        }
        if (typeof name !== 'string') {
            throw new Error('Invalid name expression. Expected string.');
        }
        const matches = TRIM_QUALIFIED_NAME_REGEXP.exec(name);
        if (matches) {
            return this.escapeName(matches[matches.length - 1]);
        }
        return super.escapeName(name);
    }

    escapeEntity(name) {
        return super.escapeEntity(name);
    }

    formatFieldEx(field, format) {
        if (Object.prototype.hasOwnProperty.call(field, '$name')) {
            const { $name: name } = field;
            const matches = TRIM_QUALIFIED_NAME_REGEXP.exec(name);
            if (matches) {
                return this.escapeName(matches[matches.length - 1]);
            }
        }
        const result = super.formatFieldEx(field, format);
        const matches = TRIM_SAME_ALIAS_REGEXP.exec(result);
        if (matches && matches[1] === matches[2]) {
            return matches[1];
        }
        return result;
    }
}


describe('SimpleQueryFormatter', () => {
    const onValidateName = (event) => {
        // validate database object name by allowing qualified names e.g. dbo.Products
        event.valid = ObjectNameValidator.validator.test(event.name, true);
    };
    beforeAll(() => {
        ObjectNameValidator.validator.validating.subscribe(onValidateName);
    });
    afterAll(() => {
        //
        ObjectNameValidator.validator.validating.unsubscribe(onValidateName);
    });
    it('should create a simple select expression', () => {
        const query = new QueryExpression().select('id', 'name', 'category').from('ProductData');
        const formatter = new SimpleSqlFormatter();
        const sql = formatter.formatSelect(query);
        expect(sql).toBe('SELECT id, name, category FROM ProductData');
    });
    it('should select from table with qualified name', () => {

        const query = new QueryExpression().select('id', 'name', 'category').from('dbo.ProductData');
        const formatter = new SimpleSqlFormatter();
        const sql = formatter.formatSelect(query);
        expect(sql).toBe('SELECT id, name, category FROM dbo.ProductData');
    });

    it('should select from entity with qualified name', () => {

        let query = new QueryExpression().select('id', 'name', 'category').from(new QueryEntity('dbo.ProductData'));
        const formatter = new SimpleSqlFormatter();
        let sql = formatter.formatSelect(query);
        expect(sql).toBe('SELECT id, name, category FROM dbo.ProductData');
        query = new QueryExpression().select(
            new QueryField('id'),
            new QueryField('name'),
            new QueryField('category')
        ).from(new QueryEntity('dbo.ProductData'));
        sql = formatter.formatSelect(query);
        expect(sql).toBe('SELECT id, name, category FROM dbo.ProductData');

    });

    it('should select by using query fields', () => {
        const formatter = new SimpleSqlFormatter();
        const query = new QueryExpression().select(
            new QueryField('id'),
            new QueryField('name'),
            new QueryField('category')
        ).from(new QueryEntity('dbo.ProductData'));
        const sql = formatter.formatSelect(query);
        expect(sql).toBe('SELECT id, name, category FROM dbo.ProductData');
    });

    it('should select by using closures', () => {
        const formatter = new SimpleSqlFormatter();
        const Products = new QueryEntity('dbo.Products');
        const query = new QueryExpression().select(({id, name, category}) => {
            return {id, name, category};
        }).from(Products);
        const sql = formatter.formatSelect(query);
        expect(sql).toBe('SELECT id, name, category FROM dbo.Products');
    });
});
