/*eslint-env es6 */
// eslint-disable-next-line no-unused-vars

const DEFAULT_PATTERN = '([a-zA-Z0-9_]+)';

const LATIN_CHARSET_PATTERN = '([\u0030-\u0039\u0041-\u005A\u0061-\u007A\u005F]+)';

const LATIN_EXTENDED_CHARSET_PATTERN = '([\u0030-\u0039\u0041-\u005A\u0061-\u007A\u00A0-\u024F\u005F]+)';

const GREEK_CHARSET_PATTERN = '([\u0030-\u0039\u0041-\u005A\u0061-\u007A\u0386-\u03CE\u005F]+)';

const CYRILLIC_CHARSET_PATTERN = '([\u0030-\u0039\u0041-\u007A\u0061-\u007A\u0400-\u04FF\u005F]+)';

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
    constructor() {
        /**
         * Gets or sets object name pattern
         * @type {RegExp}
         */
        this.pattern = new RegExp(DEFAULT_PATTERN);
        /**
         * Gets or sets qualified object name pattern
         * @type {RegExp}
         */
        this.qualifiedPattern = new RegExp(`^${this.pattern.source}((\\.)${this.pattern.source})?$`);
    }
    /**
     * @param {string} name - A string which defines a query field name or an alias
     * @param {boolean=} throwError - Indicates whether validator will throw error on failure or not
     * @returns boolean
     */
    test(name, throwError) {
        const valid = this.qualifiedPattern.test(name);
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
        const valid = this.qualifiedPattern.test(name);
        if (valid) {
            throw new InvalidObjectNameError();
        }
        // set global to true
        this.pattern.global = true;
        return name.replace(this.pattern, format || '$1');
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
    Default: DEFAULT_PATTERN,
    Latin: LATIN_CHARSET_PATTERN,
    LatinExtended: LATIN_EXTENDED_CHARSET_PATTERN,
    Greek: GREEK_CHARSET_PATTERN,
    Cyrillic: CYRILLIC_CHARSET_PATTERN
}
// use default object name validator
ObjectNameValidator.use(new ObjectNameValidator());

module.exports = {
    ObjectNameValidator,
    InvalidObjectNameError
}
