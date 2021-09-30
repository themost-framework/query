---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: home
title: Getting started
nav_order: 1
---

@themost/query introduces a comprehensive set of tools and classes for querying data against any database engine.

The following instance of QueryExpression

    const {QueryExpression, SqlFormatter} = require("@themost/query")
    const query = new QueryExpression().from('UserData')
        .select('id', 'name', 'dateCreated')
        .where('name').equal('alexis.rees@example.com');
    const sql = new SqlFormatter().format(query);

produces this equivalent SQL statement:

    SELECT UserData.id, UserData.name, UserData.dateCreated 
        FROM UserData WHERE (name='alexis.rees@example.com')

## Using dialects

@themost/query comes with different dialects for each one of the well-known database engines

### Sqlite

        const {QueryExpression} = require("@themost/query")
        const {SqliteFormatter} = require("@themost/sqlite")
        const query = new QueryExpression().from('ProductData')
                .select('id', 'name', 'price')
                .where('category').equal('Laptops')
                .orderBy('price').take(10);
        const sql = new SqliteFormatter().format(query);

        SELECT `ProductData`.`id` AS `id`, 
        `ProductData`.`name` AS `name`, `ProductData`.`price` AS `price` 
        FROM `ProductData` WHERE (`category`='Laptops') 
        ORDER BY `price` ASC LIMIT 10

### Microsoft SQL Server

        const {QueryExpression} = require("@themost/query")
        const {MySqlFormatter} = require("@themost/mysql")
        const query = new QueryExpression().from('ProductData')
                .select('id', 'name', 'price')
                .where('category').equal('Laptops')
                .orderBy('price').take(10);
        const sql = new MySqlFormatter().format(query);        

        SELECT `ProductData`.`id` AS `id`, `ProductData`.`name` AS `name`,
        `ProductData`.`price` AS `price` 
            FROM `ProductData` WHERE (`category`='Laptops') 
            ORDER BY `price` ASC LIMIT 10

### MySQL and MariaDB

        const {QueryExpression} = require("@themost/query")
        const {MSSqlFormatter} = require("@themost/mssql")
        const query = new QueryExpression().from('ProductData')
                .select('id', 'name', 'price')
                .where('category').equal('Laptops')
                .orderBy('price').take(10);
        const sql = new MSSqlFormatter().format(query);    

        SELECT [id], [name], [price] FROM (SELECT [ProductData].[id], 
        [ProductData].[name], [ProductData].[price], 
        ROW_NUMBER() OVER( ORDER BY [price] ASC) AS [__RowIndex] 
            FROM [ProductData] WHERE ([category]='Laptops')) t0 
            WHERE __RowIndex BETWEEN 1 AND 10

### PostgreSQL

        const {QueryExpression} = require("@themost/query")
        const {PGSqlFormatter} = require("@themost/pg")
        const query = new QueryExpression().from('ProductData')
                .select('id', 'name', 'price')
                .where('category').equal('Laptops')
                .orderBy('price').take(10);
        const sql = new PGSqlFormatter().format(query);   

        SELECT "ProductData"."id", "ProductData"."name", "ProductData"."price" 
        FROM "ProductData" WHERE ("category"='Laptops') 
        ORDER BY "price" ASC LIMIT 10

### Oracle

        const {QueryExpression} = require("@themost/query")
        const {OracleFormatter} = require("@themost/oracle")
        const query = new QueryExpression().from('ProductData')
                .select('id', 'name', 'price')
                .where('category').equal('Laptops')
                .orderBy('price').take(10);
        const sql = new OracleFormatter().format(query);  

        SELECT "ProductData"."id", "ProductData"."name", "ProductData"."price" 
        FROM "ProductData" WHERE ("category"='Laptops') 
        ORDER BY "price" ASC LIMIT 10

### H2

        const {QueryExpression} = require("@themost/query")
        const {OracleFormatter} = require("@themost/h2")
        const query = new QueryExpression().from('ProductData')
                .select('id', 'name', 'price')
                .where('category').equal('Laptops')
                .orderBy('price').take(10);
        const sql = new H2Formatter().format(query);  

        SELECT "ProductData"."id", "ProductData"."name", "ProductData"."price" 
        FROM "ProductData" WHERE ("category"='Laptops') 
        ORDER BY "price" ASC LIMIT 10