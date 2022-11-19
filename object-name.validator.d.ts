// MOST Web Framework Codename Blueshift Copyright (c) 2017-2022, THEMOST LP All rights reserved
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

    constructor(pattern?: string);

    pattern: RegExp;
    
    qualifiedPattern: RegExp;

    test(name: string, qualified?: boolean, throwError?: boolean): boolean;

    escape(name: string, format?: string): string;
}

export declare class InvalidObjectNameError extends Error {
    code: string;
    constructor(msg?: string);
}