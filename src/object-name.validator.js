import {SyncSeriesEventEmitter} from '@themost/events';

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
        this.pattern = new RegExp(pattern || ObjectNameValidator.Patterns.Default);
        /**
         * Gets or sets qualified object name pattern
         * @type {RegExp}
         */
        this.qualifiedPattern = new RegExp(`^\\*$|^${this.pattern.source}((\\.)${this.pattern.source})*(\\.\\*)?$`);

        this.validating = new SyncSeriesEventEmitter();
    }
    /**
     * @param {string} name - A string which defines a query field name or an alias
     * @param {boolean=} qualified - Indicates whether validator will check a qualified object name e.g. schema1.Table1.field1 The default value is true
     * @param {boolean=} throwError - Indicates whether validator will throw error on failure or not. The default value is true.
     * @returns boolean
     */
    test(name, qualified, throwError) {
        const qualifiedName = typeof qualified === 'undefined' ? true : !!qualified;
        let pattern;
        if (qualifiedName) {
            pattern = new RegExp(this.qualifiedPattern.source, 'g');
        } else {
            pattern = new RegExp('^' + this.pattern.source + '$', 'g');
        }
        const valid = pattern.test(name);
        if (valid === false) {
            const shouldThrow = typeof throwError === 'undefined' ? true : !!throwError;
            if (shouldThrow) {
                throw new InvalidObjectNameError();
            }
        }
        return valid;
    }

    /**
     * @param {string} name
     * @param {boolean=} qualified
     * @returns {boolean}
     */
    exec(name, qualified) {
        let valid = undefined;
        // validating event allow third party subscribers to validate object names
        // and return a boolean value which indicates whether the object name is valid or not
        const validatingEvent = {
            name,
            qualified,
            valid
        };
        // raise validating event
        this.validating.emit(validatingEvent);
        // if valid property is boolean and has been set
        if (typeof validatingEvent.valid === 'boolean') {
            // throw error if name is invalid
            if (validatingEvent.valid === false) {
                throw new InvalidObjectNameError();
            }
            // otherwise, return the result
            return validatingEvent.valid;
        }
        // this a fallback mechanism where the validating event has not been handled
        return this.test(name, qualified);
    }

    /**
     * Escapes the given base on the format provided
     * @param {string} name - The object name
     * @param {string=} format - The format that is going to be used for escaping name e.g. [$1] or `$1`
     */
    escape(name, format) {
        // validate qualified object name
        this.exec(name);
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
    Default: '(([a-zA-Z0-9_]+)|("[\\sa-zA-Z0-9_]+"))',
    Latin: '(([\u0030-\u0039\u0041-\u005A\u0061-\u007A\u005F]+)|("[\\s\u0030-\u0039\u0041-\u005A\u0061-\u007A\u005F]+"))',
    LatinExtended: '(([\u0030-\u0039\u0041-\u005A\u0061-\u007A\u00A0-\u024F\u005F]+)|("[\\s\u0030-\u0039\u0041-\u005A\u0061-\u007A\u00A0-\u024F\u005F]+"))',
    Greek: '(([\u0030-\u0039\u0041-\u005A\u0061-\u007A\u0386-\u03CE\u005F]+)|("[\\s\u0030-\u0039\u0041-\u005A\u0061-\u007A\u0386-\u03CE\u005F]+"))',
    Cyrillic: '(([\u0030-\u0039\u0041-\u007A\u0061-\u007A\u0400-\u04FF\u005F]+)|("[\\s\u0030-\u0039\u0041-\u007A\u0061-\u007A\u0400-\u04FF\u005F]+"))',
    Hebrew: '(([\u0030-\u0039\u0041-\u005A\u0061-\u007A\u05D0-\u05F2\u005F]+)|("[\\s\u0030-\u0039\u0041-\u005A\u0061-\u007A\u05D0-\u05F2\u005F]+"))'
}
// use default object name validator
ObjectNameValidator.use(new ObjectNameValidator());

export {
    ObjectNameValidator,
    InvalidObjectNameError
}
