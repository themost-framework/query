import {SyncSeriesEventEmitter} from '@themost/events';

export declare class ObjectNameValidator {

    static Patterns: {
        Default: string,
        Latin: string,
        LatinExtended: string,
        Greek: string,
        Cyrillic: string,
        Hebrew: string
    };

    static readonly validator: ObjectNameValidator;

    static use(validator: ObjectNameValidator): void;
    
    validating: SyncSeriesEventEmitter<{ name: string, qualified?: boolean, valid?: boolean }>

    constructor(pattern?: string);

    pattern: RegExp;
    
    qualifiedPattern: RegExp;

    test(name: string, qualified?: boolean, throwError?: boolean): boolean;

    exec(name: string, qualified?: boolean): boolean;

    escape(name: string, format?: string): string;
}

export declare class InvalidObjectNameError extends Error {
    code: string;
    constructor(msg?: string);
}
