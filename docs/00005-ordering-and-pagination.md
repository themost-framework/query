---
title: Ordering and Paging Query Results
summary: Sort query results and limit them to a manageable page of rows.
category: Queries
readingTime: 3 minutes
---

# Ordering and Paging Query Results

Sorting and paging help make query results predictable and practical to display. Add ordering and page-size methods to a `QueryExpression` before formatting or executing it.

## Sort the results

`.orderBy()` sorts in ascending order. Use `.orderByDescending()` for descending order:

```js
import { QueryExpression, SqlFormatter } from '@themost/query';

const query = new QueryExpression()
    .select('id', 'name', 'category', 'price')
    .from('ProductData')
    .orderBy('category')
    .thenByDescending('price');

const sql = new SqlFormatter().format(query);
```

This sorts first by category ascending, then by price descending within each category. Use `.thenBy()` and `.thenByDescending()` to add subsequent sort keys.

## Limit results with take and skip

Use `.take(n)` to limit the number of rows and `.skip(n)` to offset the start of the result page:

```js
const pageSize = 25;
const pageNumber = 2;

const query = new QueryExpression()
    .select('id', 'name', 'price')
    .from('ProductData')
    .orderBy('name')
    .take(pageSize)
    .skip((pageNumber - 1) * pageSize);
```

The ordering makes the page order explicit. In this example, page two skips the first 25 rows and requests the next 25.

## Conclusion

Add an ordering that reflects the order you want users to see, then use `.take()` and `.skip()` to describe a page. Keep the sort consistent between pages so that results are easier to navigate.
