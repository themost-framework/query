import { SyncSeriesEventEmitter } from "@themost/events";
import { ExpressionBase, OrderByAnyExpression } from "./expressions";
import { OpenDataParser } from "./odata";

export declare class SimpleOpenDataParser extends OpenDataParser {

    resolvingMember: SyncSeriesEventEmitter<{target: SimpleOpenDataParser, member: string}>;
    resolvingMethod: SyncSeriesEventEmitter<{target: SimpleOpenDataParser, method: string}>;

    parseSync(data: string): ExpressionBase;
    parseSelectSequenceSync(str: string): Array<ExpressionBase>;
    parseOrderBySequenceSync(str: string): Array<OrderByAnyExpression>;
    parseGroupBySequenceSync(str: string): Array<ExpressionBase>;
    parseQueryOptionsSync(queryOptions: { $select?: string; $filter?: string; $expand?: string; $groupBy?: string; $orderBy?: string; $levels?: any; $top?: any; $skip?: any; }): any;
    parseExpandSequenceSync(str: string): Array<{ name: string; options: { $select?: string; $filter?: string; $expand?: string; $groupBy?: string; $orderBy?: string; $levels?: any; $top?: any; $skip?: any; }; }>;

}