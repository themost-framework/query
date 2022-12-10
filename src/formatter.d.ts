// MOST Web Framework Codename Zero Gravity Copyright (c) 2017-2022, THEMOST LP All rights reserved
import {QueryExpression, QueryField, QueryValueRef} from "./query";

export declare interface FormatterSettings {
    nameFormat: string;
    forceAlias?: boolean;
    useAliasKeyword?: boolean;
}

export declare class SqlFormatter {
    provider: any;
    settings: FormatterSettings;

    escape(value: any,unquoted?: boolean): string | any;
    escapeConstant(value: any,unquoted?: boolean): string | any;
    

    $startsWith(p0:any, p1:any): string | any;
    $endsWith(p0:any, p1:any): string | any;
    $startswith(p0:any, p1:any): string | any;
    $endswith(p0:any, p1:any): string | any;
    $regex(p0:any, p1:any): string | any;
    $length(p0:any): string | any;
    $ifnull(p0:any, p1:any): string | any;
    $ifNull(p0:any, p1:any): string | any;
    $trim(p0:any): string | any;
    $concat(...p0:any): string | any;
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
    formatWhere(where: any): any;
    formatCount(query: QueryExpression | any): any;
    formatFixedSelect(query: QueryExpression | any): any;
    formatSelect(query: QueryExpression | any): any;
    formatLimitSelect(query: QueryExpression | any): any;
    formatField(obj: any): any;
    formatOrder(obj: any): any;
    formatGroupBy(obj: any): any;
    formatInsert(query: QueryExpression | any): any;
    formatUpdate(query: QueryExpression | any): any;
    formatDelete(query: QueryExpression | any): any;
    escapeName(name: string): any;
    formatFieldEx(obj: any, format: string): any;
    format(obj: any, s?: string): any;

}
