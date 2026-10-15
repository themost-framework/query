---
title: Formatting and Executing Queries
summary: Understand the difference between generating SQL and running a query with a database adapter.
category: Getting Started
readingTime: 4 minutes
---

# Formatting and Executing Queries

`@themost/query` builds query expressions and formats them. It does not create a database connection. To run a query, use a compatible adapter; for example, the framework's SQLite adapter can execute a `QueryExpression`.

## Format SQL for inspection

```js
import { QueryExpression, SqlFormatter } from '@themost/query';

const query = new QueryExpression()
    .select('id', 'name')
    .from('ProductData')
    .orderBy('name')
    .take(25);

const sql = new SqlFormatter().format(query);
console.log(sql);
```

Formatting is useful for inspecting the query representation. The resulting text is SQL; `.format()` itself does not fetch rows.

## Execute through an adapter

Install the SQLite adapter separately if you want to run a query against SQLite:

```sh
npm install @themost/query @themost/sqlite
```

Then create the adapter, pass it a query, and close it when finished:

```js
import { QueryEntity, QueryExpression } from '@themost/query';
import { SqliteAdapter } from '@themost/sqlite';

const db = new SqliteAdapter({
    name: 'local',
    database: './db/local.db'
});

const Products = new QueryEntity('ProductData');
const query = new QueryExpression()
    .select('id', 'name', 'price')
    .from(Products)
    .take(25);

const results = await db.executeAsync(query);
await db.close();
```

This example assumes that the database file and `ProductData` table are available. The query package describes the request; the adapter provides the database connection and execution.

## Conclusion

Use `SqlFormatter` to produce SQL for inspection, and use a database adapter when you need results or data changes. Keep query construction, formatting, and database execution conceptually separate as you build your application.
