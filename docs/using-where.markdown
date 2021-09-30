---
layout: page
title: Using query
permalink: /using-where/
nav_order: 2
---

# Using query expressions

Use `QueryExpression` class to generate a select statement:

    import {QueryExpression, SqlFormatter} from '@themost/query';
    const q = new QueryExpression()
        .select('id', 'name', 'category', 'price', 'model')
        .from('ProductData')
        .where('name').equal('Nikon D7100');
    const sql = new SqlFormatter().format(q);

    ---

    SELECT ProductData.id, ProductData.name, 
    ProductData.category, ProductData.price, ProductData.model 
    FROM ProductData WHERE (name='Nikon D7100')