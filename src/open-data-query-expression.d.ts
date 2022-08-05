import {QueryExpression} from './query';

export declare class UnsupportedQueryExpression extends Error {
    constructor();
}

export declare class OpenDataQueryExpression extends QueryExpression {
    expand(...expr: any[]): this;
    expand(expr: (value: any) => any): this;
    expand<T>(expr: (value: T) => any): this;
}