// MOST Web Framework Copyright (c) 2014-2021 THEMOST LP eleased under the BSD3-Clause license

export declare class ClosureParser {
    parseFilter(func: (x: any) => void, callback?: (err?: Error, result?: any) => void): void;
    parseCommon(expr: any, callback?: (err?: Error, result?: any) => void): void;
    parseMember(expr: any, callback?: (err?: Error, result?: any) => void): void;
    parseMethodCall(expr: any, callback?: (err?: Error, result?: any) => void): void;
    parseMethod(expr: any, callback?: (err?: Error, result?: any) => void): void;
    parseLogical(expr: any, callback?: (err?: Error, result?: any) => void): void;
    parseBinary(expr: any, callback?: (err?: Error, result?: any) => void): void;
    parseLiteral(expr: any, callback?: (err?: Error, result?: any) => void): void;
    parseIdentifier(expr: any, callback?: (err?: Error, result?: any) => void): void;
}

export declare function createParser(): ClosureParser;