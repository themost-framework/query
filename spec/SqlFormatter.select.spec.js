// eslint-disable-next-line no-unused-vars
import {QueryEntity, QueryExpression, QueryField} from '../index';
import { QueryValueRef } from '../query';
import {MemoryAdapter} from './test/TestMemoryAdapter';
import Ajv from 'ajv';

// eslint-disable-next-line no-unused-vars
describe('SqlFormatter', () => {

    /**
     * @type {MemoryAdapter}
     */
    let db;
    beforeAll(() => {
        db = new MemoryAdapter({
            name: 'local',
            database: './spec/db/local.db'
        });
    });
    afterAll(async () => {
        if (db) {
            await db.closeAsync();
        }
    })
    it('should format field expression', async () => {
        const Products = new QueryEntity('ProductData');
        const q = new QueryExpression().select(
            new QueryField('id').from(Products),
            new QueryField('name').from(Products)
        ).from(Products).take(25);
        const items = await db.executeAsync(q);
        expect(items.length).toBeTruthy();

        const schema = {
            type: 'object',
            properties: {
                id: {type: 'number'},
                name: {type: 'string'}
            },
            required: ['id', 'name'],
            additionalProperties: false
        };

        const validate = new Ajv().compile(schema);
        items.forEach((item) => expect(validate(item)).toBeTruthy());
    });

    it('should format field with method', async () => {
        const Products = new QueryEntity('ProductData');
        const q = new QueryExpression().select(
            new QueryField('id').from(Products),
            new QueryField({
                description: {
                    $concat: [
                        new QueryField('model').from(Products),
                        ' ',
                        new QueryField('name').from(Products),
                    ]
                }
            })
        ).from(Products).take(25);
        const items = await db.executeAsync(q);
        expect(items.length).toBeTruthy();
        items.forEach((item) => expect(item.description).toBeTruthy());
    });

    it('should format field with constant', async () => {
        const Products = new QueryEntity('ProductData');
        const q = new QueryExpression().select(
            new QueryField('id').from(Products),
            new QueryField({
                status: {
                    $value: 'active'
                }
            })
        ).from(Products).take(25);
        const items = await db.executeAsync(q);
        expect(items.length).toBeTruthy();
        items.forEach((item) => expect(item.status).toBeTruthy());
    });


});