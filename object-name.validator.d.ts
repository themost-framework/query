export declare class ObjectNameValidator {

    static Patterns: {
        Default: string,
        Latin: string,
        LatinExtended: string,
        Greek: string,
        Cyrillic: string
    };

    static readonly validator: ObjectNameValidator;

    static use(validator: ObjectNameValidator): void;

    pattern: RegExp;
    
    qualifiedPattern: RegExp;

    test(name: string, throwError?: boolean): boolean;

    escape(name: string, format?: string): string;
}

export declare class InvalidObjectNameError extends Error {
    code: string;
    constructor(msg?: string);
}