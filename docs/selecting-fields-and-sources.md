---
index: 200
title: Selecting Fields and Sources
summary: Choose which fields to return and identify the entity that supplies them.
category: Queries
readingTime: 3 minutes
---

# Selecting Fields and Sources

A useful query identifies both the values to return and the source entity to read. In `@themost/query`, use `.select()` for the requested fields and `.from()` for the source.

## Select named fields

Pass field names to `.select()` when you want a straightforward selection:

```js
import { QueryExpression, SqlFormatter } from '@themost/query';

const query = new QueryExpression()
    .select('id', 'name', 'category', 'price')
    .from('ProductData');

const sql = new SqlFormatter().format(query);
```

For these names, the SQL formatter generates a selection qualified by `ProductData`, such as `SELECT ProductData.id, ProductData.name, ProductData.category, ProductData.price FROM ProductData`.

## Describe fields with a closure

Closures can make the selected fields explicit and give the result columns useful names:

```js
import { QueryEntity, QueryExpression, SqlFormatter } from '@themost/query';

const Products = new QueryEntity('ProductData');
const query = new QueryExpression()
    .select((x) => {
        return {
            id: x.id,
            productName: x.name,
            price: x.price
        };
    })
    .from(Products);

const sql = new SqlFormatter().format(query);
```

Here, `productName` is the output name for the selected `name` field. The closure parameter `x` represents the entity fields while the query is being described; it is not a product record to read in application code.

## Name the source

`.from()` accepts a string, a `QueryEntity`, or another `QueryExpression`. Using `QueryEntity` is helpful when you want to refer to the source by a variable or give it an alias:

```js
const Products = new QueryEntity('ProductData').as('p');
const query = new QueryExpression()
    .select('id', 'name')
    .from(Products);
```

`QueryEntity.as()` is also used to alias sources in joins, covered later in this guide.

## Conclusion

Use `.select()` to specify the output fields and `.from()` to identify their source. Start with string field names for simple selections, and use a returned object in a closure when you need clearer output names.
