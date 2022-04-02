
export declare class OpenDataQuery {
    select(...attr: string[]): this;

    take(val: number): this;

    skip(val: number): this;

    orderBy(name: string): this;

    orderByDescending(name: string): this;

    thenBy(name: string): this;

    thenByDescending(name: string): this;

    where(name: string): this;

    where<T>(expr: (value: T, ...param: any) => any, params?: any): this;

    and(name: string): this;

    or(name: string): this;

    indexOf(name: string): this;

    equal(value: any): this;

    endsWith(name: string, s: string): this;

    startsWith(name: string, s: string): this;

    substringOf(name: string, s: string): this;

    substring(name: string, pos: number, length: number): this;

    length(name: this): this;

    toLower(name: string): this;

    trim(name: string): this;

    concat(s0: string, s1: string, s2?: string, s3?: string, s4?: string): this;

    field(name: string): any;

    day(name: string): this;

    hour(name: string): this;

    month(name: string): this;

    minute(name: string): this;

    second(name: string): this;

    year(name: string): this;

    round(name: string): this;

    floor(name: string): this;

    ceiling(name: string): this;

    notEqual(name: string): this;

    greaterThan(name: string): this;

    greaterOrEqual(name: string): this;

    lowerThan(name: string): this;

    lowerOrEqual(name: string): this;

    in(values: Array<any>): this;

    notIn(values: Array<any>): this;

}
