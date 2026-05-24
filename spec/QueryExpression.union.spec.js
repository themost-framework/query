import {QueryEntity, QueryExpression, QueryField} from '../src/index';
import { MemoryAdapter } from './test/TestMemoryAdapter';

describe('QueryExpression.union', () => {

    /**
     * @type {MemoryAdapter}
     */
    let db;
    beforeAll(() => {
        db = new MemoryAdapter();
    });
    afterAll(async() => {
        if (db) {
            await db.closeAsync();
        }
    });
    it('should use union expression', async () => {
        const Users = new QueryEntity('UserData');
        const Groups = new QueryEntity('GroupData');
        const query = new QueryExpression()
            .select(
                new QueryField('name'),
                new QueryField({ // constant value as field expression
                    'type': {
                        $value: 'user'
                    }
                })
            ).from(Users)
            .union(
                new QueryExpression().select(
                    new QueryField('name'),
                    new QueryField({ // constant value as field expression
                        'type': {
                            $value: 'group'
                        }
                    })
                ).from(Groups)
            )
        let results = await db.executeAsync(query, []);
        expect(results.length).toBeTruthy();
        // find user
        let found = results.find(({name}) => name === 'alexis.rees@example.com');
        expect(found).toBeTruthy();
        found = results.find(({name}) => name === 'Administrators');
        expect(found).toBeTruthy();
        expect(found.type).toBe('group');
    });

    it('should use union expression with limit select', async () => {
        const Users = new QueryEntity('UserData');
        const Groups = new QueryEntity('GroupData');
        const unionQuery = new QueryExpression()
            .select(
                new QueryField('name'),
                new QueryField({ // constant value as field expression
                    'type': {
                        $value: 'user'
                    }
                })
            ).from(Users)
            .union(
                new QueryExpression().select(
                    { // select fields as native objects
                        name: '$name'
                    },
                    { // constant value as field expression
                        'type': {
                            $value: {
                                $toString: [
                                    'group'
                                ]
                            }
                        }
                    }
                ).from(Groups)
            )
        let results = await db.executeAsync(new QueryExpression().select(
            'name', 'type'
        ).from(unionQuery.as('userAndGroups')).take(10) , []);
        expect(results.length).toEqual(10);
        // find user
        let found = results.find(({name}) => name === 'alexis.rees@example.com');
        expect(found).toBeTruthy();
        found = results.find(({name}) => name === 'Administrators');
        expect(found).toBeTruthy();
        expect(found.type).toBe('group');
    });

    it('should use union expression with order by', async () => {
        const Users = new QueryEntity('UserData');
        const Groups = new QueryEntity('GroupData');
        const unionQuery = new QueryExpression()
            .select(
                new QueryField('name'),
                new QueryField({ // constant value as field expression
                    'type': {
                        $value: 'user'
                    }
                }),
                new QueryField('dateModified').as('dateLastModified'),
            ).from(Users)
            .union(
                new QueryExpression().select(
                    { // select fields as native objects
                        name: '$name'
                    },
                    { // constant value as field expression
                        'type': {
                            $value: {
                                $toString: [
                                    'group'
                                ]
                            }
                        }
                    },
                    {
                        'dateLastModified': '$dateModified'
                    }
                ).from(Groups)
            )
        let results = await db.executeAsync(new QueryExpression().select(
            'name', 'type', 'dateLastModified'
        ).from(unionQuery.as('userAndGroups')).take(10).orderBy('dateLastModified') , []);
        expect(results.length).toEqual(10);
        // find user
        let found = results.find(({name}) => name === 'alexis.rees@example.com');
        expect(found).toBeTruthy();
        found = results.find(({name}) => name === 'Administrators');
        expect(found).toBeTruthy();
        expect(found.type).toBe('group');
    });

});