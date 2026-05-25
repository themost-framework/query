class SqlSynonym {

    /**
     * @param {Map<string,string>} entries
     */
    constructor(entries) {

        Object.defineProperty(this, 'synonyms', {
            enumerable: false,
            configurable: true,
            writable: false,
            value: new Map()
        });

        if (entries && entries.length > 0) {
            entries.forEach(([synonym, name]) => {
                this.synonyms.set(synonym, name);
            });
        }
    }

    /**
     * Appends a synonym for the given value
     * @param {string} synonym
     * @param {string} value
     * @returns this
     */
    set(synonym, value) {
        this.synonyms.set(synonym, value);
        return this;
    }

    /**
     * Drops a synonym
     * @param {string} synonym
     * @returns this
     */
    drop(synonym) {
        this.synonyms.delete(synonym);
        return this;
    }

    /**
     * @param {string} synonym
     */
    get(synonym) {
        return this.synonyms.get(synonym);
    }

    /**
     * Formats the given value by replacing any synonym with its corresponding value
     * @param value
     * @returns {*}
     */
    format(value) {
        if (this.synonyms.has(value)) {
            return this.synonyms.get(value);
        }
        // split value
        const values = value.split('.');
        for (let i = 0; i < values.length; i++) {
            const value = values[i];
            const synonym = this.synonyms.get(value);
            if (synonym) {
                values[i] = synonym;
            }
        }
        return values.join('.');
    }

}

module.exports = {
    SqlSynonym
}