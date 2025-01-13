import { SyncSeriesEventEmitter } from '@themost/events';

export declare type QueryFunc<T> = (value: T, ...param: any[]) => any;

export declare type QueryJoinFunc<T, J> = (value1: T, value2: J, ...param: any[]) => any;

// MOST Web Framework Codename Blueshift Copyright (c) 2017-2022, THEMOST LP All rights reserved
export declare class QueryExpression {
    $select?: any;
    $delete?: any;
    $update?: any;
    $insert?: any;
    $order?: any;
    $group?: any;
    $expand?: any;
    $where?: any;
    $fixed?: any;
    $additionalSelect?: ( QueryEntity | QueryExpression | string)[];

    clone():QueryExpression;
    as(alias: string): this;
    fields(): Array<any>;
    hasFilter(): boolean;
    prepare(userOr?: boolean): this;
    hasFields(): boolean;
    hasPaging(): boolean;
    distinct(value: any): this;
    where<T>(expr: (value: T, ...param: any[]) => any, ...params: any[]): this;
    where<T>(expr: (value: T, arg1: K) => any, value1: K): this;
    where<T>(expr: (value: T, arg1: K, arg2: L) => any, value1: K, value2: L): this;
    where<T>(expr: (value: T, arg1: K, arg2: L, arg3: M) => any, value1: K, value2: L, value3: M): this;
    where<T>(expr: (value: T, arg1: K, arg2: L, arg3: M,
        arg4: N) => any, value1: K, value2: L, value3: M, value4: N): this;
    where<T>(expr: (value: T, arg1: K, arg2: L, arg3: M,
        arg4: N, arg5: O) => any, value1: K, value2: L, value3: M, value4: N, value5: O): this;
    where<T>(expr: (value: T, arg1: K, arg2: L, arg3: M,
        arg4: N, arg5: O, arg6: P) => any, value1: K, value2: L, value3: M, value4: N, value5: O, value6: P): this;
        where<T>(expr: (value: T, arg1: K, arg2: L, arg3: M,
            arg4: N, arg5: O, arg6: P, arg7: Q) => any, value1: K, value2: L, value3: M, value4: N, value5: O, value6: P, value7: Q): this;
    where(expr: string | any): this;
    injectWhere(where: any);
    delete(entity: string): this;
    insert(obj: any): this;
    insert(expr: QueryExpression): this;
    into(entity: string): this;
    update(entity: string): this;
    set(obj: any): this;
    select(...field: Array<any>): this;
    select<T>(expr: (value: T, ...param: any) => any, ...params: any[]): this;
    select<T>(expr: (value: T, arg1: K) => any, value1: K): this;
    select<T>(expr: (value: T, arg1: K, arg2: L) => any, value1: K, value2: L): this;
    select<T>(expr: (value: T, arg1: K, arg2: L, arg3: M) => any, value1: K, value2: L, value3: M): this;
    select<T>(expr: (value: T, arg1: K, arg2: L, arg3: M, arg4: N) => any,
        value1: K, value2: L, value3: M, value4: N): this;
    select<T>(expr: (value: T, arg1: K, arg2: L, arg3: M, arg4: N, arg5: O) => any,
        value1: K, value2: L, value3: M, value4: N, value5: O): this;
    select<T>(expr: (value: T, arg1: K, arg2: L, arg3: M, arg4: N, arg5: O, arg6: P) => any,
        value1: K, value2: L, value3: M, value4: N, value5: O, value6: P): this;
    select<T>(expr: (value: T, arg1: K, arg2: L, arg3: M, arg4: N, arg5: O, arg6: P, arg7: Q) => any,
        value1: K, value2: L, value3: M, value4: N, value5: O, value6: P, value7: Q): this;
    select<T,J>(expr: (value1: T, value2: J, ...param: any) => any, ...params: any[]): this;
    count(alias: string): this;
    from(entity: string): this;
    from(entity: QueryEntity): this;
    from(entity: QueryExpression): this;
    from(entity: (string | QueryEntity | QueryExpression), ...additionalEntity: (string | QueryEntity | QueryExpression)[]): this;
    join(entity: any, props?: any, alias?: any): this;
    join(entity: QueryEntity): this;
    leftJoin(entity: any, props?: any, alias?: any): this;
    leftJoin(entity: QueryEntity): this;
    rightJoin(entity: any, props?: any, alias?: any): this;
    rightJoin(entity: QueryEntity): this;
    with(obj: any): this;
    with<T,J>(expr: (value: T, otherValue: J, ...params: any[]) => any, ...params: any[]): this;
    orderBy(expr: string | any): this;
    orderBy<T>(expr: QueryFunc<T>, ...params: any[]): this;
    orderByDescending(expr: string | any): this;
    orderByDescending<T>(expr: QueryFunc<T>, ...params: any[]): this;
    thenBy(expr: string | any): this;
    thenBy<T>(expr: QueryFunc<T>, params?: any): this;
    thenByDescending(expr: string | any): this;
    thenByDescending<T>(expr: (value: T) => any): this;
    groupBy(...expr: (string | any)[]): this;
    groupBy<T>(arg1: QueryFunc<T>, params?: any): this;
    groupBy<T>(arg1: QueryFunc<T>, arg2: QueryFunc<T>, ...params: any[]): this;
    groupBy<T>(arg1: QueryFunc<T>, arg2: QueryFunc<T>, arg3: QueryFunc<T>, ...params: any[]): this;
    groupBy<T>(arg1: QueryFunc<T>, arg2: QueryFunc<T>, arg3: QueryFunc<T>,
               arg4: QueryFunc<T>, ...params: any[]): this;
    groupBy<T>(arg1: QueryFunc<T>, arg2: QueryFunc<T>, arg3: QueryFunc<T>,
               arg4: QueryFunc<T>, arg5: QueryFunc<T>, ...params: any[]): this;
    groupBy<T>(arg1: QueryFunc<T>, arg2: QueryFunc<T>, arg3: QueryFunc<T>,
               arg4: QueryFunc<T>, arg5: QueryFunc<T>, arg6: QueryFunc<T>, ...params: any[]): this;
    groupBy<T>(arg1: QueryFunc<T>, arg2: QueryFunc<T>, arg3: QueryFunc<T>,
               arg4: QueryFunc<T>, arg5: QueryFunc<T>, arg6: QueryFunc<T> , arg7: QueryFunc<T>, ...params: any[]): this;
    or(field: any): this;
    and(field: any): this;
    equal(value: any): this;
    notEqual(value: any): this;
    in(values: Array<any>): this;
    notIn(values: Array<any>): this;
    mod(value: any, result: number): this;
    bit(value: any, result: number): this;
    greaterThan(value: any): this;
    startsWith(value: any): this;
    endsWith(value: any): this;
    contains(value: any): this;
    notContains(value: any): this;
    lowerThan(value: any): this;
    lowerOrEqual(value: any): this;
    greaterOrEqual(value: any): this;
    between(value1: any, value2: any): this;
    skip(n: number): this;
    take(n: number): this;
    add(x: number): this;
    subtract(x: number): this;
    multiply(x: number): this;
    divide(x: number): this;
    round(n: number): this;
    substr(start: number,length?: number): this;
    indexOf(s: string): this;
    concat(s: string): this;
    trim(): this;
    length(): this;
    getDate(): this;
    getYear(): this;
    getMonth(): this;
    getDay(): this;
    getMinutes(): this;
    getHours(): this;
    getSeconds(): this;
    floor(): this;
    ceil(): this;
    toLocaleLowerCase(): this;
    toLocaleUpperCase(): this;
    resolvingMember: SyncSeriesEventEmitter<{ target: QueryExpression, member: string }>;
    resolvingJoinMember: SyncSeriesEventEmitter<{ target: QueryExpression, member: string, fullyQualifiedMember?: string }>;
    resolvingMethod: SyncSeriesEventEmitter<{ target: QueryExpression, method: string }>;
}

