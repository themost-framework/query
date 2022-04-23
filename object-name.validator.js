/*eslint-env es6 */
// eslint-disable-next-line no-unused-vars

class InvalidObjectNameError extends Error {
    /**
     * @param {string=} msg 
     */
    constructor(msg) {
        super(msg || 'Invalid database object name.');
        this.code = 'ERR_INVALID_NAME';
    }
}

/**
 * @class
 */
class ObjectNameValidator {
    /**
     * @param {string=} pattern 
     */
    constructor(pattern) {
        /**
         * Gets or sets object name pattern
         * @type {RegExp}
         */
        this.pattern = new RegExp(pattern || ObjectNameValidator.Patterns.Default, 'g');
        /**
         * Gets or sets qualified object name pattern
         * @type {RegExp}
         */
        this.qualifiedPattern = new RegExp(`^${this.pattern.source}((\\.)${this.pattern.source})*$`, 'g');
    }
    /**
     * @param {string} name - A string which defines a query field name or an alias
     * @param {boolean=} throwError - Indicates whether validator will throw error on failure or not
     * @returns boolean
     */
    test(name, throwError) {
        const qualifiedPattern = new RegExp(this.qualifiedPattern.source, 'g');
        const valid = qualifiedPattern.test(name);
        if (valid === false) {
            const shouldThrow = typeof throwError === 'undefined' ? true : !!throwError;
            if (shouldThrow) {
                throw new InvalidObjectNameError();
            }
        }
        return valid;
    }
    /**
     * Escapes the given base on the format provided
     * @param {string} name - The object name
     * @param {string=} format - The format that is going to used for escaping name e.g. [$1] or `$1`
     */
    escape(name, format) {
        // validate qualified object name
        const qualifiedPattern = new RegExp(this.qualifiedPattern.source, 'g');
        const valid = qualifiedPattern.test(name);
        if (valid === false) {
            throw new InvalidObjectNameError();
        }
        const pattern = new RegExp(this.pattern.source, 'g');
        return name.replace(pattern, format || '$1');
    }
    /**
     * Defines the current query field validator
     * @param {ObjectNameValidator} validator
     * @returns {void}
     */
    static use(validator) {
        if (validator instanceof ObjectNameValidator) {
            Object.defineProperty(ObjectNameValidator, 'validator', {
                configurable: true,
                enumerable: false,
                get: function () {
                    return validator;
                }
            });
            return;
        }
        throw new TypeError('Invalid validator. Expected an instance of QueryFieldValidator class.');
    }
}


ObjectNameValidator.Patterns = {
    Default: '([a-zA-Z0-9_]+)',
    Latin: '([\u0030-\u0039\u0041-\u005A\u0061-\u007A\u005F]+)',
    LatinExtended: '([\u0030-\u0039\u0041-\u005A\u0061-\u007A\u00A0-\u024F\u005F]+)',
    Greek: '([\u0030-\u0039\u0041-\u005A\u0061-\u007A\u0386-\u03CE\u005F]+)',
    Cyrillic: '([\u0030-\u0039\u0041-\u007A\u0061-\u007A\u0400-\u04FF\u005F]+)',
    Hebrew: '([\u0030-\u0039\u0041-\u005A\u0061-\u007A\u05D0-\u05F2\u005F]+)'
}
// use default object name validator
ObjectNameValidator.use(new ObjectNameValidator());

module.exports = {
    ObjectNameValidator,
    InvalidObjectNameError
}
