// MOST Web Framework Copyright (c) 2014-2021 THEMOST LP released under the BSD3-Clause license

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

    clone(): this;
    as(alias: string): this;
    fields(): Array<any>;
    hasFilter(): boolean;
    prepare(userOr?: boolean): this;
    hasFields(): boolean;
    hasPaging(): boolean;
    distinct(value: any): this;
    where<T>(expr: (value: T) => boolean, params?: any): this;
    where<T,J>(expr: (value1: T, value2: J) => any, params?: any): this;
    where(expr: any, params?: any): this;
    injectWhere(where: any): void;
    delete(entity: string): this;
    insert(obj: any): this;
    into(entity: string): this;
    update(entity: string): this;
    set(obj: any): this;
    select<T>(expr: (value: T) => any, params?: any): this;
    select<T,J>(expr: (value1: T, value2: J) => any, params?: any): this;
    select(...args: any[]): this;
    select(...field: Array<any>): this;
    count(alias: string): this;
    from(entity: string | QueryEntity | any): this;
    join(entity: string | QueryEntity | any, props?: any, alias?: any): this;
    with<T,J>(localField: (value: T) => any, foreignField: (value: T) => any): this;
    with(localField: any, foreignField: any): this;
    with(obj: any): this;
    orderBy<T>(expr: (value: T) => any, params?: any): this;
    orderBy(...args: any[]): this;
    orderByDescending<T>(expr: (value: T) => any, params?: any): this;
    orderByDescending(...args: any[]): this;
    thenBy<T>(expr: (value: T) => any, params?: any): this;
    thenBy(...args: any[]): this;
    thenByDescending<T>(expr: (value: T) => any, params?: any): this;
    thenByDescending(...args: any[]): this;
    groupBy<T>(expr: (value: T) => any, params?: any): this;
    groupBy(...args: any[]): this;
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
    static length(name: any): QueryField;
    static trim(name: any): QueryField;
    static year(name: any): QueryField;
    static date(name: any): QueryField;
    static day(name: any): QueryField;
    static month(name: any): QueryField;
    static hour(name: any): QueryField;
    static minute(name: any): QueryField;
    static second(name: any): QueryField;

    select(name: string): QueryField;
    from(entity: string | QueryEntity): QueryField;
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

    concat(s0: string, s1: string, s2?: string, s3?: string, s4?: string): OpenDataQuery;

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
