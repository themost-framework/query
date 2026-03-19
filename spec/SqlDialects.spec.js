import { QueryExpression, QueryEntity, QueryField } from '../src/index';
import { SqliteDialect } from '../src/dialects/sqlite';
import { MySQLDialect } from '../src/dialects/mysql';
import { MSSQLDialect } from '../src/dialects/mssql';
import { PostgreSQLDialect } from '../src/dialects/pg';
import { OracleDialect } from '../src/dialects/oracle';

describe('SqlDialects', () => {

    describe('SqliteDialect', () => {
        it('should format a SELECT statement with LIMIT/OFFSET', () => {
            const Products = new QueryEntity('ProductData');
            const query = new QueryExpression().select('id', 'name').from(Products).take(10).skip(20);
            const formatter = new SqliteDialect();
            const sql = formatter.formatLimitSelect(query);
            expect(sql).toContain('FROM `ProductData`');
            expect(sql).toContain('LIMIT 20, 10');
        });

        it('should escape identifiers with backticks', () => {
            const formatter = new SqliteDialect();
            expect(formatter.escapeName('name')).toBe('`name`');
        });

        it('should escape boolean as 1/0', () => {
            const formatter = new SqliteDialect();
            expect(formatter.escape(true)).toBe('1');
            expect(formatter.escape(false)).toBe('0');
        });

        it('should format $toString', () => {
            const formatter = new SqliteDialect();
            const result = formatter.$toString({ $name: 'price' });
            expect(result).toBe('CAST(`price` AS TEXT)');
        });

        it('should format $toInt', () => {
            const formatter = new SqliteDialect();
            const result = formatter.$toInt({ $name: 'price' });
            expect(result).toBe('CAST(`price` AS INT)');
        });

        it('should format $toLong', () => {
            const formatter = new SqliteDialect();
            const result = formatter.$toLong({ $name: 'id' });
            expect(result).toBe('CAST(`id` AS BIGINT)');
        });

        it('should format $toDouble', () => {
            const formatter = new SqliteDialect();
            const result = formatter.$toDouble({ $name: 'price' });
            expect(result).toBe('CAST(`price` as DECIMAL(19,8))');
        });

        it('should format $toDecimal', () => {
            const formatter = new SqliteDialect();
            const result = formatter.$toDecimal({ $name: 'price' }, 10, 2);
            expect(result).toBe('CAST(`price` as DECIMAL(10,2))');
        });

        it('should format $toBoolean', () => {
            const formatter = new SqliteDialect();
            const result = formatter.$toBoolean({ $name: 'active' });
            expect(result).toBe('CAST(`active` AS INTEGER)');
        });

        it('should format $concat', () => {
            const formatter = new SqliteDialect();
            const result = formatter.$concat({ $name: 'firstName' }, ' ', { $name: 'lastName' });
            expect(result).toContain('||');
        });

        it('should format $length', () => {
            const formatter = new SqliteDialect();
            const result = formatter.$length({ $name: 'name' });
            expect(result).toBe('LENGTH(`name`)');
        });

        it('should format $substring', () => {
            const formatter = new SqliteDialect();
            const result = formatter.$substring({ $name: 'name' }, 0, 5);
            expect(result).toBe('SUBSTR(`name`,0 + 1,5)');
        });

        it('should format $indexOf', () => {
            const formatter = new SqliteDialect();
            const result = formatter.$indexOf({ $name: 'name' }, 'John');
            expect(result).toBe('(INSTR(`name`,\'John\')-1)');
        });

        it('should format $startsWith', () => {
            const formatter = new SqliteDialect();
            const result = formatter.$startsWith({ $name: 'name' }, 'John');
            expect(result).toBe('LIKE(\'John%\',`name`)');
        });

        it('should format $endsWith', () => {
            const formatter = new SqliteDialect();
            const result = formatter.$endsWith({ $name: 'name' }, 'son');
            expect(result).toBe('LIKE(\'%son\',`name`)');
        });

        it('should format $contains', () => {
            const formatter = new SqliteDialect();
            const result = formatter.$contains({ $name: 'name' }, 'ohn');
            expect(result).toBe('LIKE(\'%ohn%\',`name`)');
        });

        it('should format $year', () => {
            const formatter = new SqliteDialect();
            const result = formatter.$year({ $name: 'createdAt' });
            expect(result).toBe('CAST(strftime(\'%Y\', `createdAt`) AS INTEGER)');
        });

        it('should format $month', () => {
            const formatter = new SqliteDialect();
            const result = formatter.$month({ $name: 'createdAt' });
            expect(result).toBe('CAST(strftime(\'%m\', `createdAt`) AS INTEGER)');
        });

        it('should format $day', () => {
            const formatter = new SqliteDialect();
            const result = formatter.$day({ $name: 'createdAt' });
            expect(result).toBe('CAST(strftime(\'%d\', `createdAt`) AS INTEGER)');
        });

        it('should format $ifNull', () => {
            const formatter = new SqliteDialect();
            const result = formatter.$ifNull({ $name: 'description' }, '');
            expect(result).toBe('IFNULL(`description`, \'\')');
        });

        it('should format $ceiling', () => {
            const formatter = new SqliteDialect();
            const result = formatter.$ceiling({ $name: 'price' });
            expect(result).toBe('CEIL(`price`)');
        });

        it('should format $uuid', () => {
            const formatter = new SqliteDialect();
            expect(formatter.$uuid()).toBe('uuid4()');
        });

        it('should format a SELECT statement', () => {
            const Products = new QueryEntity('ProductData');
            const query = new QueryExpression()
                .select('id', 'name', 'price')
                .from(Products);
            const formatter = new SqliteDialect();
            const sql = formatter.formatSelect(query);
            expect(sql).toContain('SELECT');
            expect(sql).toContain('`ProductData`');
        });

        it('should be exported from main index', () => {
            const { SqliteDialect: dialect } = require('../src/index');
            expect(dialect).toBeDefined();
            const instance = new dialect();
            expect(instance).toBeInstanceOf(SqliteDialect);
        });
    });

    describe('MySQLDialect', () => {
        it('should format a SELECT statement with LIMIT/OFFSET', () => {
            const Products = new QueryEntity('ProductData');
            const query = new QueryExpression().select('id', 'name').from(Products).take(10).skip(20);
            const formatter = new MySQLDialect();
            const sql = formatter.formatLimitSelect(query);
            expect(sql).toContain('FROM `ProductData`');
            expect(sql).toContain('LIMIT 10 OFFSET 20');
        });

        it('should escape identifiers with backticks', () => {
            const formatter = new MySQLDialect();
            expect(formatter.escapeName('name')).toBe('`name`');
        });

        it('should escape boolean as 1/0', () => {
            const formatter = new MySQLDialect();
            expect(formatter.escape(true)).toBe('1');
            expect(formatter.escape(false)).toBe('0');
        });

        it('should format $toString', () => {
            const formatter = new MySQLDialect();
            const result = formatter.$toString({ $name: 'price' });
            expect(result).toBe('CAST(`price` AS CHAR)');
        });

        it('should format $toInt', () => {
            const formatter = new MySQLDialect();
            const result = formatter.$toInt({ $name: 'price' });
            expect(result).toBe('CAST(`price` AS SIGNED INT)');
        });

        it('should format $toLong', () => {
            const formatter = new MySQLDialect();
            const result = formatter.$toLong({ $name: 'id' });
            expect(result).toBe('CAST(`id` AS SIGNED)');
        });

        it('should format $toDecimal', () => {
            const formatter = new MySQLDialect();
            const result = formatter.$toDecimal({ $name: 'price' }, 10, 2);
            expect(result).toBe('CAST(`price` AS DECIMAL(10,2))');
        });

        it('should format $toBoolean', () => {
            const formatter = new MySQLDialect();
            const result = formatter.$toBoolean({ $name: 'active' });
            expect(result).toBe('CAST(`active` AS UNSIGNED)');
        });

        it('should format $concat', () => {
            const formatter = new MySQLDialect();
            const result = formatter.$concat({ $name: 'firstName' }, ' ', { $name: 'lastName' });
            expect(result).toContain('CONCAT(');
        });

        it('should format $indexOf', () => {
            const formatter = new MySQLDialect();
            const result = formatter.$indexOf({ $name: 'name' }, 'John');
            expect(result).toBe('(INSTR(`name`,\'John\')-1)');
        });

        it('should format $year', () => {
            const formatter = new MySQLDialect();
            const result = formatter.$year({ $name: 'createdAt' });
            expect(result).toBe('YEAR(`createdAt`)');
        });

        it('should format $month', () => {
            const formatter = new MySQLDialect();
            const result = formatter.$month({ $name: 'createdAt' });
            expect(result).toBe('MONTH(`createdAt`)');
        });

        it('should format $day', () => {
            const formatter = new MySQLDialect();
            const result = formatter.$day({ $name: 'createdAt' });
            expect(result).toBe('DAY(`createdAt`)');
        });

        it('should format $ifNull', () => {
            const formatter = new MySQLDialect();
            const result = formatter.$ifNull({ $name: 'description' }, '');
            expect(result).toBe('IFNULL(`description`, \'\')');
        });

        it('should format $uuid', () => {
            const formatter = new MySQLDialect();
            expect(formatter.$uuid()).toBe('UUID()');
        });

        it('should be exported from main index', () => {
            const { MySQLDialect: dialect } = require('../src/index');
            expect(dialect).toBeDefined();
            const instance = new dialect();
            expect(instance).toBeInstanceOf(MySQLDialect);
        });
    });

    describe('MSSQLDialect', () => {
        it('should format a SELECT statement with OFFSET/FETCH', () => {
            const Products = new QueryEntity('ProductData');
            const query = new QueryExpression().select('id', 'name').from(Products).take(10).skip(20);
            const formatter = new MSSQLDialect();
            const sql = formatter.formatLimitSelect(query);
            expect(sql).toContain('OFFSET 20 ROWS FETCH NEXT 10 ROWS ONLY');
        });

        it('should format a SELECT statement with FETCH NEXT (no skip)', () => {
            const Products = new QueryEntity('ProductData');
            const query = new QueryExpression().select('id', 'name').from(Products).take(10);
            const formatter = new MSSQLDialect();
            const sql = formatter.formatLimitSelect(query);
            expect(sql).toContain('OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY');
        });

        it('should escape identifiers with brackets', () => {
            const formatter = new MSSQLDialect();
            expect(formatter.escapeName('name')).toBe('[name]');
        });

        it('should escape boolean as 1/0', () => {
            const formatter = new MSSQLDialect();
            expect(formatter.escape(true)).toBe('1');
            expect(formatter.escape(false)).toBe('0');
        });

        it('should format $toString', () => {
            const formatter = new MSSQLDialect();
            const result = formatter.$toString({ $name: 'price' });
            expect(result).toBe('CAST([price] AS NVARCHAR(MAX))');
        });

        it('should format $toInt', () => {
            const formatter = new MSSQLDialect();
            const result = formatter.$toInt({ $name: 'price' });
            expect(result).toBe('CAST([price] AS INT)');
        });

        it('should format $toLong', () => {
            const formatter = new MSSQLDialect();
            const result = formatter.$toLong({ $name: 'id' });
            expect(result).toBe('CAST([id] AS BIGINT)');
        });

        it('should format $toDecimal', () => {
            const formatter = new MSSQLDialect();
            const result = formatter.$toDecimal({ $name: 'price' }, 10, 2);
            expect(result).toBe('CAST([price] AS DECIMAL(10,2))');
        });

        it('should format $toBoolean', () => {
            const formatter = new MSSQLDialect();
            const result = formatter.$toBoolean({ $name: 'active' });
            expect(result).toBe('CAST([active] AS BIT)');
        });

        it('should format $concat', () => {
            const formatter = new MSSQLDialect();
            const result = formatter.$concat({ $name: 'firstName' }, ' ', { $name: 'lastName' });
            expect(result).toContain('CONCAT(');
        });

        it('should format $indexOf', () => {
            const formatter = new MSSQLDialect();
            const result = formatter.$indexOf({ $name: 'name' }, 'John');
            expect(result).toBe('(CHARINDEX(\'John\',[name])-1)');
        });

        it('should format $length', () => {
            const formatter = new MSSQLDialect();
            const result = formatter.$length({ $name: 'name' });
            expect(result).toBe('LEN([name])');
        });

        it('should format $year', () => {
            const formatter = new MSSQLDialect();
            const result = formatter.$year({ $name: 'createdAt' });
            expect(result).toBe('YEAR([createdAt])');
        });

        it('should format $month', () => {
            const formatter = new MSSQLDialect();
            const result = formatter.$month({ $name: 'createdAt' });
            expect(result).toBe('MONTH([createdAt])');
        });

        it('should format $day', () => {
            const formatter = new MSSQLDialect();
            const result = formatter.$day({ $name: 'createdAt' });
            expect(result).toBe('DAY([createdAt])');
        });

        it('should format $hour', () => {
            const formatter = new MSSQLDialect();
            const result = formatter.$hour({ $name: 'createdAt' });
            expect(result).toBe('DATEPART(HOUR, [createdAt])');
        });

        it('should format $ifNull', () => {
            const formatter = new MSSQLDialect();
            const result = formatter.$ifNull({ $name: 'description' }, '');
            expect(result).toBe('ISNULL([description], \'\')');
        });

        it('should format $uuid', () => {
            const formatter = new MSSQLDialect();
            expect(formatter.$uuid()).toBe('NEWID()');
        });

        it('should be exported from main index', () => {
            const { MSSQLDialect: dialect } = require('../src/index');
            expect(dialect).toBeDefined();
            const instance = new dialect();
            expect(instance).toBeInstanceOf(MSSQLDialect);
        });
    });

    describe('PostgreSQLDialect', () => {
        it('should format a SELECT statement with LIMIT/OFFSET', () => {
            const Products = new QueryEntity('ProductData');
            const query = new QueryExpression().select('id', 'name').from(Products).take(10).skip(20);
            const formatter = new PostgreSQLDialect();
            const sql = formatter.formatLimitSelect(query);
            expect(sql).toContain('FROM "ProductData"');
            expect(sql).toContain('LIMIT 10 OFFSET 20');
        });

        it('should escape identifiers with double quotes', () => {
            const formatter = new PostgreSQLDialect();
            expect(formatter.escapeName('name')).toBe('"name"');
        });

        it('should escape boolean as TRUE/FALSE', () => {
            const formatter = new PostgreSQLDialect();
            expect(formatter.escape(true)).toBe('TRUE');
            expect(formatter.escape(false)).toBe('FALSE');
        });

        it('should format $toString', () => {
            const formatter = new PostgreSQLDialect();
            const result = formatter.$toString({ $name: 'price' });
            expect(result).toBe('CAST("price" AS TEXT)');
        });

        it('should format $toInt', () => {
            const formatter = new PostgreSQLDialect();
            const result = formatter.$toInt({ $name: 'price' });
            expect(result).toBe('CAST("price" AS INTEGER)');
        });

        it('should format $toLong', () => {
            const formatter = new PostgreSQLDialect();
            const result = formatter.$toLong({ $name: 'id' });
            expect(result).toBe('CAST("id" AS BIGINT)');
        });

        it('should format $toDouble', () => {
            const formatter = new PostgreSQLDialect();
            const result = formatter.$toDouble({ $name: 'price' });
            expect(result).toBe('CAST("price" AS FLOAT)');
        });

        it('should format $toDecimal', () => {
            const formatter = new PostgreSQLDialect();
            const result = formatter.$toDecimal({ $name: 'price' }, 10, 2);
            expect(result).toBe('CAST("price" AS DECIMAL(10,2))');
        });

        it('should format $toBoolean', () => {
            const formatter = new PostgreSQLDialect();
            const result = formatter.$toBoolean({ $name: 'active' });
            expect(result).toBe('CAST("active" AS BOOLEAN)');
        });

        it('should format $concat', () => {
            const formatter = new PostgreSQLDialect();
            const result = formatter.$concat({ $name: 'firstName' }, ' ', { $name: 'lastName' });
            expect(result).toContain('CONCAT(');
        });

        it('should format $indexOf', () => {
            const formatter = new PostgreSQLDialect();
            const result = formatter.$indexOf({ $name: 'name' }, 'John');
            expect(result).toBe('(STRPOS("name",\'John\')-1)');
        });

        it('should format $year', () => {
            const formatter = new PostgreSQLDialect();
            const result = formatter.$year({ $name: 'createdAt' });
            expect(result).toBe('EXTRACT(YEAR FROM "createdAt")');
        });

        it('should format $month', () => {
            const formatter = new PostgreSQLDialect();
            const result = formatter.$month({ $name: 'createdAt' });
            expect(result).toBe('EXTRACT(MONTH FROM "createdAt")');
        });

        it('should format $day', () => {
            const formatter = new PostgreSQLDialect();
            const result = formatter.$day({ $name: 'createdAt' });
            expect(result).toBe('EXTRACT(DAY FROM "createdAt")');
        });

        it('should format $ifNull', () => {
            const formatter = new PostgreSQLDialect();
            const result = formatter.$ifNull({ $name: 'description' }, '');
            expect(result).toBe('COALESCE("description", \'\')');
        });

        it('should format $regex', () => {
            const formatter = new PostgreSQLDialect();
            const result = formatter.$regex({ $name: 'name' }, 'John');
            expect(result).toContain('~');
        });

        it('should format $uuid', () => {
            const formatter = new PostgreSQLDialect();
            expect(formatter.$uuid()).toBe('gen_random_uuid()');
        });

        it('should format $toDate', () => {
            const formatter = new PostgreSQLDialect();
            expect(formatter.$toDate({ $name: 'createdAt' }, 'date')).toBe('CAST("createdAt" AS DATE)');
            expect(formatter.$toDate({ $name: 'createdAt' }, 'datetime')).toBe('CAST("createdAt" AS TIMESTAMP)');
            expect(formatter.$toDate({ $name: 'createdAt' }, 'timestamp')).toBe('CAST("createdAt" AS TIMESTAMPTZ)');
        });

        it('should be exported from main index', () => {
            const { PostgreSQLDialect: dialect } = require('../src/index');
            expect(dialect).toBeDefined();
            const instance = new dialect();
            expect(instance).toBeInstanceOf(PostgreSQLDialect);
        });
    });

    describe('OracleDialect', () => {
        it('should format a SELECT statement with OFFSET/FETCH', () => {
            const Products = new QueryEntity('ProductData');
            const query = new QueryExpression().select('id', 'name').from(Products).take(10).skip(20);
            const formatter = new OracleDialect();
            const sql = formatter.formatLimitSelect(query);
            expect(sql).toContain('FROM "ProductData"');
            expect(sql).toContain('OFFSET 20 ROWS FETCH NEXT 10 ROWS ONLY');
        });

        it('should format a SELECT with FETCH NEXT (no skip)', () => {
            const Products = new QueryEntity('ProductData');
            const query = new QueryExpression().select('id', 'name').from(Products).take(5);
            const formatter = new OracleDialect();
            const sql = formatter.formatLimitSelect(query);
            expect(sql).toContain('OFFSET 0 ROWS FETCH NEXT 5 ROWS ONLY');
        });

        it('should escape identifiers with double quotes', () => {
            const formatter = new OracleDialect();
            expect(formatter.escapeName('name')).toBe('"name"');
        });

        it('should escape boolean as 1/0', () => {
            const formatter = new OracleDialect();
            expect(formatter.escape(true)).toBe('1');
            expect(formatter.escape(false)).toBe('0');
        });

        it('should format $toString', () => {
            const formatter = new OracleDialect();
            const result = formatter.$toString({ $name: 'price' });
            expect(result).toBe('TO_CHAR("price")');
        });

        it('should format $toInt', () => {
            const formatter = new OracleDialect();
            const result = formatter.$toInt({ $name: 'price' });
            expect(result).toBe('CAST("price" AS NUMBER(10,0))');
        });

        it('should format $toLong', () => {
            const formatter = new OracleDialect();
            const result = formatter.$toLong({ $name: 'id' });
            expect(result).toBe('CAST("id" AS NUMBER(19,0))');
        });

        it('should format $toDouble', () => {
            const formatter = new OracleDialect();
            const result = formatter.$toDouble({ $name: 'price' });
            expect(result).toBe('CAST("price" AS NUMBER(19,8))');
        });

        it('should format $toDecimal', () => {
            const formatter = new OracleDialect();
            const result = formatter.$toDecimal({ $name: 'price' }, 10, 2);
            expect(result).toBe('CAST("price" AS NUMBER(10,2))');
        });

        it('should format $toBoolean', () => {
            const formatter = new OracleDialect();
            const result = formatter.$toBoolean({ $name: 'active' });
            expect(result).toBe('CAST("active" AS NUMBER(1,0))');
        });

        it('should format $concat', () => {
            const formatter = new OracleDialect();
            const result = formatter.$concat({ $name: 'firstName' }, ' ', { $name: 'lastName' });
            expect(result).toContain('CONCAT(');
        });

        it('should format $length', () => {
            const formatter = new OracleDialect();
            const result = formatter.$length({ $name: 'name' });
            expect(result).toBe('LENGTH("name")');
        });

        it('should format $substring', () => {
            const formatter = new OracleDialect();
            const result = formatter.$substring({ $name: 'name' }, 0, 5);
            expect(result).toBe('SUBSTR("name",0 + 1,5)');
        });

        it('should format $indexOf', () => {
            const formatter = new OracleDialect();
            const result = formatter.$indexOf({ $name: 'name' }, 'John');
            expect(result).toBe('(INSTR("name",\'John\')-1)');
        });

        it('should format $startsWith', () => {
            const formatter = new OracleDialect();
            const result = formatter.$startsWith({ $name: 'name' }, 'John');
            expect(result).toContain('LIKE');
            expect(result).toContain('John%');
        });

        it('should format $endsWith', () => {
            const formatter = new OracleDialect();
            const result = formatter.$endsWith({ $name: 'name' }, 'son');
            expect(result).toContain('LIKE');
            expect(result).toContain('%son');
        });

        it('should format $contains', () => {
            const formatter = new OracleDialect();
            const result = formatter.$contains({ $name: 'name' }, 'ohn');
            expect(result).toContain('LIKE');
            expect(result).toContain('%ohn%');
        });

        it('should format $year', () => {
            const formatter = new OracleDialect();
            const result = formatter.$year({ $name: 'createdAt' });
            expect(result).toBe('EXTRACT(YEAR FROM "createdAt")');
        });

        it('should format $month', () => {
            const formatter = new OracleDialect();
            const result = formatter.$month({ $name: 'createdAt' });
            expect(result).toBe('EXTRACT(MONTH FROM "createdAt")');
        });

        it('should format $day', () => {
            const formatter = new OracleDialect();
            const result = formatter.$day({ $name: 'createdAt' });
            expect(result).toBe('EXTRACT(DAY FROM "createdAt")');
        });

        it('should format $hour', () => {
            const formatter = new OracleDialect();
            const result = formatter.$hour({ $name: 'createdAt' });
            expect(result).toBe('EXTRACT(HOUR FROM "createdAt")');
        });

        it('should format $minute', () => {
            const formatter = new OracleDialect();
            const result = formatter.$minute({ $name: 'createdAt' });
            expect(result).toBe('EXTRACT(MINUTE FROM "createdAt")');
        });

        it('should format $second', () => {
            const formatter = new OracleDialect();
            const result = formatter.$second({ $name: 'createdAt' });
            expect(result).toBe('EXTRACT(SECOND FROM "createdAt")');
        });

        it('should format $date', () => {
            const formatter = new OracleDialect();
            const result = formatter.$date({ $name: 'createdAt' });
            expect(result).toBe('TRUNC("createdAt")');
        });

        it('should format $ifNull', () => {
            const formatter = new OracleDialect();
            const result = formatter.$ifNull({ $name: 'description' }, '');
            expect(result).toBe('NVL("description", \'\')');
        });

        it('should format $ceiling', () => {
            const formatter = new OracleDialect();
            const result = formatter.$ceiling({ $name: 'price' });
            expect(result).toBe('CEIL("price")');
        });

        it('should format $regex', () => {
            const formatter = new OracleDialect();
            const result = formatter.$regex({ $name: 'name' }, 'John');
            expect(result).toContain('REGEXP_LIKE');
        });

        it('should format $uuid', () => {
            const formatter = new OracleDialect();
            expect(formatter.$uuid()).toBe('LOWER(RAWTOHEX(SYS_GUID()))');
        });

        it('should format $toDate', () => {
            const formatter = new OracleDialect();
            expect(formatter.$toDate({ $name: 'createdAt' }, 'date')).toBe('TRUNC(CAST("createdAt" AS DATE))');
            expect(formatter.$toDate({ $name: 'createdAt' }, 'datetime')).toBe('CAST("createdAt" AS DATE)');
            expect(formatter.$toDate({ $name: 'createdAt' }, 'timestamp')).toBe('CAST("createdAt" AS TIMESTAMP)');
        });

        it('should format $getDate', () => {
            const formatter = new OracleDialect();
            expect(formatter.$getDate('date')).toBe('TRUNC(SYSDATE)');
            expect(formatter.$getDate('datetime')).toBe('SYSDATE');
            expect(formatter.$getDate('timestamp')).toBe('SYSTIMESTAMP');
        });

        it('should be exported from main index', () => {
            const { OracleDialect: dialect } = require('../src/index');
            expect(dialect).toBeDefined();
            const instance = new dialect();
            expect(instance).toBeInstanceOf(OracleDialect);
        });
    });

    describe('Dialect common features', () => {
        it('should all dialects extend SqlFormatter', () => {
            const { SqlFormatter } = require('../src/index');
            expect(new SqliteDialect()).toBeInstanceOf(SqlFormatter);
            expect(new MySQLDialect()).toBeInstanceOf(SqlFormatter);
            expect(new MSSQLDialect()).toBeInstanceOf(SqlFormatter);
            expect(new PostgreSQLDialect()).toBeInstanceOf(SqlFormatter);
            expect(new OracleDialect()).toBeInstanceOf(SqlFormatter);
        });

        it('should all dialects format a basic SELECT', () => {
            const Products = new QueryEntity('ProductData');
            const query = new QueryExpression().select('id', 'name').from(Products);
            const dialects = [
                new SqliteDialect(),
                new MySQLDialect(),
                new MSSQLDialect(),
                new PostgreSQLDialect(),
                new OracleDialect()
            ];
            for (const formatter of dialects) {
                const sql = formatter.formatSelect(query);
                expect(sql).toContain('SELECT');
                expect(sql).toContain('ProductData');
            }
        });

        it('should all dialects use $cast correctly', () => {
            const dialects = [
                new SqliteDialect(),
                new MySQLDialect(),
                new MSSQLDialect(),
                new PostgreSQLDialect(),
                new OracleDialect()
            ];
            for (const formatter of dialects) {
                const result = formatter.$cast({ $name: 'price' }, 'string');
                expect(typeof result).toBe('string');
                expect(result.length).toBeGreaterThan(0);
            }
        });
    });
});
