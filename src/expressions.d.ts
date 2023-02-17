// MOST Web Framework Codename Zero Gravity Copyright (c) 2017-2022, THEMOST LP All rights reserved
export declare interface ExpressionBase {
    exprOf(): any;
    source?: string;
}

export declare interface SelectExpressionBase extends ExpressionBase {
    as?: string;
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
    BitAnd: string
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

export declare class SelectAnyExpression implements SelectExpressionBase {
    constructor(expr: ExpressionBase, alias: string);
    exprOf(): any;
}

export declare class OrderByAnyExpression implements SelectExpressionBase {
    constructor(expr: ExpressionBase, direction?: string | 'asc' | 'desc');
    exprOf(): any;
}

export declare class SwitchExpression extends MethodCallExpression {
    constructor(branches: {case: any, then: any}[], defaultValue?: any);
}

export declare class AnyExpressionFormatter {
    format(expr: ExpressionBase): any;
    formatMany(expr: Array<ExpressionBase>): any;
}


