export declare class ObjectNameValidator {

    static Patterns: {
        Default: RegExp,
        Latin: RegExp,
        LatinExtended: RegExp,
        Greek: RegExp,
        Cyrillic: RegExp
    };

    static readonly validator: ObjectNameValidator;

    static use(validator: ObjectNameValidator): void;

    pattern: RegExp;

    patternMessage: string;

    test(name: string, throwError?: boolean): boolean;
}
