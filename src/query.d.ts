import {SyncSeriesEventEmitter} from '@themost/events';

export declare type QueryFunc<T> = (value: T, ...param: any[]) => any;

export declare type QueryJoinFunc<T, J> = (value1: T, value2: J, ...param: any[]) => any;

export declare class QueryExpression {

    static ComparisonOperators: {
        $eq: string | '$eq',
        $ne: string | '$ne',
        $gt: string | '$gt',
        $gte: string | '$gte',
        $lt: string | '$lt',
        $lte: string | '$lte',
        $in: string | '$in',
        $nin:  string | '$nin'
    };

    static LogicalOperators: {
        $or: string | '$or',
        $and: string | '$and',
        $not: string | '$not',
        $nor: string | '$nor'
    }

    static EvaluationOperators: {
        $mod: string | '$mod',
        $add: string | '$add',
        $sub: string | '$sub',
        $mul: string | '$mul',
        $div: string | '$div'
    }

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
    where<T>(expr: (value: T, ...param: any[]) => any, params?: any): this;
    where(expr: string | any): this;
    injectWhere(where: any): void;
    delete(entity: string): this;
    insert(obj: any): this;
    into(entity: string): this;
    update(entity: string): this;
    set(obj: any): this;
    select<T>(expr: QueryFunc<T>, params?: any): this;
    select<T,J>(expr: QueryJoinFunc<T, J>, params?: any): this;
    select(...expr: (string | any)[]): this;
    count(alias: string): this;
    from(entity: string): this;
    from(entity: QueryEntity): this;
    join(entity: any, props?: any, alias?: any): this;
    join(entity: QueryEntity): this;
    leftJoin(entity: any, props?: any, alias?: any): this;
    leftJoin(entity: QueryEntity): this;
    rightJoin(entity: any, props?: any, alias?: any): this;
    rightJoin(entity: QueryEntity): this;
    with(obj: any): this;
    with<T,J>(expr: (value: T, otherValue: J, ...param: any[]) => any, params?: any): this;
    orderBy(expr: string | any): this;
    orderBy<T>(expr: QueryFunc<T>, params?: any): this;
    orderByDescending(expr: string | any): this;
    orderByDescending<T>(expr: QueryFunc<T>, params?: any): this;
    thenBy(expr: string | any): this;
    thenBy<T>(expr: QueryFunc<T>, params?: any): this;
    thenByDescending(expr: string | any): this;
    thenByDescending<T>(expr: (value: T) => any): this;
    groupBy(...expr: (string | any)[]): this;
    groupBy<T>(arg1: QueryFunc<T>, params?: any): this;
    groupBy<T>(arg1: QueryFunc<T>, arg2: QueryFunc<T>, params?: any): this;
    groupBy<T>(arg1: QueryFunc<T>, arg2: QueryFunc<T>, arg3: QueryFunc<T>, params?: any): this;
    groupBy<T>(arg1: QueryFunc<T>, arg2: QueryFunc<T>, arg3: QueryFunc<T>,
               arg4: QueryFunc<T>, params?: any): this;
    groupBy<T>(arg1: QueryFunc<T>, arg2: QueryFunc<T>, arg3: QueryFunc<T>,
               arg4: QueryFunc<T>, arg5: QueryFunc<T>, params?: any): this;
    groupBy<T>(arg1: QueryFunc<T>, arg2: QueryFunc<T>, arg3: QueryFunc<T>,
               arg4: QueryFunc<T>, arg5: QueryFunc<T>, arg6: QueryFunc<T>, params?: any): this;
    groupBy<T>(arg1: QueryFunc<T>, arg2: QueryFunc<T>, arg3: QueryFunc<T>,
               arg4: QueryFunc<T>, arg5: QueryFunc<T>, arg6: QueryFunc<T> , arg7: QueryFunc<T>, params?: any): this;
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
    static FieldNameExpression: RegExp;
    constructor(name?: string | any);
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
    static length(name: string): QueryField;
    static trim(name: string): QueryField;
    static year(name: string): QueryField;
    static date(name: string): QueryField;
    static day(name: string): QueryField;
    static month(name: string): QueryField;
    static hour(name: string): QueryField;
    static minute(name: string): QueryField;
    static second(name: string): QueryField;

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

export declare class QueryFieldRef {
    constructor(entity: string, name: string);
}

export declare class QueryValueRef {
    constructor(value: any);
}
