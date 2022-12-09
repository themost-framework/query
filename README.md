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
[MOST Web Framework](https://github.com/themost-framework/themost) database-agnostic query module


License: [BSD-3-Clause](https://github.com/themost-framework/themost-query/blob/master/LICENSE)

## Usage

Install @themost/query

    npm i @themost/query

## SQL Select

### SQL Select From

Use `QueryExpression` to build SQL select statements:

	const q = new QueryExpression().select('id', 'name',  'category', 'model', 'price')
        .from('ProductData').orderBy('name')

SQL > `SELECT ProductData.id, ProductData.name, ProductData.category, ProductData.model, ProductData.price FROM ProductData ORDER BY name ASC`

### SQL And, Or

Use `QueryExpression.and()` and `QueryExpression.or()` to build logical SQL statements

    const q = new QueryExpression().select('id', 'name',  'category', 'model', 'price')
        .where('price').greaterThan(500).and('price').lowerOrEqual(1000)
        .from('ProductData').orderBy('name');

SQL > `SELECT ProductData.id, ProductData.name, ProductData.category, ProductData.model, ProductData.price FROM ProductData WHERE ((price>500) AND (price<=1000)) ORDER BY name ASC`

    const q = new QueryExpression().select('id', 'name',  'category', 'model', 'price')
        .where('category').equal('Laptops').or('category').equal('Desktops')
        .from('ProductData').orderBy('name');

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

### SQL Select Top

Use `QueryExpression.take()` and `QueryExpression.skip()` to specify the number of records to return.

	const q = new QueryExpression().select('id', 'name', 'category', 'model','price')
	    .from('ProductData').orderBy('name').take(25).skip(25);

SQL > `SELECT ProductData.id, ProductData.name, ProductData.category, ProductData.model, ProductData.price FROM ProductData ORDER BY name ASC LIMIT 25, 25`

### SQL Order by

Use `QueryExpression.orderBy()`, `QueryExpression.thenBy()`, `QueryExpression.thenByDescending()` to sort the result-set in ascending or descending order.

	const q = new QueryExpression().select('id', 'name', 'category', 'model','price')
	    .from('ProductData').orderBy('category').thenByDescending('price');

SQL > `SELECT ProductData.id, ProductData.name, ProductData.category, ProductData.model, ProductData.price FROM ProductData ORDER BY category ASC, price DESC`

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

SQL > `INSERT INTO ProductBase(name, category, model, price) VALUES ('Laptop XLG 15 16GB', 'Laptops', 'XLG15', 1199.99)`

## SQL Update

Use `QueryExpression.update()` to build SQL update statements

	const q = new QueryExpression().update('OrderBase').set({
		status: 2
	}).where('orderDate').lowerThan('2022-10-25');

SQL > `UPDATE OrderBase SET status=2 WHERE (orderDate<'2022-10-25')`

## SQL Delete

Use `QueryExpression.delete()` to build SQL delete statements

	const q = new QueryExpression().delete('OrderBase').where('id').equal(12020);

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

SQL > `SELECT Orders.id AS id, Orders.orderedItem AS orderedItem, customer.familyName AS customerFamilyName, customer.givenName AS customerGivenName, Orders.orderStatus AS orderStatus FROM OrderData AS Orders LEFT JOIN PersonData AS customer ON Orders.customer = customer.id WHERE customer.familyName = 'Thomas' ORDER BY Orders.orderDate DESC LIMIT 25`

## Development

    git clone http://github.com/themost-framework/query.git