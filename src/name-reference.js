
const REFERENCE_REGEXP = /^\$/;

/**
 * Returns true if the specified string is a method (e.g. $concat) or name reference (e.g. $dateCreated)
 * @param {string} str
 * @returns {*}
 */
function isMethodOrNameReference(str) {
    return REFERENCE_REGEXP.test(str)
}

/**
 * Returns a string which indicates that the given object has a property with a name reference
 * e.g. $UserTable, $name etc.
 * @param {*} obj
 * @returns {string|*}
 */
function getOwnPropertyWithNameRef(obj) {
    if (obj) {
        // noinspection LoopStatementThatDoesntLoopJS
        for(const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key) && REFERENCE_REGEXP.test(key)) {
                return key;
            }
            break;
        }
    }
}

// noinspection JSUnusedGlobalSymbols
/**
 * Returns a string which indicates that the given string is following name reference format.
 * @param {string} str
 * @returns {string}
 */
function hasNameReference(str) {
    if (str) {
        if (REFERENCE_REGEXP.test(str)) {
            return str.substring(1, str.length - 1);
        }
    }
}


export {
    hasNameReference,
    isMethodOrNameReference,
    getOwnPropertyWithNameRef
}