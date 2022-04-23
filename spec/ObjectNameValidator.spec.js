import {ObjectNameValidator} from '../object-name.validator';
import {SqlFormatter, QueryExpression, QueryField} from '../index';

describe('ObjectNameValidator', () => {
   it('should validate name', () => {
       const validator = new ObjectNameValidator();
       expect(validator.test('field 1', false)).toBeFalse();
       expect(validator.test('space2/**/comment', false)).toBeFalse();
       expect(validator.test('char%20encode', false)).toBeFalse();
       expect(validator.test('field1', false)).toBeTrue();
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
        const regex1 = new RegExp('([a-zA-Z0-9_]+)');
        const regex2 = new RegExp(`^${regex1.source}((\.)${regex1.source})?$`);
        expect(regex2.test('Table1.field1')).toBeTrue();
        expect(regex2.test('schema1.Table1.field1')).toBeFalse();
        expect(regex2.test('Table1.fie%20ld1')).toBeFalse();
        expect(regex2.test('Tab--le1')).toBeFalse();
        expect(regex2.test('schema1.Tab%20le1.field1')).toBeFalse();
    });

});