export declare class QueryField {
    constructor(name?: string);
    $name: string;

    static select(field: any): QueryField;
    static count(name: string): QueryField;
    static min(name: string): QueryField;
    static max(name: string): QueryField;
    static average(name: string): QueryField;
    static avg(name: string): QueryField;
    static sum(name: string): QueryField;
    static floor(name: string): QueryField;
    static ceil(name: string): QueryField;
    static modulo(name: string): QueryField;
    static add(name: string, x: number): QueryField;
    static subtract(name: string, x: number): QueryField;
    static divide(name: string, divider: number): QueryField;
    static multiply(name: string, multiplier: number): QueryField;
    static round(name: string, n: number): QueryField;
    static length(name): QueryField;
    static trim(name): QueryField;
    static year(name): QueryField;
    static date(name): QueryField;
    static day(name): QueryField;
    static month(name): QueryField;
    static hour(name): QueryField;
    static minute(name): QueryField;
    static second(name): QueryField;

    select(name: string): QueryField;
    from(entity: string): QueryField;
    count(name: string): QueryField;
    sum(name: string): QueryField;
    min(name: string): QueryField;
    max(name: string): QueryField;
    average(name: string): QueryField;
    as(alias: string): QueryField;
    concat(...str:string[]): QueryField;
    name(): string;
    getName(): string;

}

