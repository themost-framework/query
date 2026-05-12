import {SqlFormatter} from './formatter';

class SqlSynonym extends Map {
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
        return super.set(name, synonym);
    }

    get(name) {
        if (typeof name !== 'string') {
            throw new TypeError('Invalid object name. Expected string.');
        }
        return super.get(name);
    }

    delete(name) {
        if (typeof name !== 'string') {
            throw new TypeError('Invalid object name. Expected string.');
        }
        return super.delete(name);
    }

    resolve(name) {
        const exactMatch = this.get(name);
        if (typeof exactMatch === 'string') {
            return exactMatch;
        }
        const keys = Array.from(this.keys()).sort((a, b) => b.length - a.length);
        for (const key of keys) {
            if (name.startsWith(key + '.')) {
                return this.get(key).concat(name.substring(key.length));
            }
        }
        return name;
    }

    static getInstance() {
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

SqlSynonym.instance = new SqlSynonym();

SqlFormatter.resolvingName.subscribe((event) => {
    if (typeof event.name !== 'string') {
        return;
    }
    event.name = SqlSynonym.getInstance().resolve(event.name);
});

export {
    SqlSynonym
};
