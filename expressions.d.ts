// MOST Web Framework Codename Blueshift Copyright (c) 2017-2022, THEMOST LP All rights reserved

export declare interface ExpressionBase {
    exprOf(): any;
}

export declare class Operators {
    static Not : string;
    static Mul : string;
    static Div : string;
    static Mod : string;
    static Add : string;
    static Sub : string;
    static Lt : string;
    static Gt : string;
    static Le : string;
    static Ge : string;
    static Eq : string;
    static Ne : string;
    static In : string;
    static NotIn : string;
    static And : string;
    static Or : string;
}

export declare class ArithmeticExpression implements ExpressionBase {
    constructor(left: any, operator: string, right:any);
    exprOf(): any;
}

export declare class MemberExpression implements ExpressionBase {
    constructor(name: string);
    exprOf(): any;
}

export declare class LogicalExpression implements ExpressionBase {
    constructor(operator: string, args: Array<any>);
    exprOf(): any;
}

export declare class LiteralExpression implements ExpressionBase {
    constructor(value: any);
    exprOf(): any;
}

export declare class ComparisonExpression implements ExpressionBase {
    constructor(left: any, operator: string, right:any);
    exprOf(): any;
}

export declare class MethodCallExpression implements ExpressionBase {
    constructor(name: string, args: Array<any>);
    exprOf(): any;
}

export declare class SwitchExpression extends MethodCallExpression {
    constructor(name: string, args: Array<any>);
    exprOf(): any;
}

export declare class SequenceExpression implements ExpressionBase {
    constructor();
    exprOf(): any;
}

export declare class ObjectExpression implements ExpressionBase {
    constructor();
    exprOf(): any;
}

export declare class SimpleMethodCallExpression extends MethodCallExpression {
    constructor(name: string, args: Array<any>);
}

export declare class AggregateComparisonExpression extends ComparisonExpression {
    constructor(left: any, operator: string, right:any);
}

export declare class SelectAnyExpression implements SelectExpressionBase {
    constructor(expr: ExpressionBase, alias: string);
    exprOf(): any;
}

export declare class OrderByAnyExpression implements SelectExpressionBase {
    constructor(expr: ExpressionBase, direction?: string | 'asc' | 'desc');
    exprOf(): any;
}

export declare class AnyExpressionFormatter {
    format(expr: ExpressionBase): any;
    formatMany(expr: Array<ExpressionBase>): any;
}

export declare function createArithmeticExpression(left: any, operator:string, right: any): ArithmeticExpression;

export declare function createComparisonExpression(left: any, operator:string, right: any): ComparisonExpression;

export declare function createMemberExpression(name: string): MemberExpression;

export declare function createLiteralExpression(value: any): LiteralExpression;

export declare function createMethodCallExpression(name: string, args: Array<any>): MethodCallExpression;

export declare function createLogicalExpression(name: string, args: Array<any>): LogicalExpression;

export declare function isArithmeticExpression(any: any): boolean;

export declare function isArithmeticOperator(op: string): boolean;

export declare function isComparisonOperator(op: string): boolean;

export declare function isLogicalOperator(op: string): boolean;

export declare function isLogicalExpression(any: any): boolean;

export declare function isComparisonExpression(any: any): boolean;

export declare function isMemberExpression(any: any): boolean;

export declare function isLiteralExpression(any: any): boolean;

export declare function isMethodCallExpression(any: any): boolean;


