import { QueryExpression, QueryFunc } from './query';

export type ExpandArg<T> = (value: T, ...param: any[]) => any

export declare class OpenDataQuery extends QueryExpression {
    expand(...expr: (string | OpenDataQuery)[]): this;
    expand<T>(...args: QueryFunc<T>[]): this;
}

export function any<T>(expr:string | ((value: T) => any)): OpenDataQuery;
