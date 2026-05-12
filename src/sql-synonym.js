import {SqlFormatter} from './formatter';

class SqlSynonym extends Map {
    constructor() {
        super();
        this.sortedKeys = null;
    }

    add(name, synonym) {
        if (Array.isArray(name)) {
            for (const item of name) {
                if (!Array.isArray(item) || item.length !== 2) {
                    throw new TypeError('Invalid synonym entry. Expected [name, synonym].');
                }
                this.set(item[0], item[1]);
            }
            return this;
        }
        if (typeof name !== 'string') {
            throw new TypeError('Invalid object name. Expected string.');
        }
        if (typeof synonym !== 'string') {
            throw new TypeError('Invalid synonym name. Expected string.');
        }
        this.set(name, synonym);
        return this;
    }

    set(name, synonym) {
        if (typeof name !== 'string') {
            throw new TypeError('Invalid object name. Expected string.');
        }
        if (typeof synonym !== 'string') {
            throw new TypeError('Invalid synonym name. Expected string.');
        }
        this.sortedKeys = null;
        return super.set(name, synonym);
    }

    get(name) {
        return super.get(name);
    }

    delete(name) {
        if (typeof name !== 'string') {
            throw new TypeError('Invalid object name. Expected string.');
        }
        this.sortedKeys = null;
        return super.delete(name);
    }

    clear() {
        this.sortedKeys = null;
        return super.clear();
    }

    resolve(name) {
        if (typeof name !== 'string') {
            throw new TypeError('Invalid synonym expression. Expected string.');
        }
        const exactMatch = this.get(name);
        if (typeof exactMatch === 'string') {
            return exactMatch;
        }
        const keys = this.getSortedKeys();
        for (const key of keys) {
            if (name.startsWith(key + '.')) {
                return this.get(key).concat(name.substring(key.length));
            }
        }
        return name;
    }

    getSortedKeys() {
        if (this.sortedKeys === null) {
            this.sortedKeys = Array.from(this.keys()).sort((a, b) => b.length - a.length);
        }
        return this.sortedKeys;
    }

    static getInstance() {
        if (this.instance === undefined) {
            this.instance = new SqlSynonym();
        }
        return this.instance;
    }

    static add(name, synonym) {
        return this.getInstance().add(name, synonym);
    }

    static remove(name) {
        return this.getInstance().delete(name);
    }

    static clear() {
        this.getInstance().clear();
    }

    static get(name) {
        return this.getInstance().get(name);
    }

    static resolve(name) {
        return this.getInstance().resolve(name);
    }
}

SqlFormatter.resolvingName.subscribe((event) => {
    if (typeof event.name !== 'string') {
        return;
    }
    event.name = SqlSynonym.getInstance().resolve(event.name);
});

export {
    SqlSynonym
};
