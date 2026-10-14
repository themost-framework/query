---
title: Building Data Change Statements
summary: Describe insert, update, and delete statements and format them as SQL.
category: Queries
readingTime: 4 minutes
---

# Building Data Change Statements

`QueryExpression` can describe insert, update, and delete statements as well as selects. `SqlFormatter` formats these expressions as SQL. Formatting a statement is not the same as executing it; use an appropriate database adapter when you intend to change data.

## Describe an insert

```js
import { QueryExpression, SqlFormatter } from '@themost/query';

const insert = new QueryExpression()
    .insert({
        name: 'Laptop XLG 15 16GB',
        category: 'Laptops',
        model: 'XLG15',
        price: 1199.99
    })
    .into('ProductBase');

const insertSql = new SqlFormatter().format(insert);
```

`.insert()` describes the values and `.into()` names the target.

## Describe an update

```js
const update = new QueryExpression()
    .update('OrderBase')
    .set({ status: 2 })
    .where('orderDate')
    .lowerThan('2022-10-25');

const updateSql = new SqlFormatter().format(update);
```

An update without an appropriate filter may affect more rows than intended. Review the condition and the formatted SQL before executing a data change.

## Describe a delete

```js
const remove = new QueryExpression()
    .delete('OrderBase')
    .where('id')
    .equal(12020);

const deleteSql = new SqlFormatter().format(remove);
```

As with updates, use a condition that identifies the intended rows and inspect the formatted statement.

## Conclusion

Use `.insert().into()`, `.update().set()`, and `.delete()` to describe data changes. Format each expression to review the resulting SQL, and execute only through the database layer you intend to use.
