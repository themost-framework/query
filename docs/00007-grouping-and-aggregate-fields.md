---
title: Grouping Query Results
summary: Group matching values and select aggregate values such as a count.
category: Queries
readingTime: 4 minutes
---

# Grouping Query Results

Grouping turns rows with shared values into groups. It is useful when you want a summary, such as the number of orders for each product. `QueryExpression.groupBy()` defines the grouping fields, and aggregate helpers such as `count()` can be selected.

## Count orders for each product

```js
import { QueryEntity, QueryExpression, SqlFormatter, count } from '@themost/query';

const Orders = new QueryEntity('OrderData');
const Products = new QueryEntity('ProductData').as('orderedItem');

const query = new QueryExpression()
    .select((x) => {
        return {
            total: count(x.id),
            product: x.orderedItem.name
        };
    })
    .from(Orders)
    .join(Products)
    .with((order, product) => {
        return order.orderedItem === product.id;
    })
    .groupBy((x) => x.orderedItem.name);

const sql = new SqlFormatter().format(query);
```

`count(x.id)` describes an aggregate field; `groupBy()` ensures that the count is calculated for each product name instead of for the whole result set.

## Keep selected fields aligned with grouping

When building a grouped selection, select the grouping field and aggregate values that summarize each group. The package also provides aggregate `QueryField` helpers such as `sum`, `min`, `max`, and `average`, as well as the `count` helper.

## Conclusion

Use `.groupBy()` to define which values make a group, then select those values alongside aggregate calculations. Add a join when the field you want to group by belongs to a related entity.
