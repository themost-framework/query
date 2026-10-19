---
index: 600
title: Joining Related Entities
summary: Combine rows from related sources with an inner join or a left join.
category: Queries
readingTime: 4 minutes
---

# Joining Related Entities

A join lets a query use fields from more than one entity. `QueryExpression` provides `.join()` for an inner join and `.leftJoin()` for a left join. Use `.with()` to describe how the rows are related.

## Build a join with closures

The following example joins orders to people through the order's `customer` field:

```js
import { QueryEntity, QueryExpression, SqlFormatter } from '@themost/query';

const Orders = new QueryEntity('OrderData').as('Orders');
const Customers = new QueryEntity('PersonData').as('customer');

const query = new QueryExpression()
    .from(Orders)
    .select((x) => {
        return {
            id: x.id,
            orderStatus: x.orderStatus,
            customerFamilyName: x.customer.familyName
        };
    })
    .leftJoin(Customers)
    .with((order, customer) => {
        return order.customer === customer.id;
    });

const sql = new SqlFormatter().format(query);
```

The aliases make the two roles clear: the query source is `Orders`, and the joined entity is `customer`. The relation in `.with()` compares the order's customer identifier with the joined person's identifier.

## Choose inner or left joins

Use `.join()` when you want matching rows from both sources. Use `.leftJoin()` when the query should retain rows from the left-hand source even when the joined side has no match. The joined fields are selected through the same closure syntax used for regular selections.

## Conclusion

Create a `QueryEntity` for each source, optionally give each an alias with `.as()`, and define the relationship in `.with()`. Pick `.join()` or `.leftJoin()` according to whether unmatched rows from the main source should remain.
