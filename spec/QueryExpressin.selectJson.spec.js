// noinspection SpellCheckingInspection

import {MemberExpression, MethodCallExpression} from '../index';
import { QueryEntity, QueryExpression } from '../index';
import { SqliteFormatter } from '@themost/sqlite';
import { MemoryAdapter } from './test/TestMemoryAdapter';
import { MemoryFormatter } from './test/TestMemoryFormatter';
import SimpleOrderSchema from './test/config/models/SimpleOrder.json';

if (typeof SqliteFormatter.prototype.$jsonGet !== 'function') {
    SqliteFormatter.prototype.$jsonGet = function(expr) {
        if (typeof expr.$name !== 'string') {
            throw new Error('Invalid json expression. Expected a string');
        }
        const parts = expr.$name.split('.');
        const extract = this.escapeName(parts.splice(0, 2).join('.'));
        return `json_extract(${extract}, '$.${parts.join('.')}')`;
    };
    SqliteFormatter.prototype.$jsonArray = function(expr) {
        return `json_each(${this.escapeName(expr)})`;
    }
    // const superEscape = SqlUtils.escape;
    // SqlUtils.escape = function(value) {
    //     if (isObjectDeep(value)) {
    //         return `'${JSON.stringify(value)}'`;
    //     } else {
    //         const args =  Array.from(arguments)
    //         return superEscape.apply(null, args);
    //     }
    // }
}

/**
 * @param { MemoryAdapter } db
 * @returns {Promise<void>}
 */
async function createSimpleOrders(db) {
    const { source } = SimpleOrderSchema;
    const exists = await db.table(source).existsAsync();
    if (!exists) {
        await db.table(source).createAsync(SimpleOrderSchema.fields);
    }
    // get some orders
    const orders = await db.executeAsync(
        new QueryExpression().from('OrderBase').select(
            ({orderDate, discount, discountCode, orderNumber, paymentDue,
                 dateCreated, dateModified, createdBy, modifiedBy,
                 orderStatus, orderedItem, paymentMethod, customer}) => {
                return { orderDate, discount, discountCode, orderNumber, paymentDue,
                    dateCreated, dateModified, createdBy, modifiedBy,
                    orderStatus, orderedItem, paymentMethod, customer};
            })
            .orderByDescending((x) => x.orderDate).take(10), []
    );
    const paymentMethods = await db.executeAsync(
        new QueryExpression().from('PaymentMethodBase').select(
            ({id, name, alternateName, description}) => {
                return { id, name, alternateName, description };
            }), []
    );
    const orderStatusTypes = await db.executeAsync(
        new QueryExpression().from('OrderStatusTypeBase').select(
            ({id, name, alternateName, description}) => {
                return { id, name, alternateName, description };
            }), []
    );
    const orderedItems = await db.executeAsync(
        new QueryExpression().from('ProductData').select(
            ({id, name, category, model, releaseDate, price}) => {
                return { id, name, category, model, releaseDate, price };
            }), []
    );
    const customers = await db.executeAsync(
        new QueryExpression().from('PersonData').select(
            ({id, familyName, givenName, jobTitle, email, description, address}) => {
                return { id, familyName, givenName, jobTitle, email, description, address };
            }), []
    );
    const postalAddresses = await db.executeAsync(
        new QueryExpression().from('PostalAddressData').select(
            ({id, streetAddress, postalCode, addressLocality, addressCountry, telephone}) => {
                return {id, streetAddress, postalCode, addressLocality, addressCountry, telephone };
            }), []
    );
    // get
    const items = orders.map((order) => {
        const { orderDate, discount, discountCode, orderNumber, paymentDue,
            dateCreated, dateModified, createdBy, modifiedBy } = order;
        const orderStatus = orderStatusTypes.find((x) => x.id === order.orderStatus);
        const orderedItem = orderedItems.find((x) => x.id === order.orderedItem);
        const paymentMethod = paymentMethods.find((x) => x.id === order.paymentMethod);
        const customer = customers.find((x) => x.id === order.customer);
        if (customer) {
            customer.address = postalAddresses.find((x) => x.id === customer.address);
            delete customer.address?.id;
        }
        return {
            orderDate,
            discount,
            discountCode,
            orderNumber,
            paymentDue,
            orderStatus,
            orderedItem,
            paymentMethod,
            customer,
            dateCreated,
            dateModified,
            createdBy,
            modifiedBy
        }
    });
    for (const item of items) {
        await db.executeAsync(new QueryExpression().insert(item).into(source), []);
    }
}

