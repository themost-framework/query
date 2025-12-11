// MOST Web Framework Codename Blueshift Copyright (c) 2017-2022, THEMOST LP All rights reserved
import {QueryEntity, QueryExpression} from './query';

export declare interface FormatterSettings {
    nameFormat: string;
    forceAlias?: boolean;
    useAliasKeyword?: boolean;
}

export type QueryToken = string | any;

export declare class SqlFormatter {
    provider: any;
    settings: FormatterSettings;

    formatComparison(comparison: any): string;
    isComparison(obj: any): boolean;
    escape(value: any,unquoted?: boolean): string;
    escapeConstant(value: any,unquoted?: boolean): string;
    formatWhere(where: any): string;

    $or(...arg:any): string;
    $and(...arg:any): string;
    $not(arg:any): string;
    $startswith(p0:any, p1:any): string;
    $endswith(p0:any, p1:any): string;
    $regex(p0:any, p1:any): string;
    $length(p0:any): string;
    $ifnull(p0:any, p1:any): string;
    $ifNull(p0:any, p1:any): string;
    $trim(p0:any): string;
    $concat(p0:any, p1:any): string;
    $indexof(p0:any, p1:any): string;
    $substring(p0: any, pos: number, length?: number): string;
    $substr(p0: any, pos: number, length?: number): string;
    $tolower(p0: any): string;
    $toupper(p0: any): string;
    $contains(p0:any, p1:any): string;
    $text(p0:any, p1:any): string;
    $day(p0:any): string;
    $dayOfMonth(p0:any): string;
    $month(p0:any): string;
    $year(p0:any): string;
    $hour(p0:any): string;
    $minute(p0:any): string;
    $second(p0:any): string;
    $date(p0: any): string;
    $floor(p0: any): string;
    $ceiling(p0: any): string;
    $round(p0:any, p1?:any): string;
    $add(p0:any, p1:any): string;
    $sub(p0:any, p1:any): string;
    $subtract(p0:any, p1:any): string;
    $mul(p0:any, p1:any): string;
    $multiply(p0:any, p1:any): string;
    $div(p0:any, p1:any): string;
    $divide(p0:any, p1:any): string;
    $mod(p0:any, p1:any): string;
    $bit(p0:any, p1:any): string;
    $count(p0:any): string | any;
    $min(p0:any): string | any;
    $max(p0:any): string | any;
    $avg(p0:any): string | any;
    $sum(p0:any): string | any;
    $cond(ifExpr: any,
          thenExpr: QueryField | QueryValueRef | any,
          elseExpr: QueryField | QueryValueRef | any): string | any;
    $switch(expr: {
        branches: {case: any, then: any}[], defaultValue?: any
    }): string | any;

    formatCount(query: QueryExpression|any): string;
    formatFixedSelect(query: QueryExpression|any): string | unknown;
    formatSelect(query: QueryExpression|any): string | unknown;
    formatLimitSelect(query: QueryExpression|any): string | unknown;
    formatField(obj: any): string | unknown;
    formatOrder(obj: any): string | unknown;
    formatGroupBy(obj: any): string | unknown;
    formatInsert(query: QueryExpression|any): string | unknown;
    protected formatInsertInto(query: QueryExpression): string;
    formatUpdate(query: QueryExpression|any): string;
    formatDelete(query: QueryExpression|any): string;
    escapeName(name: string): string;
    formatFieldEx(obj: any, format: string);
    format(obj: any, s?: string);
    protected formatAdditionalSelect(expr: (QueryEntity | any)): string;
    protected formatAdditionalJsonSelect(expr: (QueryEntity | any)): string;

}

export declare interface SqlFormatterFactory {
    formatterClass: (...args: any[]) => SqlFormatter;
}

/**
 * Interface representing a JSON Get Formatter.
 * Provides a method to format a JSON get expression.
 */
export declare interface JsonGetFormatter {
    $jsonGet(expr: QueryField | { $name: string }): QueryToken;
    $jsonEach(expr: (QueryField | Record<string, unknown>)): QueryToken;
}

/**
 * Interface representing a JSON object formatter.
 * 
 * @interface JsonObjectFormatter
 */
export declare interface JsonObjectFormatter {
    $jsonObject(...expr: (QueryField | Record<string, unknown>)[]): QueryToken;
}

/**
 * Interface representing a JSON array formatter.
 */
export declare interface JsonArrayFormatter {
    /**
     * Formats the given query expression as a JSON array.
     * @param expr - The query expression to format.
     * @returns A query token representing the formatted JSON array.
     */
    $jsonArray(expr: QueryExpression): QueryToken;

    /**
     * Formats the given query expression as a grouped JSON array.
     * @param expr - The query expression to format.
     * @returns A query token representing the formatted grouped JSON array.
     */
    $jsonGroupArray(expr: QueryExpression): QueryToken;
}