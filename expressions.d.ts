// MOST Web Framework 2.0 Codename Blueshift Copyright (c) 2017-2021, THEMOST LP All rights reserved
export declare interface ExpressionBase {
    exprOf(): any;
}

export declare const Operators: {
    Not : string,
    Mul : string,
    Div : string,
    Mod : string,
    Add : string,
    Sub : string,
    Lt : string,
    Gt : string,
    Le : string,
    Ge : string,
    Eq : string,
    Ne : string,
    In : string,
    NotIn : string,
    And : string,
    Or : string,
}

export declare class ArithmeticExpression implements ExpressionBase {

    static isArithmeticOperator(op: string): boolean;

    constructor(left: any, operator: string, right:any);
    exprOf(): any;
}

export declare class MemberExpression implements ExpressionBase {
    constructor(name: string);
    exprOf(): any;
}

export declare class LogicalExpression implements ExpressionBase {

    static isLogicalOperator(op: string): boolean;

    constructor(operator: string, args: Array<any>);
    exprOf(): any;
}

export declare class LiteralExpression implements ExpressionBase {
    constructor(value: any);
    exprOf(): any;
}

export declare class ComparisonExpression implements ExpressionBase {

    static isComparisonOperator(op: string): boolean;
    constructor(left: any, operator: string, right:any);
    exprOf(): any;
}

export declare class MethodCallExpression implements ExpressionBase {
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


