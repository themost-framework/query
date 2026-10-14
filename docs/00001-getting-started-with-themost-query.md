---
title: Getting Started with @themost/query
summary: Learn what @themost/query does, install it, and build your first query expression.
category: Getting Started
readingTime: 3 minutes
---

# Getting Started with @themost/query

`@themost/query` lets you describe database queries in JavaScript. Build a query with `QueryExpression`, then format it as SQL with `SqlFormatter`. A database adapter, such as `@themost/sqlite`, is used when you want to execute a query.

## Install the package

```sh
npm install @themost/query
```

## Build a first query

```js
import { QueryEntity, QueryExpression, SqlFormatter } from '@themost/query';

const Products = new QueryEntity('ProductData');
const query = new QueryExpression()
    .select((x) => {
        return {
            id: x.id,
            name: x.name,
            price: x.price
        };
    })
    .from(Products)
    .where((x) => {
        return x.price > 500;
    })
    .take(10);

const sql = new SqlFormatter().format(query);
console.log(sql);
```

The query selects three fields from `ProductData`, filters out products priced at 500 or less, and limits the result to ten rows. `format()` produces a SQL string; it does not connect to a database or execute the query.

## The basic building blocks

- `QueryExpression` is the query you construct by chaining methods.
- `QueryEntity` names a source entity, such as `ProductData`.
- `SqlFormatter` turns the expression into SQL.

The following articles explore these building blocks one step at a time.

## Conclusion

Start with a `QueryExpression`, describe the fields and source you need, and format it with `SqlFormatter` to inspect the resulting SQL. To retrieve data, connect the query to a compatible database adapter.