export declare class QueryEntity {
    constructor(any: any);
    readonly name: string;
    readonly props: any;
    select(name: string): QueryEntity;
    as(alias: string): QueryEntity;
    inner(): QueryEntity;
    left(): QueryEntity;
    right(): QueryEntity;
}

export declare class OpenDataQuery {
    select(...attr: string[]): OpenDataQuery;

    take(val: number): OpenDataQuery;

    skip(val: number): OpenDataQuery;

    orderBy(name: string): OpenDataQuery;

    orderByDescending(name: string): OpenDataQuery;

    thenBy(name: string): OpenDataQuery;

    thenByDescending(name: string): OpenDataQuery;

    where(name: string): OpenDataQuery;

    and(name: string): OpenDataQuery;

    or(name: string): OpenDataQuery;

    indexOf(name: string): OpenDataQuery;

    equal(value: any): OpenDataQuery;

    endsWith(name: string, s: string): OpenDataQuery;

    startsWith(name: string, s: string): OpenDataQuery;

    substringOf(name: string, s: string): OpenDataQuery;

    substring(name: string, pos: number, length: number): OpenDataQuery;

    length(name: OpenDataQuery): OpenDataQuery;

    toLower(name: string): OpenDataQuery;

    trim(name: string): OpenDataQuery;

    concat(s0: string, s1: string, s2?: string, s3?: string, s4?: string): this;

    field(name: string): any;

    day(name: string): OpenDataQuery;

    hour(name: string): OpenDataQuery;

    month(name: string): OpenDataQuery;

    minute(name: string): OpenDataQuery;

    second(name: string): OpenDataQuery;

    year(name: string): OpenDataQuery;

    round(name: string): OpenDataQuery;

    floor(name: string): OpenDataQuery;

    ceiling(name: string): OpenDataQuery;

    notEqual(name: string): OpenDataQuery;

    greaterThan(name: string): OpenDataQuery;

    greaterOrEqual(name: string): OpenDataQuery;

    lowerThan(name: string): OpenDataQuery;

    lowerOrEqual(name: string): OpenDataQuery;

    in(values: Array<any>): OpenDataQuery;

    notIn(values: Array<any>): OpenDataQuery;

}

export declare class QueryFieldRef {
    constructor(entity: string, name: string);
}

export declare class QueryValueRef {
    constructor(value: any);
}