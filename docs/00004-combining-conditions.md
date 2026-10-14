---
title: Combining Query Conditions
summary: Combine query comparisons with AND and OR to express common filters.
category: Queries
readingTime: 3 minutes
---

# Combining Query Conditions

Real-world filters often need more than one comparison. `QueryExpression` supports `.and()` and `.or()` for chaining conditions, and closures can also use JavaScript `&&` and `||`.

## Require all conditions with AND

This query selects products priced above 500 and no more than 1000:

```js
import { QueryExpression, SqlFormatter } from '@themost/query';

const query = new QueryExpression()
    .select('id', 'name', 'price')
    .from('ProductData')
    .where('price').greaterThan(500)
    .and('price').lowerOrEqual(1000);

const sql = new SqlFormatter().format(query);
```

Both comparisons must match for the row to be included.

The same idea can be expressed as a closure:

```js
const query = new QueryExpression()
    .select('id', 'name', 'price')
    .from('ProductData')
    .where((x) => {
        return x.price > 500 && x.price <= 1000;
    });
```

## Match either condition with OR

Use `.or()` when either comparison may match:

```js
const query = new QueryExpression()
    .select('id', 'name', 'category')
    .from('ProductData')
    .where('category').equal('Laptops')
    .or('category').equal('Desktops');
```

The closure form uses `||`:

```js
const query = new QueryExpression()
    .select('id', 'name', 'category')
    .from('ProductData')
    .where((x) => {
        return x.category === 'Laptops' || x.category === 'Desktops';
    });
```

## Choose the right logic

Use AND when every condition must be true. Use OR when any one condition is enough. Keep related conditions together in a single closure or comparison chain so that the intended logic is easy to review.

## Conclusion

`&&` and `.and()` express requirements that must all match; `||` and `.or()` express alternatives. Format the query with `SqlFormatter` when you want to inspect how its conditions translate to SQL.
