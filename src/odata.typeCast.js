
const EdmTypeTypeCast = new Map([
    [ 'Edm.EdmDate', 'date' ],
    [ 'Edm.EdmDateTime', 'datetime' ],
    [ 'Edm.EdmDateTimeOffset', 'timestamp' ],
    [ 'Edm.EdmString', 'string' ],
    [ 'Edm.EdmBoolean', 'boolean' ],
    [ 'Edm.EdmInt16', 'int' ],
    [ 'Edm.EdmInt32', 'int' ],
    [ 'Edm.EdmInt64', 'int' ],
    [ 'Edm.EdmDecimal', 'decimal' ],
    [ 'Edm.EdmDouble', 'double' ],
    [ 'Edm.EdmSingle', 'decimal' ],
    [ 'Edm.EdmByte', 'int' ],
    [ 'Edm.EdmSByte', 'int' ],
    [ 'Edm.EdmBinary', 'buffer' ],
    [ 'Edm.EdmGuid', 'uuid' ],
    [ 'Edm.EdmTime', 'string' ],
    [ 'Edm.EdmTimeOfDay', 'string' ],
    [ 'Edm.EdmDuration', 'string' ]
]);

/**
 * Handles type casting for OData Edm types.
 * @param {{method: string, args: Array<*>}} event
 */
function onResolvingTypeCastMethod(event) {
    if (typeof event.method === 'string' && event.method === 'cast') {
        const [, edmType] = event.args;
        if (EdmTypeTypeCast.has(edmType)) {
            event.args[1] = EdmTypeTypeCast.get(edmType);
        }
    }
}

export {
    onResolvingTypeCastMethod
}