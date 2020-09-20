// MOST Web Framework 2.0 Codename Blueshift Copyright (c) 2017-2020, THEMOST LP All rights reserved
export type SelectClosure = (x: any) => any;
export type FilterClosure = (x: any) => any;

export declare function count(...args: any): number;
export declare function round(n: any, precision?: number): number;
export declare function min(...args: any): any;
export declare function max(...args: any): any;
export declare function sum(...args: any): any;
export declare function mean(...args: any): any;

/**
 * @class
 */
export declare class ClosureParser {
    static binaryToExpressionOperator(binaryOperator: string): string;
    parseSelect(func: SelectClosure, params?: any): any;
    parseFilter(func: FilterClosure, params?: any): any;
    parseCommon(expr: any): any;
    parseLogical(expr: any): any;
    parseBinary(expr: any): any;
    parseMember(expr: any): any;
    parseMethodCall(expr: any): any;
    parseMethod(expr: any): any;
    parseIdentifier(expr: any): any;
    parseLiteral(expr: any): any;
    resolveMember(member: any): any;
    resolveMethod(method: any): any;
}
