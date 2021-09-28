// MOST Web Framework 2.0 Codename Blueshift Copyright (c) 2017-2020, THEMOST LP All rights reserved
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

    clone():QueryExpression;
    as(alias: string): QueryExpression;
    fields(): Array<any>;
    hasFilter(): boolean;
    prepare(userOr?: boolean): QueryExpression;
    hasFields(): boolean;
    hasPaging(): boolean;
    distinct(value: any): QueryExpression;
    where(field: any): QueryExpression;
    injectWhere(where: any);
    delete(entity: string): QueryExpression;
    insert(obj: any): QueryExpression;
    into(entity: string): QueryExpression;
    update(entity: string): QueryExpression;
    set(obj: any): QueryExpression;
    select(...field: Array<any>): QueryExpression;
    select<T>(expr: (value: T) => any, params?: any): QueryExpression;
    select<T,J>(expr: (value1: T, value2: J) => any, params?: any): QueryExpression;
    count(alias: string): QueryExpression;
    from(alias: string): QueryExpression;
    join(entity: any, props?: any, alias?: any): QueryExpression;
    join(entity: QueryEntity): QueryExpression;
    leftJoin(entity: any, props?: any, alias?: any,): QueryExpression;
    leftJoin(entity: QueryEntity): QueryExpression;
    rightJoin(entity: any, props?: any, alias?: any): QueryExpression;
    rightJoin(entity: QueryEntity): QueryExpression;
    with(obj: any): QueryExpression;
    with<T,J>(expr: (value: T, otherValue: J) => any, params?: any): QueryExpression;
    orderBy(field: string): QueryExpression;
    orderBy<T>(expr: (value: T) => any): QueryExpression;
    orderByDescending(field: string): QueryExpression;
    orderByDescending<T>(expr: (value: T) => any): QueryExpression;
    thenBy(field: string): QueryExpression;
    thenBy<T>(expr: (value: T) => any): QueryExpression;
    thenByDescending(name: string): QueryExpression;
    thenByDescending<T>(expr: (value: T) => any): QueryExpression;
    groupBy(...field: Array<any>): QueryExpression;
    groupBy<T>(expr: (value: T) => any): QueryExpression;
    or(field: any): QueryExpression;
    and(field: any): QueryExpression;
    equal(value: any): QueryExpression;
    notEqual(value: any): QueryExpression;
    in(values: Array<any>): QueryExpression;
    notIn(values: Array<any>): QueryExpression;
    mod(value: any, result: number): QueryExpression;
    bit(value: any, result: number): QueryExpression;
    greaterThan(value: any): QueryExpression;
    startsWith(value: any): QueryExpression;
    endsWith(value: any): QueryExpression;
    contains(value: any): QueryExpression;
    notContains(value: any): QueryExpression;
    lowerThan(value: any): QueryExpression;
    lowerOrEqual(value: any): QueryExpression;
    greaterOrEqual(value: any): QueryExpression;
    between(value1: any, value2: any): QueryExpression;
    skip(n: number): QueryExpression;
    take(n: number): QueryExpression;
    add(x: number): QueryExpression;
    subtract(x: number): QueryExpression;
    multiply(x: number): QueryExpression;
    divide(x: number): QueryExpression;
    round(n: number): QueryExpression;
    substr(start: number,length?: number): QueryExpression;
    indexOf(s: string): QueryExpression;
    concat(s: string): QueryExpression;
    trim(): QueryExpression;
    length(): QueryExpression;
    getDate(): QueryExpression;
    getYear(): QueryExpression;
    getMonth(): QueryExpression;
    getDay(): QueryExpression;
    getMinutes(): QueryExpression;
    getHours(): QueryExpression;
    getSeconds(): QueryExpression;
    floor(): QueryExpression;
    ceil(): QueryExpression;
    toLocaleLowerCase(): QueryExpression;
    toLocaleUpperCase(): QueryExpression;

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

    concat(s0: string, s1: string, s2?: string, s3?: string, s4?: string): QueryExpression;

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
