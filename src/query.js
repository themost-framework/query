// MOST Web Framework Codename Zero Gravity Copyright (c) 2017-2022, THEMOST LP All rights reserved
import { keys as _keys, isArray, isNil, cloneDeep, forEach, assign, isObject } from 'lodash';
import { ClosureParser } from './closures/ClosureParser';
const aggregate = Symbol();
import './polyfills';
import {ObjectNameValidator} from './object-name.validator';
import {SyncSeriesEventEmitter} from '@themost/events';
import { instanceOf } from './instance-of';

class QueryParameter {
    constructor() {
    }

    static replace(expr, replacement) {
        for(const property in expr) {
            if (Object.prototype.hasOwnProperty.call(expr, property) === true) {
                if (expr[property] instanceof QueryParameter) {
                    expr[property] = replacement;
                }
                if (typeof expr[property] === 'object') {
                    QueryParameter.replace(expr[property], replacement);
                }
            }
        }
        return expr;
    }

}


class QueryFieldAggregator {
    constructor() {
        //
    }
    /**
     * Wraps the given comparison expression in this aggregate function e.g. wraps { $gt:45 } with $floor aggregate function and returns { $floor: { $gt:45 } }
     * @param {*} comparison
     */
    wrapWith(comparison) {
        let name = _keys(this)[0];
        if (name) {
            if (isArray(this[name])) {
                //search for query parameter
                for (let i = 0; i < this[name].length; i++) {
                    if (this[name][i] instanceof QueryParameter) {
                        this[name][i] = comparison;
                        return this;
                    }
                }
                throw new Error('Invalid aggregate expression. Parameter is missing.');
            }
            else {
                if (this[name] instanceof QueryParameter) {
                    this[name] = comparison;
                    return this;
                }
                throw new Error('Invalid aggregate expression. Parameter is missing.');
            }
        }
        throw new Error('Invalid aggregate expression. Aggregator is missing.');
    }
}

class QueryExpression {
    constructor() {
        /**
         * @private
         */
        Object.defineProperty(this, 'privates', {
            enumerable: false,
            configurable: false,
            writable: false,
            value: {}
        });

        this.resolvingMember = new SyncSeriesEventEmitter();
        this.resolvingJoinMember = new SyncSeriesEventEmitter();
        this.resolvingMethod = new SyncSeriesEventEmitter();

        this.resolvingMember.subscribe((event) => {
            if (this.$collection) {
                event.member = this.$collection.concat('.', event.member);
            }
        });

        this.resolvingJoinMember.subscribe((event) => {
            if (this.$joinCollection != null && event.object == null) {
                event.object = this.$joinCollection;
            }
        });

    }

