/*eslint-env es6 */
// eslint-disable-next-line no-unused-vars
const DEFAULT_PATTERN_GROUP = /([a-zA-Z0-9_]+)/;

const DEFAULT_PATTERN = /^([a-zA-Z0-9_]+)((\\.)([a-zA-Z0-9_]+))?$/g;

const LATIN_CHARSET_PATTERN = /^([\u0030-\u0039\u0041-\u005A\u0061-\u007A\u005F]+)$/g;

const LATIN_EXTENDED_CHARSET_PATTERN = /^([\u0030-\u0039\u0041-\u005A\u0061-\u007A\u00A0-\u024F\u005F]+)$/g;

const GREEK_CHARSET_PATTERN = /^([\u0030-\u0039\u0041-\u005A\u0061-\u007A\u0386-\u03CE\u005F]+)$/g;

const CYRILLIC_CHARSET_PATTERN = /^([\u0030-\u0039\u0041-\u007A\u0061-\u007A\u0400–\u04FF\u005F]+)$/g;

/**
 * @class
 */
function ObjectNameValidator() {
    this.pattern = DEFAULT_PATTERN;
    this.patternMessage = 'Invalid object expression.';
}
/**
 * @param {string} name - A string which defines a query field name or an alias
 * @param {boolean=} throwError - Indicates whether validator will throw error on failure or not
 */
ObjectNameValidator.prototype.test = function(name, throwError) {
    const valid = this.pattern.test(name);
    if (valid === false) {
        const shouldThrow = typeof throwError === 'undefined' ? true : !!throwError;
        if (shouldThrow) {
            throw new Error(this.patternMessage);
        }
    }
    return valid;
}

/**
 * Defines the current query field validator
 * @param {ObjectNameValidator} validator
 * @returns {void}
 */
ObjectNameValidator.use = function(validator) {
    if (validator instanceof ObjectNameValidator) {
        Object.defineProperty(ObjectNameValidator, 'validator', {
            configurable: true,
            enumerable: false,
            get: function() {
                return validator;
            }
        });
        return;
    }
    throw new TypeError('Invalid validator. Expected an instance of QueryFieldValidator class.');
}

ObjectNameValidator.Patterns = {
    Default: DEFAULT_PATTERN,
    Latin: LATIN_CHARSET_PATTERN,
    LatinExtended: LATIN_EXTENDED_CHARSET_PATTERN,
    Greek: GREEK_CHARSET_PATTERN,
    Cyrillic: CYRILLIC_CHARSET_PATTERN
}

ObjectNameValidator.use(new ObjectNameValidator());

module.exports = {
    ObjectNameValidator: ObjectNameValidator
}
