import {SqlFormatter, QueryExpression, QueryField, ObjectNameValidator} from '../src/index';

describe('ObjectNameValidator', () => {
   it('should validate name', () => {
       const validator = new ObjectNameValidator();
       expect(validator.test('field 1', true, false)).toBeFalsy();
       expect(validator.test('space2/**/comment', true, false)).toBeFalsy();
       expect(validator.test('char%20encode', true, false)).toBeFalsy();
       expect(validator.test('field1', true, false)).toBeTruthy();
   });

    it('should escape name', () => {
        const formatter = new SqlFormatter();
        formatter.settings.nameFormat = '`$1`';
        let query = new QueryExpression().select('id', 'familyName', 'givenName')
            .from('PersonData').where('id').equal(100);
        let result = formatter.formatSelect(query);
        expect(result).toBe('SELECT `PersonData`.`id`, `PersonData`.`familyName`, `PersonData`.`givenName` FROM' +
            ' `PersonData` WHERE (`id`=100)');
        query = new QueryExpression().select('id',
            new QueryField('familyName').from('PersonData').as('lastName'),
            'givenName')
            .from('PersonData').where('id').equal(100);
        result = formatter.formatSelect(query);
        expect(result).toBe('SELECT `PersonData`.`id`, `PersonData`.`familyName` AS `lastName`, ' +
            '`PersonData`.`givenName` FROM' +
            ' `PersonData` WHERE (`id`=100)');
    });

    it('should escape name with function', () => {
        const formatter = new SqlFormatter();
        formatter.settings.nameFormat = '`$1`';
        let query = new QueryExpression().select(
            new QueryField().count('id').from('PersonData').as('total')
        ).from('PersonData');
        let result = formatter.formatSelect(query);
        expect(result).toBe('SELECT COUNT(`PersonData`.`id`) AS `total` FROM `PersonData`');
    });

    it('should combine regex', () => {
        const regex1 = new RegExp('(\\w+)');
        const regex2 = new RegExp(`^${regex1.source}((\\.)${regex1.source})*$`);
        expect(regex2.test('field1')).toBeTruthy();
        expect(regex2.test('Table1.field1')).toBeTruthy();
        expect(regex2.test('schema1.Table1.field1')).toBeTruthy();
        expect(regex2.test('Table1.fie%20ld1')).toBeFalsy();
        expect(regex2.test('Tab--le1')).toBeFalsy();
        expect(regex2.test('schema1.Tab%20le1.field1')).toBeFalsy();
    });

    it('should escape object name', () => {
        const validator = new ObjectNameValidator();
        expect(validator.escape('Table1.field1', '`$1`')).toBe('`Table1`.`field1`');
    });

    it('should escape column alias', () => {
        expect(ObjectNameValidator.validator.test('Table1.field1', false, false)).toBeFalsy();
        expect(ObjectNameValidator.validator.test('Table1.field2', false, false)).toBeFalsy();
        expect(ObjectNameValidator.validator.test('field2', false)).toBeTruthy();
        expect(ObjectNameValidator.validator.test('field3', false)).toBeTruthy();
    });

    it('should escape object name with schema', () => {
        const validator = new ObjectNameValidator();
        expect(validator.escape('schema1.Table1.field1', '`$1`')).toBe('`schema1`.`Table1`.`field1`');
        expect(validator.escape('dbo.Table1', '`$1`')).toBe('`dbo`.`Table1`');
    });

});
