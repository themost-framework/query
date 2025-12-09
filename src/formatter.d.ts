// MOST Web Framework Codename Zero Gravity Copyright (c) 2017-2022, THEMOST LP All rights reserved
import {QueryEntity, QueryExpression, QueryField, QueryValueRef} from './query';

export declare interface FormatterSettings {
    nameFormat: string;
    forceAlias?: boolean;
    useAliasKeyword?: boolean;
}

export type QueryToken = string | any;

export declare class SqlFormatter {
    provider: any;
    settings: FormatterSettings;
    
    escape(value: any,unquoted?: boolean): string | any;
    escapeConstant(value: any,unquoted?: boolean): string | any;
    
    $or(...arg:any[]): string;
    $and(...arg:any[]): string;
    $not(arg:any): string;
    $startsWith(p0:any, p1:any): string | any;
    $endsWith(p0:any, p1:any): string | any;
    $startswith(p0:any, p1:any): string | any;
    $endswith(p0:any, p1:any): string | any;
    $regex(p0:any, p1:any): string | any;
    $length(p0:any): string | any;
    $ifnull(p0:any, p1:any): string | any;
    $ifNull(p0:any, p1:any): string | any;
    $trim(p0:any): string | any;
    $concat(...p0:any[]): string | any;
    $indexof(p0:any, p1:any): string | any;
    $indexOf(p0:any, p1:any): string | any;
    $indexOfBytes(p0:any, p1:any): string | any;
    $substring(p0: any, pos: number, length?: number): string | any;
    $substr(p0: any, pos: number, length?: number): string | any;
    $tolower(p0: any): string | any;
    $toupper(p0: any): string | any;
    $contains(p0:any, p1:any): string | any;
    $text(p0:any, p1:any): string | any;
    $day(p0:any): string | any;
    $dayOfMonth(p0:any): string;
    $month(p0:any): string | any;
    $year(p0:any): string | any;
    $hour(p0:any): string | any;
    $minute(p0:any): string | any;
    $second(p0:any): string | any;
    $date(p0: any): string | any;
    $floor(p0: any): string | any;
    $ceiling(p0: any): string | any;
    $round(p0:any, p1?:any): string | any;
    $add(p0:any, p1:any): string | any;
    $sub(p0:any, p1:any): string | any;
    $subtract(p0:any, p1:any): string | any;
    $mul(p0:any, p1:any): string | any;
    $multiply(p0:any, p1:any): string | any;
    $div(p0:any, p1:any): string | any;
    $divide(p0:any, p1:any): string | any;
    $mod(p0:any, p1:any): string | any;
    $bit(p0:any, p1:any): string | any;
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
    $toString(arg0:any): string | any;
    $toInt(arg0:any): string | any;
    $toDouble(arg0:any): string | any;
    $toLong(arg0:any): string | any;
    $toDecimal(arg0:any): string | any;
    formatWhere(where: any): any;
    formatCount(query: QueryExpression | any): any;
    formatFixedSelect(query: QueryExpression | any): any;
    formatSelect(query: QueryExpression | any): any;
    formatLimitSelect(query: QueryExpression | any): any;
    formatField(obj: any): any;
    formatOrder(obj: any): any;
    formatGroupBy(obj: any): any;
    formatInsert(query: QueryExpression | any): any;
    protected formatInsertInto(query: QueryExpression): any;
    formatUpdate(query: QueryExpression | any): any;
    formatDelete(query: QueryExpression | any): any;
    escapeName(name: string): any;
    escapeEntity(name: string): any;
    formatFieldEx(obj: any, format: string): any;
    format(obj: any, s?: string): any;
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
