export class CancelTransactionError extends Error {
    constructor() {
        super();
    }
}
/**
 * 
 * @param {import('@themost/common').DataAdapterBase} db 
 * @param {function():Promise<void>} func 
 * @returns 
 */
export function executeInTransactionAsync(db, func) {
    return new Promise((resolve, reject) => {
        // start transaction
        db.executeInTransaction((cb) => {
            try {
                func().then(() => {
                    return cb(new CancelTransactionError());
                }).catch( err => {
                    return cb(err);
                });
            }
            catch (err) {
                return cb(err);
            }

        }, err => {
            // if error is an instance of CancelTransactionError
            if (err && err instanceof CancelTransactionError) {
                return resolve();
            }
            if (err) {
                return reject(err);
            }
            // exit
            return resolve();
        });
    });
}