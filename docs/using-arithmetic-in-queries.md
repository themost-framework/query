---
index: 800
title: Using Arithmetic in Queries
summary: Describe calculated fields and numeric filters using closure expressions.
category: Queries
readingTime: 3 minutes
---

# Using Arithmetic in Queries

Closures can describe numeric expressions in both selected fields and filters. This lets a query calculate a value, such as a price after a discount, without manually assembling a SQL string.

## Select a calculated field

```js
import { QueryEntity, QueryExpression, SqlFormatter } from '@themost/query';

const Products = new QueryEntity('ProductData');
const query = new QueryExpression()
    .select((x) => {
        return {
            id: x.id,
            name: x.name,
            price: x.price,
            discountedPrice: x.price * 0.75
        };
    })
    .from(Products);

const sql = new SqlFormatter().format(query);
```

The selected `discountedPrice` field describes multiplying the stored price by `0.75`. It does not update the stored product price.

## Filter using a calculation

The same arithmetic operators can be used in a condition:

```js
const query = new QueryExpression()
    .select('id', 'name', 'price')
    .from('ProductData')
    .where((x) => {
        return (x.price - 100) > 500;
    });
```

Arithmetic expressions available through closures include addition, subtraction, multiplication, and division. The query formatter maps supported expressions into SQL syntax.

## Conclusion

Use arithmetic in a selection when you want a calculated output value, or in `.where()` when you need to filter based on a calculation. Calculated fields describe query output; they do not change the underlying data.
