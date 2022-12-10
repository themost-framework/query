[![npm](https://img.shields.io/npm/v/@themost%2Fquery.svg)](https://www.npmjs.com/package/@themost%2Fquery)
![Dependency status for latest release](https://img.shields.io/librariesio/release/npm/@themost/query)
![GitHub top language](https://img.shields.io/github/languages/top/themost-framework/query)
[![License](https://img.shields.io/npm/l/@themost/query)](https://github.com/themost-framework/themost/blob/master/LICENSE)
![GitHub last commit](https://img.shields.io/github/last-commit/themost-framework/query)
![GitHub Release Date](https://img.shields.io/github/release-date/themost-framework/query)
[![npm](https://img.shields.io/npm/dw/@themost/query)](https://www.npmjs.com/package/@themost%2Fquery)
![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/@themost/query)

![MOST Web Framework Logo](https://github.com/themost-framework/common/raw/master/docs/img/themost_framework_v3_128.png)

# @themost/query
[MOST Web Framework](https://github.com/themost-framework) database-agnostic query module and query language parser of [@themost/data](https://github.com/themost-framework/data)


License: [BSD-3-Clause](https://github.com/themost-framework/themost-query/blob/master/LICENSE)

## Usage

Install @themost/query

    npm i @themost/query

## Data adapters

Use [MOST Web Framework](https://github.com/themost-framework) data adapters and connect with any of the available database engines:

- [MySQL](https://github.com/themost-framework/mysql)
- [MariaDB](https://github.com/themost-framework/mysql)
- [Microsoft Sql Server](https://github.com/themost-framework/mssql)
- [PostgreSQL](https://github.com/themost-framework/pg)
- [SQlite](https://github.com/themost-framework/sqlite)
- [Oracle](https://github.com/themost-framework/oracle)

An example of using `@themost/sqlite#SqliteAdapter` to connect with a SQlite database and querying data:

		import { QueryField } from '@themost/query';
		import { QueryEntity, QueryExpression } from '@themost/query';
		import { SqliteAdapter } from '@themost/sqlite';

		// initialize data connection
		const db = new SqliteAdapter({
            name: 'local',
            database: './db/local.db'
        });
		// get query entity
		const Products = new QueryEntity('ProductData');
		// build query
		const query = new QueryExpression()
			.select((x) => {
				x.id,
				x.name,
				x.category,
				x.price
			})
			.from(Products)
			.take(25);
		// execute query
		const results = await db.executeAsync(query);
		// and close connection
		await db.close();

Features: [SQL Select](#sql-select), [SQL Select From](#sql-select-from),
[SQL Logical Operators](#sql-and-or), [SQL Select Top](#sql-select-top),
[SQL Order By](#sql-order-by), [SQL Group By](#sql-group-by),
[SQL Where](#sql-where), [SQL Insert](#sql-insert), [SQL Update](#sql-update),
[SQL Delete](#sql-delete), [SQL Functions](#sql-functions),
[SQL Date Functions](#sql-date-functions), [SQL String Functions](#sql-string-functions)

## SQL Select

### SQL Select From

Use `QueryExpression` to build SQL select statements:

	const q = new QueryExpression().select('id', 'name',  'category', 'model', 'price')
        .from('ProductData').orderBy('name');
	const SQL = new SqlFormatter().format(q);

SQL > `SELECT ProductData.id, ProductData.name, ProductData.category, ProductData.model, ProductData.price FROM ProductData ORDER BY name ASC`

### SQL And, Or

Use `QueryExpression.and()` and `QueryExpression.or()` to build logical SQL statements

    const q = new QueryExpression().select('id', 'name',  'category', 'model', 'price')
        .where('price').greaterThan(500).and('price').lowerOrEqual(1000)
        .from('ProductData').orderBy('name');
	const SQL = new SqlFormatter().format(q);

SQL > `SELECT ProductData.id, ProductData.name, ProductData.category, ProductData.model, ProductData.price FROM ProductData WHERE ((price>500) AND (price<=1000)) ORDER BY name ASC`

    const q = new QueryExpression().select('id', 'name',  'category', 'model', 'price')
        .where('category').equal('Laptops').or('category').equal('Desktops')
        .from('ProductData').orderBy('name');
	const SQL = new SqlFormatter().format(q);

SQL > `SELECT ProductData.id, ProductData.name, ProductData.category, ProductData.model, ProductData.price FROM ProductData WHERE ((category='Laptops') OR (category='Desktops')) ORDER BY name ASC`

or use javascript closures and build your SQL statement:

	const Products = new QueryEntity('ProductData');
	const q = new QueryExpression().select(function(x) {
            return {
                id: x.id,
                name: x.name,
                category: x.category,
                price: x.price
            }
        }).where(function(x) {
            return x.price > 500 && x.price <= 1000;
        }).from(Products).orderBy(function(x) {
            return {
                price: x.price
            };
        });
	const SQL = new SqlFormatter().format(q);

### SQL Select Top

Use `QueryExpression.take()` and `QueryExpression.skip()` to specify the number of records to return.

	const q = new QueryExpression().select('id', 'name', 'category', 'model','price')
	    .from('ProductData').orderBy('name').take(25).skip(25);
	const SQL = new SqlFormatter().format(q);

SQL > `SELECT ProductData.id, ProductData.name, ProductData.category, ProductData.model, ProductData.price FROM ProductData ORDER BY name ASC LIMIT 25, 25`

### SQL Order By

Use `QueryExpression.orderBy()`, `QueryExpression.thenBy()`, `QueryExpression.thenByDescending()` to sort the result-set in ascending or descending order.

	const q = new QueryExpression().select('id', 'name', 'category', 'model','price')
	    .from('ProductData').orderBy('category').thenByDescending('price');
	const SQL = new SqlFormatter().format(q);

SQL > `SELECT ProductData.id, ProductData.name, ProductData.category, ProductData.model, ProductData.price FROM ProductData ORDER BY category ASC, price DESC`

### SQL Group By

Use `QueryExpression.groupBy()` to group rows that have the same values into summary rows.

	const {QueryExpression, SqlFormatter, QueryEntity, QueryField} = require("@themost/query");
	const Products = new QueryEntity('OrderData').as('ProductData');
	const query = new QueryExpression().select(
		new QueryField().count('id').as('total'),
		new QueryField('category')
		).from(Products).groupBy(
			new QueryField('category')
		);
	const SQL = new SqlFormatter().format(query);

SQL > `SELECT COUNT(id) AS total, category FROM OrderData AS ProductData GROUP BY category`

### SQL Where

Filter records by using comparison operators:

- equal()

		const q = new QueryExpression().select('id', 'name', 'category', 'model','price')
	    	.from('ProductData').where('category').equal('Laptops');

- notEqual()

		const q = new QueryExpression().select('id', 'name', 'category', 'model','price')
	    	.from('ProductData').where('category').notEqual('Desktops');

- greaterThan()

		const q = new QueryExpression().select('id', 'name', 'category', 'model','price')
	    	.from('ProductData').where('price').greaterThan(500);

- lowerThan()

		const q = new QueryExpression().select('id', 'name', 'category', 'model','price')
	    	.from('ProductData').where('price').lowerThan(1000);

- greaterOrEqual()

		const q = new QueryExpression().select('id', 'name', 'category', 'model','price')
	    	.from('ProductData').where('price').greaterOrEqual(500);

- lowerOrEqual()

		const q = new QueryExpression().select('id', 'name', 'category', 'model','price')
	    	.from('ProductData').where('price').lowerOrEqual(1000);

- in()

		const q = new QueryExpression().select('id', 'name', 'category', 'model','price')
	    	.from('ProductData').where('category').in([
				'Laptops',
				'Desktops'
			]);
	SQL > `SELECT ProductData.id, ProductData.name, ProductData.category, ProductData.model, ProductData.price FROM ProductData WHERE (category IN ('Laptops', 'Desktops'))`

- notIn()

		const q = new QueryExpression().select('id', 'name', 'category', 'model','price')
	    	.from('ProductData').where('category').notIn([
				'Laptops',
				'Desktops'
			]);
	SQL > `SELECT ProductData.id, ProductData.name, ProductData.category, ProductData.model, ProductData.price FROM ProductData WHERE (NOT category IN ('Laptops', 'Desktops'))`

## SQL Insert

Use `QueryExpression.insert()` to build SQL insert statements

	const q = new QueryExpression().insert({
		name: 'Laptop XLG 15 16GB',
		category: 'Laptops',
		model: 'XLG15',
		price: 1199.99
	}).into('ProductBase');
	const SQL = new SqlFormatter().format(q);

SQL > `INSERT INTO ProductBase(name, category, model, price) VALUES ('Laptop XLG 15 16GB', 'Laptops', 'XLG15', 1199.99)`

## SQL Update

Use `QueryExpression.update()` to build SQL update statements

	const q = new QueryExpression().update('OrderBase').set({
		status: 2
	}).where('orderDate').lowerThan('2022-10-25');
	const SQL = new SqlFormatter().format(q);

SQL > `UPDATE OrderBase SET status=2 WHERE (orderDate<'2022-10-25')`

## SQL Delete

Use `QueryExpression.delete()` to build SQL delete statements

	const q = new QueryExpression().delete('OrderBase').where('id').equal(12020);
	const SQL = new SqlFormatter().format(q);

SQL > `DELETE FROM OrderBase WHERE (id=12020)`

## SQL Join

Use `QueryExpression.join()`, `QueryExpression.leftJoin()`, `QueryExpression.rightJoin()` to combine rows from two or more tables, based on a related column between them.

	const q = new QueryExpression().select(
		'id',
		'orderDate', 
		'orderStatus',
		new QueryField('name').from('ProductData').as('product')
	).from('OrderData').join('ProductData').with(
		new QueryExpression().where(new QueryField('orderedItem').from('OrderData'))
		.equal(new QueryField('id').from('ProductData'))
	);
	const SQL = new SqlFormatter().format(q);

SQL > `SELECT OrderData.id, OrderData.orderDate, OrderData.orderStatus, ProductData.name AS product FROM OrderData INNER JOIN ProductData ON (OrderData.orderedItem=ProductData.id)`

or use closures:

	const Orders = new QueryEntity('OrderData').as('Orders');
	const Customers = new QueryEntity('PersonData').as('customer');
	const familyName = 'Thomas'
	const q = new QueryExpression().from(Orders).select((x) => {
		return {
			id: x.id,
			orderedItem: x.orderedItem,
			customerFamilyName: x.customer.familyName,
			customerGivenName: x.customer.givenName,
			orderStatus: x.orderStatus
		}
	}).leftJoin(Customers).with((x, y) => {
		return x.customer === y.id;
	}).where((x, familyName) => {
		return x.customer.familyName === familyName;
	}, {
		familyName
	}).orderByDescending((x) => x.orderDate).take(25);
	const SQL = new SqlFormatter().format(q);

SQL > `SELECT Orders.id AS id, Orders.orderedItem AS orderedItem, customer.familyName AS customerFamilyName, customer.givenName AS customerGivenName, Orders.orderStatus AS orderStatus FROM OrderData AS Orders LEFT JOIN PersonData AS customer ON Orders.customer = customer.id WHERE customer.familyName = 'Thomas' ORDER BY Orders.orderDate DESC LIMIT 25`

## SQL Functions

`@themost/query` prototype offers a set of common SQL functions for filtering records.

### add()

	const Products = new QueryEntity('ProductData');
	let query = new QueryExpression()
		.select(function(x) {
			return {
				id: x.id,
				name: x.name,
				category: x.category,
				model: x.model,
				price: x.price,
				newPrice: x.price + 50
			}
		})
		.from(Products)
		.where(function(x) {
			return (x.price + 50) > 500;
		}).take(10)
	.orderByDescending(function(x) { 
		return {orderDate: x.orderDate }; 
	}).take(25);
	const SQL = new SqlFormatter().format(query);
	
SQL > `SELECT ProductData.id AS id, ProductData.name AS name, ProductData.category AS category, ProductData.model AS model, ProductData.price AS price, (ProductData.price + 50) AS newPrice FROM ProductData WHERE (ProductData.price + 50) > 500 ORDER BY ProductData.orderDate DESC LIMIT 25`

### subtract()

	const Products = new QueryEntity('ProductData');
	let query = new QueryExpression()
		.select(function(x) {
			return {
				id: x.id,
				name: x.name,
				category: x.category,
				model: x.model,
				price: x.price,
				newPrice: x.price - 100
			}
		})
		.from(Products)
		.where(function(x) {
			return (x.price - 100) > 500;
		}).take(10)
	.orderByDescending(function(x) { 
		return {orderDate: x.orderDate }; 
	}).take(25);
	const SQL = new SqlFormatter().format(query);

SQL > `SELECT ProductData.id AS id, ProductData.name AS name, ProductData.category AS category, ProductData.model AS model, ProductData.price AS price, (ProductData.price - 100) AS newPrice FROM ProductData WHERE (ProductData.price - 100) > 500 ORDER BY ProductData.orderDate DESC LIMIT 25`

### multiply()

	const Products = new QueryEntity('ProductData');
	let query = new QueryExpression()
		.select((x) => {
			return {
				id: x.id,
				name: x.name,
				category: x.category,
				model: x.model,
				price: x.price,
				newPrice: x.price * 0.75
			}
		})
		.from(Products)
		.where((x) => {
			return x.price > 500;
		})
		.take(10);
		const SQL = new SqlFormatter().format(query);

SQL > `SELECT ProductData.id AS id, ProductData.name AS name, ProductData.category AS category, ProductData.model AS model, ProductData.price AS price, (ProductData.price * 0.75) AS newPrice FROM ProductData WHERE ProductData.price > 500 LIMIT 10`

### divide()

	const Products = new QueryEntity('ProductData');
	let query = new QueryExpression()
    .select((x) => {
        return {
            id: x.id,
            name: x.name,
            category: x.category,
            model: x.model,
            price: x.price,
            newPrice: x.price / 1.5
        }
    })
    .from(Products)
    .where((x) => {
        return x.price > 500;
    })
    .take(10);
	const SQL = new SqlFormatter().format(query);

SQL > `SELECT ProductData.id AS id, ProductData.name AS name, ProductData.category AS category, ProductData.model AS model, ProductData.price AS price, (ProductData.price / 1.5) AS newPrice FROM ProductData WHERE ProductData.price > 500 LIMIT 10`

### floor()

The floor() function always rounds down and returns the largest integer less than or equal to a given number.

	const Products = new QueryEntity('ProductData');
	let query = new QueryExpression()
    .select((x) => {
        x.id,
        x.name,
        x.category,
        x.model,
        x.price
    })
    .from(Products)
    .where((x) => {
        return Math.floor(x.price) === 877;
    })
    .orderBy((x) => x.price)
    .take(10);
	const SQL = new SqlFormatter().format(query);

SQL > `SELECT ProductData.id, ProductData.name, ProductData.category, ProductData.model, ProductData.price FROM ProductData WHERE FLOOR(ProductData.price) = 877 ORDER BY ProductData.price ASC LIMIT 10`

### ceil()

The ceil() function always rounds up and returns the smaller integer greater than or equal to a given number.

	const Products = new QueryEntity('ProductData');
	let query = new QueryExpression()
    .select((x) => {
        return {
            id: x.id,
            name: x.name,
            category: x.category,
            model: x.model,
            price: x.price,
            alternatePrice: Math.ceil(x.price)
        }
    })
    .from(Products)
    .where((x) => {
        return Math.ceil(x.price) === 878;
    })
    .orderBy((x) => x.price)
    .take(10);
	const SQL = new SqlFormatter().format(query);

SQL > `SELECT ProductData.id AS id, ProductData.name AS name, ProductData.category AS category, ProductData.model AS model, ProductData.price AS price, CEILING(ProductData.price) AS alternatePrice FROM ProductData WHERE CEILING(ProductData.price) = 878 ORDER BY ProductData.price ASC LIMIT 10`

### round()

The round() function returns the value of a number rounded to the nearest number.

	const {QueryExpression, SqlFormatter, QueryEntity, QueryField, round} = require("@themost/query");
	const Products = new QueryEntity('ProductData');
	let query = new QueryExpression()
		.select((x) => {
			return {
				id: x.id,
				name: x.name,
				category: x.category,
				model: x.model,
				price: x.price,
				newPrice: round(x.price, 1)
			}
		})
		.from(Products)
		.where((x) => {
			return x.price > 500;
		})
		.take(10);
	const SQL = new SqlFormatter().format(query);

SQL > `SELECT ProductData.id AS id, ProductData.name AS name, ProductData.category AS category, ProductData.model AS model, ProductData.price AS price, ROUND(ProductData.price,1) AS newPrice FROM ProductData WHERE ProductData.price > 500 LIMIT 10`

### max()

The max() function returns the largest value of the selected column.

	const {QueryExpression, SqlFormatter, QueryEntity, QueryField, round, max} = require("@themost/query");
	const Products = new QueryEntity('ProductData');
	let query = new QueryExpression()
		.select((x) => {
			return {
				maxPrice: max(x.price)
			}
		})
		.from(Products)
		.where((x) => {
			return x.category === 'Laptops';
		})
		.take(1);

SQL > `SELECT MAX(ProductData.price) AS maxPrice FROM ProductData WHERE ProductData.category = 'Laptops' LIMIT 1`

### min()

The min() function returns the smallest value of the selected column.

	onst {QueryExpression, SqlFormatter, QueryEntity, QueryField, min} = require("@themost/query");
	const Products = new QueryEntity('ProductData');
	let query = new QueryExpression()
		.select((x) => {
			return {
				minPrice: min(x.price)
			}
		})
		.from(Products)
		.where((x) => {
			return x.category === 'Laptops';
		})
		.take(1);
	const SQL = new SqlFormatter().format(query);

SQL > `SELECT MIN(ProductData.price) AS minPrice FROM ProductData WHERE ProductData.category = 'Laptops' LIMIT 1`

### count()

The count() function returns the number of rows that matches a specified criteria.

	const {QueryExpression, SqlFormatter, QueryEntity, QueryField, count} = require("@themost/query");
	const Products = new QueryEntity('ProductData');
	let query = new QueryExpression()
		.select((x) => {
			return {
				category: x.category,
				total: count(x.id)
			}
		})
		.from(Products)
		.groupBy((x) => x.category);
	const SQL = new SqlFormatter().format(query);

SQL > `SELECT ProductData.category AS category, COUNT(ProductData.id) AS total FROM ProductData GROUP BY ProductData.category`

### avg()

The avg() function returns the average value of a numeric column. 

	const {QueryExpression, SqlFormatter, QueryEntity, QueryField, round, avg} = require("@themost/query");
	const Products = new QueryEntity('ProductData');
	let query = new QueryExpression()
		.select((x) => {
			return {
				avgPrice: round(avg(x.price),2)
			}
		})
		.from(Products)
		.where((x) => {
			return x.category === 'Laptops';
		})
		.take(1);
	const SQL = new SqlFormatter().format(query);

SQL > `SELECT ROUND(AVG(ProductData.price),2) AS avgPrice FROM ProductData WHERE ProductData.category = 'Laptops' LIMIT 1`

### sum()

The sum() function returns the total sum of a numeric column. 

	const {QueryExpression, SqlFormatter, QueryEntity, QueryField, round, sum} = require("@themost/query");
	const Orders = new QueryEntity('OrderData');
	const Products = new QueryEntity('ProductData').as('orderedItem');
	let query = new QueryExpression()
		.select((x) => {
			return {
				total: round(sum(x.orderedItem.price),2)
			}
		})
		.from(Orders)
		.join(Products).with((x, y) => {
			return x.orderedItem === y.id;
		})
		.where((x) => {
			return x.orderedItem.category === 'Laptops';
		})
		.take(1);
	const SQL = new SqlFormatter().format(query);

SQL > `SELECT ROUND(SUM(orderedItem.price),2) AS total FROM OrderData INNER JOIN ProductData AS orderedItem ON OrderData.orderedItem = orderedItem.id WHERE orderedItem.category = 'Laptops' LIMIT 1`

## SQL Date Functions

### getFullYear()

The getFullYear() method returns the year of the specified date according to local time.

	const {QueryExpression, SqlFormatter, QueryEntity, QueryField, round, sum} = require("@themost/query");
	const Orders = new QueryEntity('OrderData');
	const Products = new QueryEntity('ProductData').as('orderedItem');
	let query = new QueryExpression()
		.select((x) => {
			return {
				total: round(sum(x.orderedItem.price),2)
			}
		})
		.from(Orders)
		.join(Products).with((x, y) => {
			return x.orderedItem === y.id;
		})
		.where((x) => {
			return x.orderedItem.category === 'Laptops' &&
				x.orderDate.getFullYear() === 2019
		});
	const SQL = new SqlFormatter().format(query);

SQL > `SELECT ROUND(SUM(orderedItem.price),2) AS total FROM OrderData INNER JOIN ProductData AS orderedItem ON OrderData.orderedItem = orderedItem.id WHERE (orderedItem.category = 'Laptops' AND YEAR(OrderData.orderDate) = 2019)`

### getMonth()

The getMonth() method returns the month in the specified date according to local time

	const {QueryExpression, SqlFormatter, QueryEntity, QueryField, count} = require("@themost/query");
	const Orders = new QueryEntity('OrderData');
	const Products = new QueryEntity('ProductData').as('orderedItem');
	let query = new QueryExpression()
		.select((x) => {
			return {
				month: x.orderDate.getMonth(),
				total: count(x.id)
			}
		})
		.from(Orders)
		.groupBy((x) => x.orderDate.getMonth())
		.where((x) => {
			return x.orderDate.getFullYear() === 2019;
		});
	const SQL = new SqlFormatter().format(query);

SQL > `SELECT MONTH(OrderData.orderDate) AS month, COUNT(OrderData.id) AS total FROM OrderData WHERE YEAR(OrderData.orderDate) = 2019 GROUP BY MONTH(OrderData.orderDate)`

### getDate()

The getDate() method returns the day of the month for the specified date according to local time.

	const {QueryExpression, SqlFormatter, QueryEntity, QueryField, count} = require("@themost/query");
	const Orders = new QueryEntity('OrderData');
	const Products = new QueryEntity('ProductData').as('orderedItem');
	let query = new QueryExpression()
		.select((x) => {
			return {
				dayOfMonth: x.orderDate.getDate(),
				total: count(x.id)
			}
		})
		.from(Orders)
		.groupBy((x) => x.orderDate.getDate())
		.where((x) => {
			return x.orderDate.getFullYear() === 2019 && x.orderDate.getMonth() === 1;
		});
	const SQL = new SqlFormatter().format(query);

SQL > `SELECT DAY(OrderData.orderDate) AS dayOfMonth, COUNT(OrderData.id) AS total FROM OrderData WHERE (YEAR(OrderData.orderDate) = 2019 AND MONTH(OrderData.orderDate) = 1) GROUP BY DAY(OrderData.orderDate)`

### getHours()

The getHours() method returns the hour for the specified date, according to local time.

	const {QueryExpression, SqlFormatter, QueryEntity, QueryField, count} = require("@themost/query");
	const Orders = new QueryEntity('OrderData');
	let query = new QueryExpression()
		.select((x) => {
			return {
				hours: x.orderDate.getHours(),
				minutes: x.orderDate.getMinutes(),
				seconds: x.orderDate.getSeconds(),
			}
		})
		.from(Orders)
		.where((x) => {
			return x.orderDate.getFullYear() === 2019 && x.orderDate.getMonth() === 1;
		});
	const SQL = new SqlFormatter().format(query);

SQL > `SELECT HOUR(OrderData.orderDate) AS hours, MINUTE(OrderData.orderDate) AS minutes, SECOND(OrderData.orderDate) AS seconds FROM OrderData WHERE (YEAR(OrderData.orderDate) = 2019 AND MONTH(OrderData.orderDate) = 1)`

### getMinutes()

The getMinutes() method returns the minutes in the specified date according to local time.

	const {QueryExpression, SqlFormatter, QueryEntity, QueryField, count} = require("@themost/query");
	const Orders = new QueryEntity('OrderData');
	let query = new QueryExpression()
		.select((x) => {
			return {
				hours: x.orderDate.getHours(),
				minutes: x.orderDate.getMinutes(),
				seconds: x.orderDate.getSeconds(),
			}
		})
		.from(Orders)
		.where((x) => {
			return x.orderDate.getFullYear() === 2019 && x.orderDate.getMonth() === 1;
		});
	const SQL = new SqlFormatter().format(query);

SQL > `SELECT HOUR(OrderData.orderDate) AS hours, MINUTE(OrderData.orderDate) AS minutes, SECOND(OrderData.orderDate) AS seconds FROM OrderData WHERE (YEAR(OrderData.orderDate) = 2019 AND MONTH(OrderData.orderDate) = 1)`

### getSeconds()

The getSeconds() method returns the seconds in the specified date according to local time.

	const {QueryExpression, SqlFormatter, QueryEntity, QueryField, count} = require("@themost/query");
	const Orders = new QueryEntity('OrderData');
	let query = new QueryExpression()
		.select((x) => {
			return {
				hours: x.orderDate.getHours(),
				minutes: x.orderDate.getMinutes(),
				seconds: x.orderDate.getSeconds(),
			}
		})
		.from(Orders)
		.where((x) => {
			return x.orderDate.getFullYear() === 2019 && x.orderDate.getMonth() === 1;
		});
	const SQL = new SqlFormatter().format(query);

SQL > `SELECT HOUR(OrderData.orderDate) AS hours, MINUTE(OrderData.orderDate) AS minutes, SECOND(OrderData.orderDate) AS seconds FROM OrderData WHERE (YEAR(OrderData.orderDate) = 2019 AND MONTH(OrderData.orderDate) = 1)`

## SQL String Functions

### startsWith()

The startsWith() method determines whether a string begins with the characters of a specified string, returning true or false as appropriate.

	const {QueryExpression, SqlFormatter, QueryEntity} = require("@themost/query");
	const People = new QueryEntity('PersonData');
	let query = new QueryExpression()
		.select((x) => {
			x.id,
			x.familyName,
			x.givenName,
			x.email,
			x.dateCreated
		})
		.from(People)
		.where((x) => {
			return x.familyName.startsWith('Cam') === true;
		});
	const SQL = new SqlFormatter().format(query);

SQL > `SELECT PersonData.id, PersonData.familyName, PersonData.givenName, PersonData.email, PersonData.dateCreated FROM PersonData WHERE (PersonData.familyName REGEXP '^Cam') = true`

### endsWith()

The endsWith() method determines whether a string ends with the characters of a specified string, returning true or false as appropriate.

	const {QueryExpression, SqlFormatter, QueryEntity} = require("@themost/query");
	const People = new QueryEntity('PersonData');
	let query = new QueryExpression()
		.select((x) => {
			x.id,
			x.familyName,
			x.givenName,
			x.email,
			x.dateCreated
		})
		.from(People)
		.where((x) => {
			return x.familyName.endsWith('er') === true;
		});
	const SQL = new SqlFormatter().format(query);

SQL > `SELECT PersonData.id, PersonData.familyName, PersonData.givenName, PersonData.email, PersonData.dateCreated FROM PersonData WHERE (PersonData.familyName REGEXP 'er$$') = true`

### includes()

The includes() method performs a search to determine whether one string may be found within another string, returning true or false as appropriate.

	const {QueryExpression, SqlFormatter, QueryEntity} = require("@themost/query");
	const People = new QueryEntity('PersonData');
	let query = new QueryExpression()
		.select((x) => {
			x.id,
			x.familyName,
			x.givenName,
			x.email,
			x.dateCreated
		})
		.from(People)
		.where((x) => {
			return x.givenName.includes('Chris') === true;
		});
	const SQL = new SqlFormatter().format(query);

SQL > `SELECT PersonData.id, PersonData.familyName, PersonData.givenName, PersonData.email, PersonData.dateCreated FROM PersonData WHERE (PersonData.givenName REGEXP 'Chris') = true`

### toUpperCase()

	const {QueryExpression, SqlFormatter, QueryEntity} = require("@themost/query");
	const People = new QueryEntity('PersonData');
	let query = new QueryExpression()
		.select((x) => {
			return {
				id: x.id,
				familyName: x.familyName,
				givenName1: x.givenName.toUpperCase(),
				givenName: x.givenName
			}
		})
		.from(People)
		.where((x) => {
			return x.givenName.toUpperCase() === 'CHRISTOPHER';
		});
	const SQL = new SqlFormatter().format(query);

SQL > `SELECT PersonData.id AS id, PersonData.familyName AS familyName, UPPER(PersonData.givenName) AS givenName1, PersonData.givenName AS givenName FROM PersonData WHERE UPPER(PersonData.givenName) = 'CHRISTOPHER'`

### substr()

	const {QueryExpression, SqlFormatter, QueryEntity} = require("@themost/query");
	const People = new QueryEntity('PersonData');
	let query = new QueryExpression()
	.select((x) => {
		return {
			id: x.id,
			familyName: x.familyName,
			givenName1: x.givenName.substr(0,4),
			givenName: x.givenName
		}
	})
	.from(People)
	.where((x) => {
		return x.givenName.substr(0,4) === 'Chri';
	});
	const SQL = new SqlFormatter().format(query);

SQL > `SELECT PersonData.id AS id, PersonData.familyName AS familyName, SUBSTRING(PersonData.givenName,1,4) AS givenName1, PersonData.givenName AS givenName FROM PersonData WHERE SUBSTRING(PersonData.givenName,1,4) = 'Chri'`

### concat()

The concat() method concatenates the string arguments to the calling string and returns a new string.

	const {QueryExpression, SqlFormatter, QueryEntity} = require("@themost/query");
	const People = new QueryEntity('PersonData');
	let query = new QueryExpression()
		.select((x) => {
			return {
				id: x.id,
				familyName: x.familyName,
				givenName: x.givenName,
				name: x.givenName.concat(' ', x.familyName)
			}
		})
		.from(People)
		.where((x) => {
			return x.givenName.indexOf('Chri') >= 0;
		});
	const SQL = new SqlFormatter().format(query);

SQL > `SELECT PersonData.id AS id, PersonData.familyName AS familyName, PersonData.givenName AS givenName, CONCAT(PersonData.givenName, ' ', PersonData.familyName) AS name FROM PersonData WHERE (LOCATE('Chri',PersonData.givenName)-1) >= 0`

### indexOf()

The indexOf() method, given one argument: a substring to search for, searches the entire calling string, and returns the index of the first occurrence of the specified substring.

	const {QueryExpression, SqlFormatter, QueryEntity} = require("@themost/query");
	const People = new QueryEntity('PersonData');
	let query = new QueryExpression()
		.select((x) => {
			return {
				id: x.id,
				familyName: x.familyName,
				givenName: x.givenName
			}
		})
		.from(People)
		.where((x) => {
			return x.givenName.indexOf('Chri') >= 0;
		});
	const SQL = new SqlFormatter().format(query);

SQL > `SELECT PersonData.id AS id, PersonData.familyName AS familyName, PersonData.givenName AS givenName FROM PersonData WHERE (LOCATE('Chri',PersonData.givenName)-1) >= 0`



## Development

    git clone http://github.com/themost-framework/query.git
