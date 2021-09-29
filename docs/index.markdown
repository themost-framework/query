---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: home
---

@themost/query introduces a comprehensive set of tools and classes for querying data against any database engine.

The following instance of QueryExpression

    const query = new QueryExpression().from('UserData')
        .select('id', 'name', 'dateCreated')
        .where('name).equal('alexis.rees@example.com');

produces this equivalent SQL statement:

    SELECT "id", "name", "dateCreated" FROM "UserData" WHERE "name" = 'alexis.rees@example.com'