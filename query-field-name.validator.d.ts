export declare class QueryFieldNameValidator {

    static Patterns: {
        Default: RegExp,
        Latin: RegExp,
        LatinExtended: RegExp,
        Greek: RegExp,
        Cyrillic: RegExp
    };

    static readonly validator: QueryFieldNameValidator;

    static use(validator: QueryFieldNameValidator): void;

    pattern: RegExp;

    patternMessage: string;

    test(name: string, throwError?: boolean): boolean;
}
