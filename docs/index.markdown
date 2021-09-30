---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: home
---

@themost/query module is a part of [MOST Web Framework](https://github.com/themost-framework) and provides a comprehensive set of tools and classes for querying data against any database engine.

# Installation

Install @themost/query by executing

        npm i @themost/common @themost/query

# Usage

Start querying database by using `QueryExpression` class.

    const {QueryExpression, SqlFormatter} = require("@themost/query")
    const query = new QueryExpression().from('UserData')
        .select('id', 'name', 'dateCreated')
        .where('name').equal('alexis.rees@example.com');
    const sql = new SqlFormatter().format(query);

