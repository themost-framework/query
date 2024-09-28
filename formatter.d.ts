// MOST Web Framework Codename Blueshift Copyright (c) 2017-2022, THEMOST LP All rights reserved
import {QueryExpression} from "./query";

export declare interface FormatterSettings {
    nameFormat: string;
    forceAlias?: boolean;
    useAliasKeyword?: boolean;
}

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
    formatFixedSelect(query: QueryExpression|any): string;
    formatSelect(query: QueryExpression|any): string;
    formatLimitSelect(query: QueryExpression|any): string;
    formatField(obj: any): string;
    formatOrder(obj: any): string;
    formatGroupBy(obj: any): string;
    formatInsert(query: QueryExpression|any): string;
    protected formatInsertInto(query: QueryExpression): string;
    formatUpdate(query: QueryExpression|any): string;
    formatDelete(query: QueryExpression|any): string;
    escapeName(name: string): string;
    formatFieldEx(obj: any, format: string);
    format(obj: any, s?: string);

}