    /**
     * @private
     * @param {string|*=} s
     * @returns {string|*}
     */
    prop(s) {
        if (typeof s === 'undefined') { return this.privates.property; }
        if (isNil(s)) { delete this.privates.property; }
        this.privates.property = s;
    }
    /**
     * Clones the current expression and returns a new QueryExpression object.
     * @example
     * var q = new QueryExpression();
     * //do some stuff
     * //...
     * //clone expression
     * var q1 = q.clone();
     * @returns {QueryExpression}
     */
    clone() {
        return cloneDeep(this);
    }
    /**
     * Sets the alias of a QueryExpression instance. This alias is going to be used in sub-query operations.
     * @returns {QueryExpression}
     */
    as(alias) {
        this.$alias = alias;
        return this;
    }
    /**
     * Gets a collection that represents the selected fields of the underlying expression
     * @returns {Array}
     */
    fields() {

        if (isNil(this.$select))
            return [];
        let entity = Object.key(this.$select);
        let joins = [];
        if (!isNil(this.$expand)) {
            if (isArray(this.$expand))
                joins = this.$expand;

            else
                joins.push(this.$expand);
        }
        //get entity fields
        let fields = [];
        //get fields
        let re = QueryField.FieldNameExpression, arr = this.$select[entity] || [];
        forEach(arr, function (x) {
            if (typeof x === 'string') {
                re.lastIndex = 0;
                if (!re.test(x))
                    fields.push(new QueryField(x));
                else {
                    let f = new QueryField(x);
                    fields.push(f.from(entity));
                }
            }
            else {
                fields.push(assign(new QueryField(), x));
            }
        });
        //enumerate join fields
        forEach(joins, function (x) {
            if (x.$entity instanceof QueryExpression) {
                //todo::add fields if any
            }
            else {
                let table = Object.key(x.$entity), tableFields = x.$entity[table] || [];
                forEach(tableFields, function (y) {
                    if (typeof x === 'string') {
                        fields.push(new QueryField(y));
                    }
                    else {
                        fields.push(assign(new QueryField(), y));
                    }
                });
            }
        });
        return fields;
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * Gets a boolean value that indicates whether query expression has a filter statement or not.
     * @returns {boolean}
     */
    hasFilter() {
        return isObject(this.$where);
    }
    /**
     * @param {boolean=} useOr
     * @returns {QueryExpression}
     */
    prepare(useOr) {
        if (typeof this.$where === 'object') {
            if (typeof this.$prepared === 'object') {
                let preparedWhere = {};
                if (useOr)
                    preparedWhere = { $or: [this.$prepared, this.$where] };

                else
                    preparedWhere = { $and: [this.$prepared, this.$where] };
                this.$prepared = preparedWhere;
            }
            else {
                this.$prepared = this.$where;
            }
            delete this.$where;
        }
        return this;
    }
    /**
     * Gets a boolean value that indicates whether query expression has fields or not.
     * @returns {boolean}
     */
    hasFields() {
        let self = this;
        if (!isObject(self.$select))
            return false;
        let entity = Object.key(self.$select);
        let joins = [];
        if (!isNil(self.$expand)) {
            if (isArray(self.$expand))
                joins = self.$expand;

            else
                joins.push(self.$expand);
        }
        //search for fields
        if (isArray(self.$select[entity])) {
            if (self.$select[entity].length > 0)
                return true;
        }
        let result = false;
        //enumerate join fields
        forEach(joins, function (x) {
            let table = Object.key(x.$entity);
            if (isArray(x.$entity[table])) {
                if (x.$entity[table].length > 0)
                    result = true;
            }
        });
        return result;
    }
    /**
     * Gets a boolean value that indicates whether query expression has paging or not.
     * @returns {boolean}
     */
    hasPaging() {
        return !isNil(this.$take);
    }
    /**
     * @returns {QueryExpression}
     */
    distinct(value) {
        if (typeof value === 'undefined')
            this.$distinct = true;

        else
            this.$distinct = value || false;
        return this;
    }

    /**
     * @param {*} expr
     * @param {...*} params
     * @returns {QueryExpression}
     */
    // eslint-disable-next-line no-unused-vars
    where(expr, params) {
        if (typeof expr === 'function') {
            // parse closure
            const closureParser = this.getClosureParser();
            this.$where = closureParser.parseFilter.apply(closureParser, Array.from(arguments))
            return this;
        }
        if (isNil(expr))
            throw new Error('Left operand cannot be empty. Expected string or object.');
        delete this.$where;
        if (typeof expr === 'string') {
            this.prop(expr);
        }
        else if (typeof expr === 'object') {
            this.prop(QueryField.prototype.nameOf.call(expr));
        }
        else {
            throw new Error('Invalid left operand. Expected string or object.');
        }
        return this;
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * Injects the given filter expression into the current query expression
     * @param {*} where - An object that represents a filter expression
     * @returns {QueryExpression}
     */
    injectWhere(where) {
        if (isNil(where))
            return this;
        this.$where = where;
    }
    /**
     * Initializes a "delete" query and sets the entity name that is going to be used in this query.
     * @param entity {string|QueryEntity}
     * @returns {QueryExpression}
     */
    delete(entity) {
        if (entity == null) {
            throw new Error('Entity cannot be empty at this context');
        }
        // get collection name (which can be string or QueryEntity)
        let name;
        if (instanceOf(entity, QueryEntity)) {
            name = entity.name;
        } else if (typeof entity === 'string') {
            name = entity;
        } else {
            throw new TypeError(`Expected string or an instance of QueryEntity class. Got ${typeof entity}`)
        }
        this.$delete = name;
        //delete other properties (if any)
        delete this.$insert;
        delete this.$select;
        delete this.$update;
        return this;
    }
    /**
     * Initializes an insert query and sets the object that is going to be inserted.
     * @param obj {*}
     * @returns {QueryExpression}
     */
    insert(obj) {
        if (isNil(obj))
            return this;
        if (isArray(obj) || isObject(obj)) {
            this.$insert = { table1: obj };
            //delete other properties (if any)
            delete this.$delete;
            delete this.$select;
            delete this.$update;
            return this;
        }
        else {
            throw new Error('Invalid argument. Object must be an object or an array of objects');
        }
    }
    /**
     * @param {string|QueryEntity} entity
     */
    into(entity) {
        if (entity == null) {
            throw new Error('Entity cannot be empty at this context');
        }
        // get collection name (which can be string or QueryEntity)
        let name;
        if (instanceOf(entity, QueryEntity)) {
            name = entity.name;
        } else if (typeof entity === 'string') {
            name = entity;
        } else {
            throw new TypeError(`Expected string or an instance of QueryEntity class. Got ${typeof entity}`)
        }
        if (isNil(this.$insert))
            return this;
        // get current property of $insert
        let prop = Object.key(this.$insert);
        if (isNil(prop))
            return this;
        if (prop === name)
            return this;
        let value = this.$insert[prop];
        if (isNil(value))
            return this;
        // set object to insert
        this.$insert[name] = value;
        // remove unused property
        delete this.$insert[prop];
        return this;
    }
    /**
     * Initializes an update query and sets the entity name that is going to be used in this query.
     * @param {string|QueryEntity} entity
     * @returns {QueryExpression}
     */
    update(entity) {
        if (entity == null) {
            throw new Error('Entity cannot be empty at this context');
        }
        // get collection name (which can be string or QueryEntity)
        let name;
        if (instanceOf(entity, QueryEntity)) {
            name = entity.name;
        } else if (typeof entity === 'string') {
            name = entity;
        } else {
            throw new TypeError(`Expected string or an instance of QueryEntity class. Got ${typeof entity}`)
        }
        this.$update = {};
        this.$update[name] = {};
        //delete other properties (if any)
        delete this.$delete;
        delete this.$select;
        delete this.$insert;
        return this;
    }
    /**
     * Sets the object that is going to be updated through an update expression.
     * @param {*} obj
     * @returns {QueryExpression}
     */
    set(obj) {
        if (isNil(obj))
            return this;
        if (isArray(obj) || !isObject(obj))
            throw new Error('Invalid argument type. Update expression argument must be an object.');
        //get entity name (by property)
        let prop = Object.key(this.$update);
        if (isNil(prop))
            throw new Error('Invalid operation. Update entity cannot be empty at this context.');
        //set object to update
        this.$update[prop] = obj;
        return this;
    }

    /**
     * Gets an instance of ClosureParser and register hooks
     * @private
     * @returns {ClosureParser}
     */
    getClosureParser() {
        const closureParser = new ClosureParser();
        // register sync hooks
        closureParser.resolvingMember.subscribe((event) => {
            const newEvent = {
                target: this,
                member: event.member
            };
            this.resolvingMember.emit(newEvent);
            event.member = newEvent.member
        });
        closureParser.resolvingJoinMember.subscribe((event) => {
            const newEvent = {
                target: this,
                object: event.object || this.$joinCollection,
                member: event.member,
                fullyQualifiedMember: event.fullyQualifiedMember
            };
            this.resolvingJoinMember.emit(newEvent);
            event.member = newEvent.member;
            if (event.object !== newEvent.object) {
                event.object = newEvent.object;
            }
        });
        closureParser.resolvingMethod.subscribe((event) => {
            const newEvent = {
                target: this,
                method: event.method
            };
            this.resolvingMethod.emit(newEvent);
            event.method = newEvent.method
        });
        return closureParser;
    }

    /**
     * Prepares a SELECT statement by defining a field or an array of fields
     * we want to select data from
     * @param {...*} field - A param array of fields that are going to be used in select statement
     * @returns {QueryExpression}
     * @example
     * const q = new QueryExpression().from('UserBase').select('id', 'name');
     * const formatter = new SqlFormatter();
     * console.log('SQL', formatter.formatSelect(q))
     * // SELECT UserBase.id, UserBase.name FROM UserBase
     */
    /* eslint-disable-next-line no-unused-vars */
    select(field) {
        let fields = [];
        // handle closure
        if (typeof field === 'function') {
            // get closure and params
            let selectArgs = Array.from(arguments);
            if (this.$collection == null) {
                // hold select closure to process them after from() clause
                Object.defineProperty(this, '_selectClosure', {
                    configurable: true,
                    enumerable: false,
                    value: selectArgs,
                    writable: true
                });
                return this;
            }
            const closureParser = this.getClosureParser();
            fields = closureParser.parseSelect.apply(closureParser, selectArgs);
            if (this.privates.entity) {
                this.$select = {};
                Object.defineProperty(this.$select, this.privates.entity, {
                    configurable: true,
                    enumerable: true,
                    value: fields,
                    writable: true
                });
            } else {
                this.privates.fields = fields;
            }
            // and return
            return this;
        }
        // get argument
        let arr = Array.prototype.slice.call(arguments);
        if (arr.length === 0) {
            return this;
        }
        // validate arguments
        arr.forEach(function (x) {
            // backward compatibility
            // any argument may be an array of fields
            // this operation needs to be deprecated
            if (Array.isArray(x)) {
                fields.push.apply(fields, x);
            }
            else {
                fields.push(x);
            }
        });
        //if entity is already defined
        if (this.privates.entity) {
            //initialize $select property
            this.$select = {};
            //and set array of fields
            this.$select[this.privates.entity] = fields;
        }

        else {
            //otherwise store array of fields in temporary property and wait
            this.privates.fields = fields;
        }
        //delete other properties (if any)
        delete this.$delete;
        delete this.$insert;
        delete this.$update;
        return this;
    }
    /**
     * Prepares an aggregated query which is going to count records by specifying the alias of the count attribute
     * e.g. SELECT COUNT(*) AS `total` FROM (SELECT * FROM `Orders` WHERE `orderStatus` = 1) `c0`
     * @param {string} alias - A string which represents the alias of the count attribute
     * @returns QueryExpression
     */
    count(alias) {
        this.$count = alias;
        return this;
    }
    /**
     * Sets the entity of a select query expression
     * @param entity {string|QueryEntity|*} A string that represents the entity name
     * @returns {QueryExpression}
     */
    from(entity) {

        if (isNil(entity))
            return this;
        let name;
        if (entity instanceof QueryEntity) {
            name = entity.$as || entity.name;
            this.$ref = this.$ref || {};
            this.$ref[name] = entity;
        }
        else if (entity instanceof QueryExpression) {
            name = entity.$alias || 's0';
            this.$ref = this.$ref || {};
            this.$ref[name] = entity;
        }
        else {
            name = entity.valueOf();
        }
        Object.defineProperty(this, '$collection', {
            configurable: true,
            enumerable: false,
            writable: true,
            value: name
        });
        // if temporary select closure is defined
        if (this._selectClosure != null) {
            // parse select closure
            this.select.apply(this, this._selectClosure);
            // remove it and continue
            delete this._selectClosure;
        }
        if (this.privates.fields) {
            //initialize $select property
            this.$select = {};
            //and set array of fields
            this.$select[name] = this.privates.fields;
        }
        else {
            this.privates.entity = name;
        }
        //delete other properties (if any)
        delete this.$delete;
        delete this.$insert;
        delete this.$update;
        //and return this object
        return this;
    }
    /**
     * Initializes a join expression with the specified entity
     * @param {*} entity
     * @param {Array=} props
     * @param {String=} alias
     * @returns {QueryExpression}
     */
    join(entity, props, alias) {

        if (isNil(entity))
            return this;
        if (isNil(this.$select))
            throw new Error('Query entity cannot be empty when adding a join entity.');
        let obj = {};
        if (entity instanceof QueryEntity) {
            //do nothing (clone object)
            obj = entity;
        }
        else if (entity instanceof QueryExpression) {
            //do nothing (clone object)
            obj = entity;
        }
        else {
            obj[entity] = props || [];
            if (typeof alias === 'string')
                obj.$as = alias;
        }
        this.privates.expand = { $entity: obj };
        // set current join entity
        let collectionName = null;
        if (this.privates.expand.$entity.$as != null) {
            collectionName = this.privates.expand.$entity.$as;
        } else if (typeof this.privates.expand.$entity.name === 'function') {
            collectionName = this.privates.expand.$entity.name();
        }
        Object.defineProperty(this, '$joinCollection', {
            configurable: true,
            enumerable: false,
            writable: true,
            value: collectionName
        });
        //and return this object
        return this;
    }
    /**
     * Initializes a left join expression with the specified entity
     * @param {*} entity
     * @param {Array=} props
     * @param {String=} alias
     * @returns {QueryExpression}
     */
    leftJoin() {
        let args = Array.from(arguments);
        this.join.apply(this, args);
        if (this.privates.expand && this.privates.expand.$entity) {
            this.privates.expand.$entity.$join = 'left';
        }
        return this;
    }
    /**
     * Initializes a right join expression with the specified entity
     * @param {*} entity
     * @param {Array=} props
     * @param {String=} alias
     * @returns {QueryExpression}
     */
    rightJoin() {
        let args = Array.from(arguments);
        this.join.apply(this, args);
        if (this.privates.expand && this.privates.expand.$entity) {
            this.privates.expand.$entity.$join = 'right';
        }
        return this;
    }
    /**
     * Sets the join expression of the last join entity
     * @param obj {Array|*}
     * @returns {QueryExpression}
     */
    with(obj) {

        if (obj == null) {
            return this;
        }
        if (this.privates.expand == null) {
            throw new Error('Join entity cannot be empty when adding a join expression. Use QueryExpression.join(entity, props) before.');
        }
        if (typeof obj === 'function') {
            // parse closure and return
            const closureParser = this.getClosureParser();
            let args = Array.from(arguments);
            return this.with(closureParser.parseFilter.apply(closureParser, args));
        }
        if (obj instanceof QueryExpression) {
            /**
             * @type {QueryExpression}
             */
            let expr = obj;
            let where = null;
            if (expr.$where)
                where = expr.$prepared ? { $and: [expr.$prepared, expr.$where] } : expr.$where;
            else if (expr.$prepared)
                where = expr.$prepared;
            this.privates.expand.$with = where;
        }
        else {
            this.privates.expand.$with = obj;
        }
        if (isNil(this.$expand)) {
            this.$expand = this.privates.expand;
        }
        else {
            if (isArray(this.$expand)) {
                this.$expand.push(this.privates.expand);
            }
            else {
                //get expand object
                let expand = this.$expand;
                //and create array of expand objects
                this.$expand = [expand, this.privates.expand];
            }
        }
        //destroy temp object
        this.privates.expand = null;
        delete this.$joinCollection;
        //and return QueryExpression
        return this;
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * Applies an ascending ordering to a query expression
     * @param {string|*} field
     * @returns {QueryExpression}
     */
    orderBy(field) {

        if (typeof field === 'function') {
            const closureParser = this.getClosureParser();
            // get closure
            let selectArgs = Array.from(arguments);
            let fields = closureParser.parseSelect.apply(closureParser, selectArgs);
            this.$order = fields.map(function (item) {
                return { $asc: item };
            });
            // and return
            return this;
        }

        if (isNil(field))
            return this;
        if (isNil(this.$order))
            this.$order = [];
        this.$order.push({ $asc: field });
        return this;
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * Applies a descending ordering to a query expression
     * @param {string|*} field
     * @returns {QueryExpression}
     */
    orderByDescending(field) {

        if (typeof field === 'function') {
            const closureParser = this.getClosureParser();
            // get closure
            let selectArgs = Array.from(arguments);
            let fields = closureParser.parseSelect.apply(closureParser, selectArgs);
            this.$order = fields.map(function (item) {
                return { $desc: item };
            });
            // and return
            return this;
        }

        if (isNil(field))
            return this;
        if (isNil(this.$order))
            this.$order = [];
        this.$order.push({ $desc: field });
        return this;
    }
    /**
     * Performs a subsequent ordering in a query expression
     * @param {String|*} field
     * @returns {QueryExpression}
     */
    thenBy(field) {

        if (typeof field === 'function') {
            const closureParser = this.getClosureParser();
            // get closure and params
            let selectArgs = Array.from(arguments);
            let fields = closureParser.parseSelect.apply(closureParser, selectArgs);
            // and return
            if (Array.isArray(this.$order) === false) {
                throw new Error('QueryExpression.thenBy() statement should be called after QueryExpression.orderBy() or QueryExpression.orderByDescending()');
            }
            fields.forEach((item) => {
                this.$order.push({ $asc: item });
            });
            return this;
        }

        if (isNil(field))
            return this;
        if (isNil(this.$order))
            return this;
        this.$order.push({ $asc: field });
        return this;
    }
    /**
     * Performs a subsequent ordering in a query expression
     * @param {string|*} field
     * @returns {QueryExpression}
     */
    thenByDescending(field) {

        if (typeof field === 'function') {
            const closureParser = this.getClosureParser();
            // get closure and params
            let selectArgs = Array.from(arguments);
            let fields = closureParser.parseSelect.apply(closureParser, selectArgs);
            // and return
            if (Array.isArray(this.$order) === false) {
                throw new Error('QueryExpression.thenByDescending() statement should be called after QueryExpression.orderBy() or QueryExpression.orderByDescending()');
            }
            fields.forEach((item) => {
                this.$order.push({ $desc: item });
            });
            return this;
        }

        if (isNil(field))
            return this;
        if (isNil(this.$order))
            //throw exception (?)
            return this;
        this.$order.push({ $desc: field });
        return this;
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @param {...*} field
     * @returns {QueryExpression}
     */
    /* eslint-disable-next-line no-unused-vars */
    groupBy(field) {

        let fields;
        if (typeof field === 'function') {
            const closureParser = this.getClosureParser();
            // get closure and params
            let selectArgs = Array.from(arguments);
            let params = {};
            // if the last arguments is a type of object
            // set params and remove it
            if (typeof selectArgs[selectArgs.length - 1] === 'object') {
                params = selectArgs.splice(selectArgs.length - 1, 1)[0];
            }
            if (selectArgs.length > 1) {
                this.$group = [];
                for (const selectArg of selectArgs) {
                    const results = closureParser.parseSelect(selectArg, params);
                    this.$group.push(...results);
                }
            } else {
                this.$group = closureParser.parseSelect(selectArgs[0], params);
            }
            return this;
        }

        // get argument
        let arr = Array.prototype.slice.call(arguments);
        if (arr.length === 0) {
            return this;
        }
        // validate arguments
        fields = [];
        arr.forEach(function (x) {
            // backward compatibility
            // any argument may be an array of fields
            // this operation needs to be deprecated
            if (Array.isArray(x)) {
                fields.push.apply(fields, x);
            }
            else {
                fields.push(x);
            }
        });
        this.$group = fields;
        return this;
    }
    /**
     * @param expr
     * @private
     */
    __append(expr) {
        if (!expr)
            return;
        if (!this.$where) {
            this.$where = expr;
        }
        else {
            let op = this.privates.expression;
            if (op) {
                //get current operator
                let keys = _keys(this.$where);
                if (keys[0] === op) {
                    this.$where[op].push(expr);
                }
                else {
                    let newFilter = {};
                    newFilter[op] = [this.$where, expr];
                    this.$where = newFilter;
                }
            }
        }
        delete this.privates.property;
        delete this.privates.expression;
    }
    /**
     * @param {*} field
     * @returns {QueryExpression}
     */
    or(field) {
        if (isNil(field))
            throw new Error('Left operand cannot be empty. Expected string or object.');
        if (typeof field === 'string') {
            this.prop(field);
        }
        else if (typeof field === 'object') {
            this.prop(QueryField.prototype.nameOf.call(field));
        }
        else {
            throw new Error('Invalid left operand. Expected string or object.');
        }
        this.privates.expression = '$or';
        return this;
    }
    /**
     * @param {*} field
     * @returns {QueryExpression}
     */
    and(field) {
        if (isNil(field))
            throw new Error('Left operand cannot be empty. Expected string or object.');
        if (typeof field === 'string') {
            this.prop(field);
        }
        else if (typeof field === 'object') {
            this.prop(QueryField.prototype.nameOf.call(field));
        }
        else {
            throw new Error('Invalid left operand. Expected string or object.');
        }
        this.privates.expression = '$and';
        return this;
    }
    /**
     * Prepares an equal expression.
     * @example
     * q.where('id').equal(10) //id=10 expression
     * @param {*} value - A value that represents the right part of the prepared expression
     * @returns {QueryExpression}
     */
    equal(value) {
        let p0 = this.prop();
        if (p0) {
            let comparison = value;
            //apply aggregation if any
            if (typeof this[aggregate] === 'object') {
                comparison = QueryFieldAggregator.prototype.wrapWith.call(this[aggregate], value);
                delete this[aggregate];
            }
            let expr = QueryFieldComparer.prototype.compareWith.call(p0, comparison);
            this.__append(expr);
        }
        return this;
    }
    eq(value) {
        return this.equal(value);
    }
    /**
     * Prepares a not equal expression.
     * @example
     * q.where('id').notEqual(10) //id<>10 expression
     * @param {*} value - A value that represents the right part of the prepared expression
     * @returns {QueryExpression}
     */
    notEqual(value) {
        let p0 = this.prop();
        if (p0) {
            let comparison = { $ne: value };
            if (typeof this[aggregate] === 'object') {
                comparison = QueryFieldAggregator.prototype.wrapWith.call(this[aggregate], { $ne: value });
                delete this[aggregate];
            }
            let expr = QueryFieldComparer.prototype.compareWith.call(p0, comparison);
            this.__append(expr);
        }
        return this;
    }

    ne(value) {
        return this.notEqual(value);
    }

    /**
     * Prepares an in statement expression
     * @example
     * q.where('id').in([10, 11, 12]) //id in (10,11,12) expression
     * @param {Array} values - An array of values that represents the right part of the prepared expression
     * @returns {QueryExpression}
     */
    in(values) {
        let p0 = this.prop();
        if (p0) {
            let comparison = { $in: values };
            if (typeof this[aggregate] === 'object') {
                comparison = QueryFieldAggregator.prototype.wrapWith.call(this[aggregate], comparison);
                delete this[aggregate];
            }
            let expr = QueryFieldComparer.prototype.compareWith.call(p0, comparison);
            this.__append(expr);
        }
        return this;
    }
    /**
     * Prepares a "not in" statement expression
     * @example
     * q.where('id').notIn([10, 11, 12]) //id in (10,11,12) expression
     * @param {Array} values - An array of values that represents the right part of the prepared expression
     * @returns {QueryExpression}
     */
    notIn(values) {
        let p0 = this.prop();
        if (p0) {
            let comparison = { $nin: values };
            if (typeof this[aggregate] === 'object') {
                comparison = QueryFieldAggregator.prototype.wrapWith.call(this[aggregate], { $nin: values });
                delete this[aggregate];
            }
            let expr = QueryFieldComparer.prototype.compareWith.call(p0, comparison);
            this.__append(expr);
        }
        return this;
    }
    /**
     * @param {*} value The value to be compared
     * @param {Number} result The result of modulo expression
     * @returns {QueryExpression}
     */
    mod(value, result) {
        let p0 = this.prop();
        if (p0) {
            let comparison = { $mod: [value, result] };
            if (typeof this[aggregate] === 'object') {
                comparison = QueryFieldAggregator.prototype.wrapWith.call(this[aggregate], comparison);
                delete this[aggregate];
            }
            let expr = QueryFieldComparer.prototype.compareWith.call(p0, comparison);
            this.__append(expr);
        }
        return this;
    }
    /**
     * @param {*} value The value to be compared
     * @param {Number} result The result of a bitwise and expression
     * @returns {QueryExpression}
     */
    bit(value, result) {
        let prop = this.prop();
        if (prop == null) {
            throw new Error('Bitwise and left operand is missing.');
        }
        if (result == null) {
            throw new Error('Bitwise and right operand cannot be empty.');
        }
        let left;
        if (typeof this[aggregate] === 'object') {
            left = QueryParameter.replace(this[aggregate], new QueryField(prop));
            delete this[aggregate];
        } else {
            left = new QueryField(prop);
        }
        this.__append({
            '$eq': [
                {
                    '$bit': [
                        left,
                        value
                    ]
                },
                result
            ]
        });
        return this;
    }
    /**
     * @param value {*}
     * @returns {QueryExpression}
     */
    greaterThan(value) {
        let p0 = this.prop();
        if (p0) {
            let comparison = { $gt: value };
            if (typeof this[aggregate] === 'object') {
                comparison = QueryFieldAggregator.prototype.wrapWith.call(this[aggregate], comparison);
                delete this[aggregate];
            }
            let expr = QueryFieldComparer.prototype.compareWith.call(p0, comparison);
            this.__append(expr);
        }
        return this;
    }

    gt(value) {
        return this.greaterThan(value);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @param value {RegExp|*}
     * @returns {QueryExpression}
     */
    startsWith(value) {
        let p0 = this.prop();
        if (p0) {
            if (typeof value !== 'string') {
                throw new Error('Invalid argument. Expected string.');
            }
            let comparison = { $regex: '^' + value, $options: 'i' };
            if (typeof this[aggregate] === 'object') {
                comparison = QueryFieldAggregator.prototype.wrapWith.call(this[aggregate], { $regex: '^' + value, $options: 'i' });
                delete this[aggregate];
            }
            let expr = QueryFieldComparer.prototype.compareWith.call(p0, comparison);
            this.__append(expr);
        }
        return this;
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @param value {*}
     * @returns {QueryExpression}
     */
    endsWith(value) {
        let p0 = this.prop();
        if (p0) {
            if (typeof value !== 'string') {
                throw new Error('Invalid argument. Expected string.');
            }
            let expr = QueryFieldComparer.prototype.compareWith.call(p0, { $regex: value + '$', $options: 'i' });
            this.__append(expr);
        }
        return this;
    }
    /**
     * Prepares a contains expression.
     * @example
     * var qry = require('most-query');
     * var q = qry.query('Person').where('first').contains('om').select(['id','first', 'last']);
     * var formatter = new qry.classes.SqlFormatter();
     * console.log(formatter.format(q));
     * //returns SELECT Person.id, Person.first, Person.last FROM Person WHERE ((first REGEXP 'om')=true)
     * @param  {*} value - A value that represents the right part of the expression
     * @returns {QueryExpression}
     */
    contains(value) {
        let p0 = this.prop();
        if (p0) {
            let comparison = { $text: { $search: value } };
            //apply aggregation if any
            if (typeof this[aggregate] === 'object') {
                comparison = QueryFieldAggregator.prototype.wrapWith.call(this[aggregate], comparison);
                delete this[aggregate];
            }
            let expr = QueryFieldComparer.prototype.compareWith.call(p0, comparison);
            this.__append(expr);
        }
        return this;
    }
    notContains(value) {
        let p0 = this.prop();
        if (p0) {
            let comparison = { $text: { $search: value } };
            //apply aggregation if any
            if (typeof this[aggregate] === 'object') {
                comparison = QueryFieldAggregator.prototype.wrapWith.call(this[aggregate], comparison);
                delete this[aggregate];
            }
            let expr = { $not: QueryFieldComparer.prototype.compareWith.call(p0, comparison) };
            this.__append(expr);
        }
        return this;
    }
    /**
     * @param value {*}
     * @returns {QueryExpression}
     */
    lowerThan(value) {
        let p0 = this.prop();
        if (p0) {
            let comparison = { $lt: value };
            if (typeof this[aggregate] === 'object') {
                comparison = QueryFieldAggregator.prototype.wrapWith.call(this[aggregate], comparison);
                delete this[aggregate];
            }
            let expr = QueryFieldComparer.prototype.compareWith.call(p0, comparison);
            this.__append(expr);
        }
        return this;
    }

    lt(value) {
        return this.lowerThan(value);
    }

    /**
     * @param value {*}
     * @returns {QueryExpression}
     */
    lowerOrEqual(value) {
        let p0 = this.prop();
        if (p0) {
            let comparison = { $lte: value };
            if (typeof this[aggregate] === 'object') {
                comparison = QueryFieldAggregator.prototype.wrapWith.call(this[aggregate], comparison);
                delete this[aggregate];
            }
            let expr = QueryFieldComparer.prototype.compareWith.call(p0, comparison);
            this.__append(expr);
        }
        return this;
    }

    lte(value) {
        return this.lowerOrEqual(value);
    }

    /**
     * @param value {*}
     * @returns {QueryExpression}
     */
    greaterOrEqual(value) {
        let p0 = this.prop();
        if (p0) {
            let comparison = { $gte: value };
            if (typeof this[aggregate] === 'object') {
                comparison = QueryFieldAggregator.prototype.wrapWith.call(this[aggregate], comparison);
                delete this[aggregate];
            }
            let expr = QueryFieldComparer.prototype.compareWith.call(p0, comparison);
            this.__append(expr);
        }
        return this;
    }

    gte(value) {
        return this.greaterOrEqual(value);
    }

    /**
     * @param {*} value1
     * @param {*} value2
     * @returns {QueryExpression}
     */
    between(value1, value2) {
        let p0 = this.prop();
        if (p0) {
            let comparison1 = { $gte: value1 }, comparison2 = { $lte: value2 };
            if (typeof this[aggregate] === 'object') {
                comparison1 = QueryFieldAggregator.prototype.wrapWith({ $gte: value1 });
                comparison2 = QueryFieldAggregator.prototype.wrapWith({ $lte: value2 });
                delete this[aggregate];
            }
            let comp1 = QueryFieldComparer.prototype.compareWith.call(p0, comparison1);
            let comp2 = QueryFieldComparer.prototype.compareWith.call(p0, comparison2);
            let expr = {};
            expr['$and'] = [comp1, comp2];
            this.__append(expr);
        }
        return this;
    }
    /**
     * Skips the specified number of objects during select.
     * @param {Number} n
     * @returns {QueryExpression}
     */
    skip(n) {
        this.$skip = isNaN(n) ? 0 : n;
        return this;
    }
    /**
     * Takes the specified number of objects during select.
     * @param {Number} n
     * @returns {QueryExpression}
     */
    take(n) {
        this.$take = isNaN(n) ? 0 : n;
        return this;
    }
    /**
     * @param {number|*} x
     * @returns {QueryExpression}
     */
    add(x) {
        this[aggregate] = { $add: [x, new QueryParameter()] };
        return this;
    }
    /**
     * @param {number|*} x
     * @returns {QueryExpression}
     */
    subtract(x) {
        this[aggregate] = { $subtract: [x, new QueryParameter()] };
        return this;
    }
    /**
     * @param {number} x
     * @returns {QueryExpression}
     */
    multiply(x) {
        this[aggregate] = { $multiply: [x, new QueryParameter()] };
        return this;
    }
    /**
     * @param {number} x
     * @returns {QueryExpression}
     */
    divide(x) {
        this[aggregate] = { $divide: [x, new QueryParameter()] };
        return this;
    }
    /**
     * @param {number=} n
     * @returns {QueryExpression}
     */
    round(n) {
        this[aggregate] = { $round: [n, new QueryParameter()] };
        return this;
    }
    /**
     * @param {number} start
     * @param {number=} length
     * @returns {QueryExpression}
     */
    substr(start, length) {
        this[aggregate] = { $substr: [start, length, new QueryParameter()] };
        return this;
    }
    /**
     * @param {string} s
     * @returns {QueryExpression}
     */
    indexOf(s) {
        this[aggregate] = { $indexOf: [s, new QueryParameter()] };
        return this;
    }
    /**
     * @param {string|*} s
     * @returns {QueryExpression}
     */
    concat(s) {
        this[aggregate] = { $concat: [s, new QueryParameter()] };
        return this;
    }
    /**
     * @returns {QueryExpression}
     */
    trim() {
        this[aggregate] = { $trim: new QueryParameter() };
        return this;
    }
    /**
     * @returns {QueryExpression}
     */
    length() {
        this[aggregate] = { $length: new QueryParameter() };
        return this;
    }
    /**
     * @returns {QueryExpression}
     */
    getDate() {
        this[aggregate] = { $date: new QueryParameter() };
        return this;
    }
    /**
     * @returns {QueryExpression}
     */
    getYear() {
        this[aggregate] = { $year: new QueryParameter() };
        return this;
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @returns {QueryExpression}
     */
    getMonth() {
        this[aggregate] = { $month: new QueryParameter() };
        return this;
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @returns {QueryExpression}
     */
    getDay() {
        this[aggregate] = { $dayOfMonth: new QueryParameter() };
        return this;
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @returns {QueryExpression}
     */
    getHours() {
        this[aggregate] = { $hour: new QueryParameter() };
        return this;
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @returns {QueryExpression}
     */
    getMinutes() {
        this[aggregate] = { $minutes: new QueryParameter() };
        return this;
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @returns {QueryExpression}
     */
    getSeconds() {
        this[aggregate] = { $seconds: new QueryParameter() };
        return this;
    }
    /**
     * @returns {QueryExpression}
     */
    floor() {
        this[aggregate] = { $floor: new QueryParameter() };
        return this;
    }
    /**
     * @returns {QueryExpression}
     */
    ceil() {
        this[aggregate] = { $ceiling: new QueryParameter() };
        return this;
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @returns {QueryExpression}
     */
    toLocaleLowerCase() {
        this[aggregate] = { $toLower: new QueryParameter() };
        return this;
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @returns {QueryExpression}
     */
    toLocaleUpperCase() {
        this[aggregate] = { $toUpper: new QueryParameter() };
        return this;
    }
    /**
     * @private
     * @param {number|*} number
     * @param {number} length
     * @returns {*}
     */
    static zeroPad(number, length) {
        number = number || 0;
        let res = number.toString();
        while (res.length < length) {
            res = '0' + res;
        }
        return res;
    }
    static escape(val) {
        if (isNil(val)) {
            return 'null';
        }

        switch (typeof val) {
            case 'boolean': return (val) ? 'true' : 'false';
            case 'number': return val + '';
        }

        if (val instanceof Date) {
            let dt = new Date(val);
            let year = dt.getFullYear();
            let month = QueryExpression.zeroPad(dt.getMonth() + 1, 2);
            let day = QueryExpression.zeroPad(dt.getDate(), 2);
            let hour = QueryExpression.zeroPad(dt.getHours(), 2);
            let minute = QueryExpression.zeroPad(dt.getMinutes(), 2);
            let second = QueryExpression.zeroPad(dt.getSeconds(), 2);
            let millisecond = QueryExpression.zeroPad(dt.getMilliseconds(), 3);
            val = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second + '.' + millisecond;
        }

        if (typeof val === 'object' && Object.prototype.toString.call(val) === '[object Array]') {
            let values = [];
            forEach(val, function (x) {
                QueryExpression.escape(x);
            });
            return values.join(',');
        }

        if (typeof val === 'object') {
            if (Object.prototype.hasOwnProperty.call(val, '$name'))
                //return field identifier
                return val['$name'];

            else
                return this.escape(val.valueOf());
        }

        // eslint-disable-next-line no-control-regex, no-useless-escape
        val = val.replace(/[\0\n\r\b\t\\\'\"\x1a]/g, function (s) {
            switch (s) {
                case '\0': return '\\0';
                case '\n': return '\\n';
                case '\r': return '\\r';
                case '\b': return '\\b';
                case '\t': return '\\t';
                case '\x1a': return '\\Z';
                default: return '\\' + s;
            }
        });
        return '\'' + val + '\'';
    }
}

/**
 * Represents an enumeration of comparison query operators
 * @type {*}
 */
QueryExpression.ComparisonOperators = { $eq:'$eq', $ne:'$ne', $gt:'$gt',$gte:'$gte', $lt:'$lt',$lte:'$lte', $in: '$in', $nin:'$nin' };
/**
 * Represents an enumeration of logical query operators
 * @type {*}
 */
QueryExpression.LogicalOperators = { $or:'$or', $and:'$and', $not:'$not', $nor:'$not' };
/**
 * Represents an enumeration of evaluation query operators
 * @type {*}
 */
QueryExpression.EvaluationOperators = { $mod:'$mod', $add:'$add', $sub:'$sub', $mul:'$mul', $div:'$div' };

class QueryEntity {
    constructor(obj) {
        let entity = obj || 'Table';
        this[entity] = [];
        Object.defineProperty(this, 'name', {
            get: function () {
                return entity;
            }, configurable: false, enumerable: false
        });
        let self = this;
        Object.defineProperty(this, 'props', {
            get: function () {
                return self[entity];
            }, configurable: false, enumerable: false
        });
    }
    select(name) {
        let f = new QueryField(name);
        return f.from(this.$as ? this.$as : this.name);
    }
    as(alias) {
        this.$as = alias;
        return this;
    }
    inner() {
        this.$join = 'inner';
        return this;
    }
    left() {
        this.$join = 'left';
        return this;
    }
    right() {
        this.$join = 'right';
        return this;
    }
}

class QueryField {
    constructor(obj) {
        if (typeof obj === 'string') {
            /**
             * @property QueryField#$name
             * @private
             * @type {string}
             */
            this.$name = obj;
        }
        else if (isObject(obj)) {
            assign(this, obj);
        }
    }
    /**
     * Sets the name of a query field
     * @param name {string} - A string which represents a field name
     * @example
     * // { $name: 'price' }
     * let field = new QueryField().select('price');
     * @returns {QueryField}
     */
    select(name) {
        // clear object
        Object.clear(this);
        // set field name
        this.$name = name;
        // return this
        return this;
    }
    /**
     * Sets the entity of the current field
     * @param entity {string|QueryEntity}
     * @returns {QueryField}
     */
    from(entity) {
        let name;
        /**
         * @type {string}
         */
        let fromEntity;
        if (instanceOf(entity, QueryEntity)) {
            fromEntity = entity.$as || entity.name;
        } else if (typeof entity === 'string') {
            fromEntity = entity;
        }
        if (fromEntity == null) {
            throw new Error('Invalid argument. Expected a valid instance of query entity or string.');
        }
        ObjectNameValidator.validator.exec(fromEntity, false);
        // get property
        if (this.$name != null) {
            if (typeof this.$name === 'string') {
                //check if an entity is already defined
                name = this.$name;
                if (QueryField.FieldNameExpression.test(name))
                    //if not append entity name
                    this.$name = fromEntity.concat('.', name);

                else
                    //split field name and add entity
                    this.$name = fromEntity.concat('.', name.split('.')[1]);
            } else {
                throw new Error('Invalid field definition.');
            }
        }
        else {
            // get default property
            let alias = Object.key(this);
            if (isNil(alias))
                throw new Error('Field definition cannot be empty at this context');
            // get field expression
            let expr = this[alias];
            // get field name
            let aggregate = Object.key(expr);
            if (isNil(aggregate))
                throw new Error('Field expression cannot be empty at this context');
            name = expr[aggregate];
            if (QueryField.FieldNameExpression.test(name))
                // if not append entity name
                expr[aggregate] = fromEntity.concat('.', name);

            else
                // split field name and add entity
                expr[aggregate] = fromEntity.concat('.', name.split('.')[1]);
        }
        return this;
    }
    /**
     * Defines a COUNT() query expression for the given field
     * @example
     * // { orderCount: { $count: 'order' } }
     * let field = new QueryField().count('order').as('orderCount')
     * @param {string} name - A string which represents a field name
     * @returns {QueryField}
     */
    count(name) {
        //clear object
        Object.clear(this);
        // set count aggregate function
        this[name] = { $count: name };
        // return this
        return this;
    }
    /**
     * @param {...string} str
     * @return {QueryField}
     */
    /* eslint-disable-next-line no-unused-vars */
    concat(str) {
        this.$name.concat.apply(this.$name, Array.prototype.slice.call(arguments));
        return this;
    }
    /**
     * Defines a SUM() query expression for the given field
     * @param {string} name - A string which represents a field name
     * // { total: { $sum: 'price' } }
     * let field = new QueryField().sum('price').as('total')
     * @returns {QueryField}
     */
    sum(name) {
        //clear object
        Object.clear(this);
        // field as aggregate function e.g. { price: { $sum: 'price' } }
        this[name] = { $sum: name };
        return this;
    }
    /**
     * Defines a MIN() query expression for the given field
     * @param {string} name - A string which represents a field name
     * // { minimumPrice: { $min: 'price' } }
     * let field = new QueryField().sum('price').as('minimumPrice')
     * @returns {QueryField}
     */
    min(name) {
        if (typeof name !== 'string')
            throw new Error('Invalid argument. Expected string');
        //clear object
        Object.clear(this);
        // set aggregate function
        this[name] = { $min: name };
        return this;
    }
    /**
     * Defines an AVG() query expression for the given field
     * @param {string} name - A string which represents a field name
     * // { averagePrice: { $avg: 'price' } }
     * let field = new QueryField().sum('price').as('averagePrice')
     * @returns {QueryField}
     */
    average(name) {
        //clear object
        Object.clear(this);
        // set aggregate function
        this[name] = { $avg: name };
        return this;
    }
    /**
     * Defines an AVG() query expression for the given field
     * @param {string} name - A string which represents a field name
     * // { averagePrice: { $avg: 'price' } }
     * let field = new QueryField().sum('price').as('averagePrice')
     * @returns {QueryField}
     */
    avg(name) {
        return this.average(name);
    }
    /**
     * Defines a MAX() query expression for the given field
     * @param {string} name - A string which represents a field name
     * // { maxPrice: { $max: 'price' } }
     * let field = new QueryField().max('price').as('maxPrice')
     * @returns {QueryField}
     */
    max(name) {
        //clear object
        Object.clear(this);
        // set aggregate function
        this[name] = { $max: name };
        // return this
        return this;
    }
    /**
     *
     * @param {String=} alias
     * @returns {QueryField|String}
     */
    as(alias) {
        if (typeof alias === 'undefined') {
            if (typeof this.$name !== 'undefined')
                return null;
            let keys = _keys(this);
            if (keys.length === 0)
                return null;

            else
                return keys[0];
        }
        if (typeof alias !== 'string')
            throw new Error('Invalid argument. Expected string');
        ObjectNameValidator.validator.exec(alias, false);
        //get first property
        let prop = Object.key(this);
        if (isNil(prop))
            throw new Error('Invalid object state. Field is not selected.');
        let value = this[prop];
        if (prop !== alias) {
            this[alias] = value;
            delete this[prop];
        }
        return this;
    }
    /**
     * Gets query field name
     * @returns {string}
     */
    getName() {
        let name = null;
        if (typeof this.$name === 'string') {
            name = this.$name;
        }
        else {
            let prop = Object.key(this);
            if (prop) {
                name = this[prop];
            }
        }
        if (typeof name === 'string') {
            //check if an entity is already defined
            let re = new RegExp(QueryField.FieldNameExpression.source);
            if (re.test(name))
                return name;

            else
                return name.split('.')[1];
        }
    }
    nameOf() {

        if ((typeof this === 'string') || (this instanceof String)) {
            return this;
        }
        let alias;
        if (typeof this.as === 'function')
            alias = this.as();

        else
            alias = QueryField.prototype.as.call(this);

        if (alias) {
            return this[alias];
        }
        else {
            return this.$name;
        }
    }
    valueOf() {
        return this.$name;
    }
    /**
     * @param {*} field
     * @returns {QueryField}
     */
    static select(field) {
        return new QueryField(field);
    }
    /**
     * @param name {string}
     * @returns {QueryField}
     */
    static count(name) {
        return new QueryField().count(name);
    }
    /**
     * @param name {string}
     * @returns {QueryField}
     */
    static min(name) {
        return new QueryField().min(name);
    }
    /**
     * @param name {string}
     * @returns {QueryField}
     */
    static max(name) {
        return new QueryField().max(name);
    }
    /**
     * @param name {string}
     * @returns {QueryField}
     */
    static average(name) {
        return new QueryField().average(name);
    }
    /**
     * @param name {string}
     * @returns {QueryField}
     */
    static avg(name) {
        return new QueryField().average(name);
    }
    /**
     * @param name {string}
     * @returns {QueryField}
     */
    static sum(name) {
        return new QueryField().sum(name);
    }
    /**
     * @param {string} name
     * @returns QueryField
     */
    static floor(name) {
        let f = {};
        f[name] = { $floor: [new QueryField(name)] };
        return assign(new QueryField(), f);
    }
    /**
     * @param name {string}
     * @returns {QueryField}
     */
    static ceil(name) {
        let f = {};
        f[name] = { $ceiling: [new QueryField(name)] };
        return assign(new QueryField(), f);
    }
    /**
     * @param {string} name
     * @param {number|*} divider
     * @returns {QueryField}
     */
    static modulo(name, divider) {
        let f = {};
        f[name] = { $mod: [new QueryField(name), divider] };
        return assign(new QueryField(), f);
    }
    /**
     * @param {string} name
     * @param {number|*} x
     * @returns {QueryField}
     */
    static add(name, x) {
        let f = {};
        f[name] = { $add: [new QueryField(name), x] };
        return assign(new QueryField(), f);
    }
    /**
     * @param {string} name
     * @param {number|*} x
     * @returns {QueryField}
     */
    static subtract(name, x) {
        let f = {};
        f[name] = { $subtract: [new QueryField(name), x] };
        return assign(new QueryField(), f);
    }
    /**
     * @param {string} name
     * @param {number|*} divider
     * @returns {QueryField}
     */
    static divide(name, divider) {
        let f = {};
        f[name] = { $divide: [new QueryField(name), divider] };
        return assign(new QueryField(), f);
    }
    /**
     * @param {string} name
     * @param {number|*} multiplier
     * @returns {QueryField}
     */
    static multiply(name, multiplier) {
        let f = {};
        f[name] = { $multiply: [new QueryField(name), multiplier] };
        return assign(new QueryField(), f);
    }
    /**
     * @param {string} name
     * @param {number=} n
     * @returns {QueryField}
     */
    static round(name, n) {
        let f = {};
        f[name] = { $round: [new QueryField(name), typeof n !== 'number' ? n : 2] };
        return assign(new QueryField(), f);
    }
    /**
     * @param name {string}
     * @returns {QueryField}
     */
    static strLength(name) {
        let f = {};
        f[name] = { $length: [new QueryField(name)] };
        return assign(new QueryField(), f);
    }
    /**
     * @param name {string}
     * @returns {QueryField}
     */
    static trim(name) {
        let f = {};
        f[name] = { $trim: [new QueryField(name)] };
        return assign(new QueryField(), f);
    }
    /**
     * @param name {string}
     * @returns {QueryField}
     */
    static year(name) {
        let f = {};
        f[name] = { $year: [new QueryField(name)] };
        return assign(new QueryField(), f);
    }
    /**
     * @param name {string}
     * @returns {QueryField}
     */
    static day(name) {
        let f = {};
        f[name] = { $day: [new QueryField(name)] };
        return assign(new QueryField(), f);
    }
    /**
     * @param name {string}
     * @returns {QueryField}
     */
    static date(name) {
        let f = {};
        f[name] = { $date: [new QueryField(name)] };
        return assign(new QueryField(), f);
    }
    /**
     * @param name {string}
     * @returns {QueryField}
     */
    static hour(name) {
        let f = {};
        f[name] = { $hour: [new QueryField(name)] };
        return assign(new QueryField(), f);
    }
    /**
     * @param name {string}
     * @returns {QueryField}
     */
    static minute(name) {
        let f = {};
        f[name] = { $minute: [new QueryField(name)] };
        return assign(new QueryField(), f);
    }
    /**
     * @param name {string}
     * @returns {QueryField}
     */
    static second(name) {
        let f = {};
        f[name] = { $second: [new QueryField(name)] };
        return assign(new QueryField(), f);
    }
    /**
     * @param name {string}
     * @returns {QueryField}
     */
    static month(name) {
        let f = {};
        f[name] = { $month: [new QueryField(name)] };
        return assign(new QueryField(), f);
    }
}

QueryField.FieldNameExpression = /^[A-Za-z_0-9]+$/;

class QueryFieldComparer {
    constructor() {
        //
    }
    /**
     *
     * @param {*} comparison
     * @returns {*}
     */
    compareWith(comparison) {
        let expr = {};
        if ((typeof this === 'string') || (this instanceof String)) {
            expr[this] = comparison;
            return expr;
        }
        //get aggregate function
        let aggr = Object.key(this), name;
        // compare expression with any value
        /** 
         * e.g. {
         *      $ifNull: [
         *          '$isActive',
         *          false
         *      ]
         * }
         * with {
         *      $ne: true
         * }
         * which should produce an expression like IFNULL(`isActive`, false) <> false
         */
        if (aggr.startsWith('$') && Array.isArray(this[aggr])) {
            // get operator
            let op = Object.key(comparison);
            // and create a new expression e.g. 
            /**
             * {
             *      "$ne": [
             *          $ifNull: [
             *              '$isActive',
             *              false
             *          ],
             *          true
             *      ]
             * }
             */
            expr[op] = [
              this,
              comparison[op]
            ];
            return expr;
          }
        if (isArray(this[aggr])) {
            //get first element (the field name)
            name = QueryField.prototype.nameOf.call(this[aggr][0]);
        }
        else {
            //get element (the field name)
            name = QueryField.prototype.nameOf.call(this[aggr]);
        }
        expr[name] = {};
        expr[name][aggr] = comparison;
        return expr;
    }
}

class QueryFieldRef {
    constructor(entity, name) {
        this[entity] = [name];
    }
}

class QueryValueRef {
    constructor(value) {
        this.$value = value;
    }
}

export {
    QueryFieldRef,
    QueryValueRef,
    QueryExpression,
    QueryField,
    QueryEntity
}

