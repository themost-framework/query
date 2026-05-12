import {SqlFormatter} from './formatter';

const synonyms = new Map();

class SqlSynonym {
    static add(name, synonym) {
        if (typeof name !== 'string') {
            throw new TypeError('Invalid object name. Expected string.');
        }
        if (typeof synonym !== 'string') {
            throw new TypeError('Invalid synonym name. Expected string.');
        }
        synonyms.set(name, synonym);
    }

    static remove(name) {
        if (typeof name !== 'string') {
            throw new TypeError('Invalid object name. Expected string.');
        }
        return synonyms.delete(name);
    }

    static clear() {
        synonyms.clear();
    }

    static get(name) {
        return synonyms.get(name);
    }

    static resolve(name) {
        const exactMatch = synonyms.get(name);
        if (typeof exactMatch === 'string') {
            return exactMatch;
        }
        const keys = Array.from(synonyms.keys()).sort((a, b) => b.length - a.length);
        for (const key of keys) {
            if (name.startsWith(key + '.')) {
                return synonyms.get(key).concat(name.substring(key.length));
            }
        }
        return name;
    }
}

SqlFormatter.resolvingName.subscribe((event) => {
    if (typeof event.name !== 'string') {
        return;
    }
    event.name = SqlSynonym.resolve(event.name);
});

export {
    SqlSynonym
};
