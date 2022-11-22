import { QueryEntity, QueryExpression } from '../index';
// eslint-disable-next-line no-unused-vars
import { length, round, max, min, count, avg } from '../index';
import { MemoryAdapter } from './test/TestMemoryAdapter';

describe('QueryExpression.where', () => {

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
    afterAll((done) => {
        if (db) {
            db.close();
            return done();
        }
    });
    it('should use startsWith', async () => {
        const People = new QueryEntity('PersonData');
        let query = new QueryExpression()
            .select((x) => {
                x.id,
                x.familyName,
                x.givenName,
                x.email,
                x.dateCreated
            })
            .from(People)
            .where((x) => {
                return x.familyName.startsWith('Cam') === true;
            });
        let results = await db.executeAsync(query);
        expect(results.length).toBeTruthy();
        results.forEach((item) => {
            expect(item.familyName.startsWith('Cam')).toBeTruthy();
        });

        query = new QueryExpression()
            .select((x) => {
                x.id,
                x.familyName,
                x.givenName,
                x.email,
                x.dateCreated
            })
            .from(People)
            .where((x) => {
                return x.familyName.startsWith('A') === false;
            }).take(10);
        results = await db.executeAsync(query);
        expect(results.length).toBeTruthy();
        results.forEach((item) => {
            expect(item.familyName.startsWith('A')).toBeFalsy();
        });
    });

    it('should use endsWith', async () => {
        const People = new QueryEntity('PersonData');
        let query = new QueryExpression()
            .select((x) => {
                x.id,
                x.familyName,
                x.givenName,
                x.email,
                x.dateCreated
            })
            .from(People)
            .where((x) => {
                return x.familyName.endsWith('er') === true;
            });
        let results = await db.executeAsync(query);
        expect(results.length).toBeTruthy();
        results.forEach((item) => {
            expect(item.familyName.endsWith('er')).toBeTruthy();
        });
    });

    it('should use includes', async () => {
        const People = new QueryEntity('PersonData');
        let query = new QueryExpression()
            .select((x) => {
                x.id,
                x.familyName,
                x.givenName,
                x.email,
                x.dateCreated
            })
            .from(People)
            .where((x) => {
                return x.givenName.includes('Chris') === true;
            });
        let results = await db.executeAsync(query);
        expect(results.length).toBeTruthy();
        results.forEach((item) => {
            expect(item.givenName.includes('Chris')).toBeTruthy();
        });
    });

    it('should use toUpperCase', async () => {
        const People = new QueryEntity('PersonData');
        let query = new QueryExpression()
            .select((x) => {
                return {
                    id: x.id,
                    familyName: x.familyName,
                    givenName1: x.givenName.toUpperCase(),
                    givenName: x.givenName
                }
            })
            .from(People)
            .where((x) => {
                return x.givenName.toUpperCase() === 'CHRISTOPHER';
            });
        let results = await db.executeAsync(query);
        expect(results.length).toBeTruthy();
        results.forEach((item) => {
            expect(item.givenName1).toBe('CHRISTOPHER');
        });
    });

    it('should use substr', async () => {
        const People = new QueryEntity('PersonData');
        let query = new QueryExpression()
            .select((x) => {
                return {
                    id: x.id,
                    familyName: x.familyName,
                    givenName1: x.givenName.substr(0,4),
                    givenName: x.givenName
                }
            })
            .from(People)
            .where((x) => {
                return x.givenName.substr(0,4) === 'Chri';
            });
        let results = await db.executeAsync(query);
        expect(results.length).toBeTruthy();
        results.forEach((item) => {
            expect(item.givenName1).toBe('Chri');
        });
    });

    it('should use concat', async () => {
        const People = new QueryEntity('PersonData');
        let query = new QueryExpression()
            .select((x) => {
                return {
                    id: x.id,
                    familyName: x.familyName,
                    givenName: x.givenName,
                    name: x.givenName.concat(' ', x.familyName)
                }
            })
            .from(People)
            .where((x) => {
                return x.givenName.indexOf('Chri') >= 0;
            });
        let results = await db.executeAsync(query);
        expect(results.length).toBeTruthy();
        results.forEach((item) => {
            expect(item.givenName.concat(' ', item.familyName)).toBe(item.name);
        });
    });
});