function onResolvingJsonMember(event) {
    let member = event.fullyQualifiedMember.split('.');
    const field = SimpleOrderSchema.fields.find((x) => x.name === member[0]);
    if (field == null) {
        return;
    }
    if (field.type !== 'Json') {
        return;
    }
    event.object = event.target.$collection;
    event.member = new MethodCallExpression('jsonGet', [
        new MemberExpression(event.target.$collection + '.' + event.fullyQualifiedMember)
    ]);
}

function onResolvingJsonEachQualifiedMember(event) {
    if (typeof event.member !== 'string') {
        return;
    }
    const fullyQualifiedMember = event.fullyQualifiedMember.split('.');
    const [member] = fullyQualifiedMember;
    const query = event.target;
    const joins = Array.isArray(query.$expand) ? query.$expand : (query.$expand ? [
        query.$expand
    ] : []);
    const join = joins.find((x) => {
        return x.$as === member;
    });
    if (join && Object.prototype.hasOwnProperty.call(join.$entity, '$jsonEach')) {
        event.object = member;
        fullyQualifiedMember.splice(1,0, 'value');
        // noinspection JSValidateTypes
        event.member = new MethodCallExpression('jsonGet', [
            new MemberExpression(fullyQualifiedMember.join('.'))
        ]);
    }
}

function onResolvingJsonEachMember(event) {
    if (typeof event.member !== 'string') {
        return;
    }
    const fullyQualifiedMember = event.member.split('.');
    const [,member] = fullyQualifiedMember;
    const query = event.target;
    const joins = Array.isArray(query.$expand) ? query.$expand : (query.$expand ? [
        query.$expand
    ] : []);
    const join = joins.find((x) => {
        return x.$as === member;
    });

    if (join && Object.prototype.hasOwnProperty.call(join.$entity, '$jsonEach')) {
        event.object = member;
        // noinspection JSValidateTypes
        event.member = new MemberExpression([
            member,
            'value'
        ].join('.'));
    }
}

