import { QueryExpression } from './query';

export declare class OpenDataQuery extends QueryExpression {
    expand(...expr: any[]): this;
    expand<T>(...args: [...expr:[(value: T) => any], params?: any]): this;
}

export function any<T>(expr:string | [(value: T) => any]): OpenDataQuery;