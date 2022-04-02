// MOST Web Framework Codename Zero Gravity Copyright (c) 2017-2022, THEMOST LP All rights reserved
import {QueryExpression} from "./query";
export declare class QueryUtils {
    /**
     *
     * @param {string=} entity
     * @returns {QueryExpression}
     */
    static query(entity?: string): QueryExpression;

    /**
     *
     * @param field
     * @returns {QueryExpression}
     */
    static select(...field: any[]): QueryExpression;

    /**
     *
     * @param obj
     * @returns {QueryExpression}
     */
    static insert(obj: any): QueryExpression;

    /**
     *
     * @param {string} entity
     * @returns {QueryExpression}
     */
    static update(entity: string): QueryExpression;

    /**
     *
     * @param {string} entity
     * @returns {QueryExpression}
     */
    static delete(entity: string): QueryExpression;
}

export declare class SqlUtils {
    /**
     *
     * @param {string} sql
     * @param values
     * @returns {string}
     */
    static format(sql: string, values: any): string

    /**
     *
     * @param val
     * @returns {string}
     */
    static escape(val: any): string
}