describe('SqlFormatter', () => {

    /**
     * @type {MemoryAdapter}
     */
    let db;
    beforeAll(() => {return new Promise(done => {
        MemoryAdapter.create({
            name: 'local',
            database: './spec/db/local.db',
            logLevel: 'debug'
        }).then((adapter) => {
            db = adapter;
            return done();
        }).catch((err) => {
            return done(err);
        });
    })});
    afterAll(() => {return new Promise(done => {
        if (db) {
            return db.close(() => {
                return MemoryAdapter.drop(db).then(() => {
                    return done();
                });
            });
        }
        return done();
    })});

    it('should select json field', async () => {
        await createSimpleOrders(db);
        const Orders = new QueryEntity('SimpleOrders');
        const query = new QueryExpression();
        query.resolvingJoinMember.subscribe(onResolvingJsonMember);
        query.select((x) => {
            // noinspection JSUnresolvedReference
            return {
                id: x.id,
                customer: x.customer.description
            }
        })
            .from(Orders);
        const formatter = new MemoryFormatter();
        const sql = formatter.format(query);
        expect(sql).toEqual('SELECT `SimpleOrders`.`id` AS `id`, json_extract(`SimpleOrders`.`customer`, \'$.description\') AS `customer` FROM `SimpleOrders`');
        /**
         * @type {Array<{id: number, customer: string}>}
         */
        const results = await db.executeAsync(sql, []);
        expect(results).toBeTruthy();
        for (const result of results) {
            expect(result).toBeTruthy();
            expect(result.id).toBeTruthy();
            expect(result.customer).toBeTruthy();
        }
    });

    it('should select nested json field', async () => {
        await createSimpleOrders(db);
        const Orders = new QueryEntity('SimpleOrders');
        const query = new QueryExpression();
        query.resolvingJoinMember.subscribe(onResolvingJsonMember);
        query.select((x) => {
            // noinspection JSUnresolvedReference
            return {
                id: x.id,
                customer: x.customer.description,
                address: x.customer.address.streetAddress
            }
        })
            .from(Orders);
        const formatter = new MemoryFormatter();
        const sql = formatter.format(query);
        expect(sql).toEqual('SELECT `SimpleOrders`.`id` AS `id`, ' +
            'json_extract(`SimpleOrders`.`customer`, \'$.description\') AS `customer`, ' +
            'json_extract(`SimpleOrders`.`customer`, \'$.address.streetAddress\') AS `address` ' +
            'FROM `SimpleOrders`');
        /**
         * @type {Array<{id: number, customer: string}>}
         */
        const results = await db.executeAsync(sql, []);
        expect(results).toBeTruthy();
        for (const result of results) {
            expect(result).toBeTruthy();
            expect(result.id).toBeTruthy();
            expect(result.customer).toBeTruthy();
        }
    });

    it('should select nested json field with method', async () => {
        await createSimpleOrders(db);
        const Orders = new QueryEntity('SimpleOrders');
        const query = new QueryExpression();
        query.resolvingJoinMember.subscribe(onResolvingJsonMember);
        query.select((x) => {
            // noinspection JSUnresolvedReference
            return {
                id: x.id,
                customer: x.customer.description,
                releaseYear: x.orderedItem.releaseDate.getFullYear()
            }
        })
            .from(Orders);
        const formatter = new MemoryFormatter();
        const sql = formatter.format(query);
        /**
         * @type {Array<{id: number, customer: string, releaseYear: number}>}
         */
        const results = await db.executeAsync(sql, []);
        expect(results).toBeTruthy();
        for (const result of results) {
            expect(result).toBeTruthy();
            expect(result.releaseYear).toBeTruthy();
        }
    });

    it('should select json object', async () => {
        await createSimpleOrders(db);
        const Orders = new QueryEntity('SimpleOrders');
        const query = new QueryExpression();
        query.resolvingJoinMember.subscribe(onResolvingJsonMember);
        query.select((x) => {
            // noinspection JSUnresolvedReference
            return {
                id: x.id,
                customer: x.customer,
                orderedItem: x.orderedItem
            }
        })
            .from(Orders);
        const formatter = new MemoryFormatter();
        const sql = formatter.format(query);
        /**
         * @type {Array<{id: number, customer: string, releaseYear: number}>}
         */
        const results = await db.executeAsync(sql, []);
        expect(results).toBeTruthy();
        for (const result of results) {
            if (typeof result.customer === 'string') {
                const customer = JSON.parse(result.customer);
                expect(customer).toBeTruthy();
            }
        }
    });

    it('should use json each with filter', async () => {
        const Users = new QueryEntity('Users');
        const userGroup = {
            $jsonEach: [
                '$Users.groups'
            ]
        };
        const query = new QueryExpression();
        query.resolvingJoinMember.subscribe(onResolvingJsonEachQualifiedMember);
        query.select(
            (x) => {
                return {
                    id: x.id,
                    username: x.username,
                    email: x.email,
                    groups: x.groups,
                }
            }
        ).from(Users).leftJoin({
            userGroup
        }).with(false).where((x) => {
            // noinspection JSUnresolvedReference
            return x.userGroup.group_name === 'Administrators';
        });

        const formatter = new MemoryFormatter();
        const sql = formatter.format(query);
        const results = await db.executeAsync(sql, []);
        expect(results).toBeTruthy();
        expect(results.length).toEqual(2);
    });

    it('should use json each with join expression', async () => {
        const Users = new QueryEntity('Users');
        const userGroup = {
            $jsonEach: [
                '$Users.groups'
            ]
        };
        const query = new QueryExpression();
        query.resolvingJoinMember.subscribe(onResolvingJsonEachQualifiedMember);
        query.select(
            (x) => {
                return {
                    id: x.id,
                    username: x.username,
                    email: x.email
                }
            }
        ).from(Users).crossJoin({
            userGroup
        }).where((x) => {
            // noinspection JSUnresolvedReference
            return x.userGroup.group_name === 'Administrators';
        });

        const formatter = new MemoryFormatter();
        const sql = formatter.format(query);
        const results = await db.executeAsync(sql, []);
        expect(results).toBeTruthy();
        expect(results.length).toEqual(2);
    });

    it('should use json each values with filter', async () => {
        const Users = new QueryEntity('Users');
        const userTag = {
            $jsonEach: [
                '$Users.tags'
            ]
        };
        const query = new QueryExpression();
        query.resolvingMember.subscribe(onResolvingJsonEachMember);
        query.resolvingJoinMember.subscribe(onResolvingJsonEachQualifiedMember);
        query.from(Users).select(
            (x) => {
                return {
                    id: x.id,
                    username: x.username,
                    email: x.email,
                    tags: x.tags,
                }
            }
        ).crossJoin({
            userTag
        }).where((x) => {
            // noinspection JSUnresolvedReference
            return x.userTag === 'admin';
        });
        const formatter = new MemoryFormatter();
        const sql = formatter.format(query);
        const results = await db.executeAsync(sql, []);
        expect(results).toBeTruthy();
        expect(results.length).toEqual(2);
    });

});