

var DEFAULT_PATTERN = /^([a-zA-Z0-9_]+)$/g;

var LATIN_CHARSET_PATTERN = /^([\\u0030-\\u0039\\u0041-\\u005A\\u0061-\\u005A\\u005F]+)$/g;

var LATIN_EXTENDED_CHARSET_PATTERN = /^([\\u0030-\\u0039\\u0041-\\u005A\\u0061-\\u007A\\u00A0-\\u024F\\u005F]+)$/g;

var GREEK_CHARSET_PATTERN = /^([\\u0030-\\u0039\\u0041-\\u005A\\u0061-\\u007A\\u0386-\\u03CE\\u005F]+)$/g;

var CYRILLIC_CHARSET_PATTERN = /^([\\u0030-\\u0039\\u0041-\\u007A\\u0061-\\u005A\\u0400–\\u04FF\\u005F]+)$/g;

/**
 * @class
 */
function QueryFieldNameValidator() {
    this.pattern = QueryFieldNameValidator.Patterns.Default;
    this.patternMessage = 'Invalid field expression.';
}
/**
 * @param {string} name - A string which defines a query field name or an alias
 */
QueryFieldNameValidator.prototype.test = function(name) {
    var valid = this.pattern.test(name);
    if (valid === false) {
        throw new Error(this.patternMessage);
    }
    return valid;
}

/**
 * Defines the current query field validator
 * @param {QueryFieldNameValidator} validator
 * @returns {void}
 */
QueryFieldNameValidator.use = function(validator) {
    if (validator instanceof QueryFieldNameValidator) {
        Object.defineProperty(QueryFieldNameValidator, 'validator', {
            configurable: true,
            enumerable: false,
            writable: false,
            get: function() {
                return validator;
            }
        });
        return;
    }
    throw new TypeError('Invalid validator. Expected an instance of QueryFieldValidator class.');
}

QueryFieldNameValidator.Patterns = {
    Default: DEFAULT_PATTERN,
    Latin: LATIN_CHARSET_PATTERN,
    LatinExdended: LATIN_EXTENDED_CHARSET_PATTERN,
    Greek: GREEK_CHARSET_PATTERN,
    Cyrillic: CYRILLIC_CHARSET_PATTERN
}

QueryFieldNameValidator.use(new QueryFieldNameValidator());

module.exports = {
    QueryFieldNameValidator: QueryFieldNameValidator
}
