// MOST Web Framework Copyright (c) 2014-2021 THEMOST LP released under the BSD3-Clause license

export declare class ClosureParser {
    parseFilter(func: (x: any) => void, params?: any): any;
    parseSelect(func: (x: any) => void, params?: any): any;
    parseCommon(expr: any): any;
    parseMember(expr: any): any;
    parseMethodCall(expr: any): any;
    parseMethod(expr: any): any;
    parseBlock(expr: any): any;
    parseLogical(expr: any): any;
    parseBinary(expr: any): any;
    parseLiteral(expr: any): any;
    parseIdentifier(expr: any): any;
}
