import {SqlFormatter} from './formatter';

class SqlSynonym extends Map {
    constructor(entries) {
        super(entries);
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
        return super.get(name);
    }

    delete(name) {
        if (typeof name !== 'string') {
            throw new TypeError('Invalid object name. Expected string.');
        }
        return super.delete(name);
    }

    clear() {
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
        let candidate;
        for (const key of this.keys()) {
            if (name.startsWith(key + '.')) {
                if (candidate === undefined || key.length > candidate.length) {
                    candidate = key;
                }
            }
        }
        if (typeof candidate === 'string') {
            return this.get(candidate).concat(name.substring(candidate.length));
        }
        return name;
    }

    static getInstance() {
        if (this.instance === undefined) {
            this.instance = new SqlSynonym();
        }
        return this.instance;
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
