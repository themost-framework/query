---
index: 300
title: Filtering Results with Where
summary: Filter query results using closure comparisons or QueryExpression comparison methods.
category: Queries
readingTime: 3 minutes
---

# Filtering Results with Where

Use `.where()` to restrict which rows a query describes. You can pass a JavaScript closure or build a comparison with a field name and a comparison method.

## Compare fields in a closure

```js
import { QueryEntity, QueryExpression, SqlFormatter } from '@themost/query';

const Products = new QueryEntity('ProductData');
const query = new QueryExpression()
    .select('id', 'name', 'price')
    .from(Products)
    .where((x) => {
        return x.price > 500;
    });

const sql = new SqlFormatter().format(query);
```

The closure describes the condition `price > 500`; it is interpreted as part of the query rather than run against a JavaScript object.

## Use comparison methods

For a single field, `.where('fieldName')` can be followed by a comparison method:

```js
const query = new QueryExpression()
    .select('id', 'name', 'price')
    .from('ProductData')
    .where('price')
    .greaterThan(500);
```

Comparison methods include `.equal()`, `.notEqual()`, `.greaterThan()`, `.greaterOrEqual()`, `.lowerThan()`, `.lowerOrEqual()`, `.in()`, and `.notIn()`.

For example, to match one of a set of categories:

```js
const query = new QueryExpression()
    .select('id', 'name', 'category')
    .from('ProductData')
    .where('category')
    .in(['Laptops', 'Desktops']);
```

## Keep filtering in the query

When formatting a query, `SqlFormatter` converts its condition into SQL. When executing through an adapter, the condition is part of the query sent to that data layer. This is preferable to fetching every row and filtering the results in application code.

## Conclusion

Use `.where()` with a closure to express a comparison naturally, or use a field and comparison method for a concise condition. Choose the approach that makes the condition easiest to understand.
