// MOST Web Framework 2.0 Codename Blueshift Copyright (c) 2017-2020, THEMOST LP All rights reserved

if (typeof Object.key !== 'function') {
    /**
     * Gets a string that represents the name of the very first property of an object. This operation may be used in anonymous object types.
     * @param obj {*}
     * @returns {string}
     */
    Object.key = function(obj) {
        if (typeof obj === 'undefined' || obj === null)
            return null;
        for(let prop in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, prop))
                return prop;
        }
        return null;
    }
}

if (typeof Object.clear !== 'function') {
    /**
     * Clears object properties
     * @param {*} obj
     */
    Object.clear = function(obj) {
        if (typeof obj === 'undefined' || obj === null)
            return;
        let arr = [];
        for (let key1 in obj)
            if (Object.prototype.hasOwnProperty.call(obj, key1)) arr.push(key1);
        for (let key2 in arr) {
            delete obj[key2];
        }
    }
}
