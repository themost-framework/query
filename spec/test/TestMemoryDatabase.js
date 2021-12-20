const { MemoryAdapter } = require('./TestMemoryAdapter');
const { QueryExpression } = require('../../query');
const Customers = require('./config/models/Customer.json');
const Categories = require('./config/models/Category.json');
const Shippers = require('./config/models/Shipper.json');
const Suppliers = require('./config/models/Supplier.json');
const Employees = require('./config/models/Employee.json');
const Products = require('./config/models/Product.json');
const Orders = require('./config/models/Order.json');
const OrderDetails = require('./config/models/OrderDetail.json');

async function migrateAsync(model) {
    const db = new MemoryAdapter();
    try {
        const migrateAsyncData = {
            version: model.version,
            appliesTo: model.source,
            model: model.name,
            add: model.fields
        };
        await db.migrateAsync(migrateAsyncData);
        if (migrateAsyncData.updated === true) {
            await db.closeAsync();
            return;
        }
        let item;
        for(let i = 0; i < model.seed.length; i++) {
            item = model.seed[i];
            await db.executeAsync(new QueryExpression().insert(item).into(model.source))
        }
        await db.closeAsync();
    }
    catch (err) {
        await db.closeAsync();
        throw err;
    }
    
    
}

async function initDatabase() {
    // change NODE_ENV (do not log statement while adding data)
    process.env.NODE_ENV = 'devel';
    // create migrations
    await migrateAsync(Customers);
    await migrateAsync(Shippers);
    await migrateAsync(Categories);
    await migrateAsync(Suppliers);
    await migrateAsync(Employees);
    await migrateAsync(Products);
    await migrateAsync(Orders);
    await migrateAsync(OrderDetails);
    // restore NODE_ENV
    process.env.NODE_ENV = 'development';
}

module.exports = {
    migrateAsync,
    initDatabase
};
