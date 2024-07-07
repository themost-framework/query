import { LiteralExpression, MemberExpression, MethodCallExpression, QueryEntity, QueryExpression, QueryField } from '../src/index';
import { MemoryAdapter } from './test/TestMemoryAdapter';
import { MemoryFormatter } from './test/TestMemoryFormatter';

describe('ResolvingMember', () => {

    /**
     * @type {MemoryAdapter}
     */
    let db;
    beforeAll(() => {
        db = new MemoryAdapter();
    });
    afterAll(async () => {
        if (db) {
            await db.closeAsync();
        }
    });
    
    it('should resolve custom member', async () => {
        const orders = new QueryEntity('OrderData');
        const people = new QueryEntity('PersonData');
        const q = new QueryExpression();
        q.resolvingMember.subscribe((event) => {
            if (typeof event.member === 'string') {
                const member = event.member.split('.');
                const [,field] = member;
                if (field === 'orderCustomer') {
                    event.member = new MethodCallExpression('concat', [
                        new QueryField('givenName').from(people),
                        new LiteralExpression(' '),
                        new QueryField('familyName').from(people),
                    ])
                }
            }
        })
        q.select(
            ({id, orderCustomer}) => {
                return {
                    id,
                    orderCustomer
                }
            }
        ).from(orders)
        .join(people).with((x, {id}) => x.customer === id, people)
        .orderBy(
            ({customer}) => customer
        ).take(10);
        const items = await db.executeAsync(q);
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            expect(item.orderCustomer).toBeTruthy();
        }
    });

});