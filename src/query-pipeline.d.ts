import {QueryExpression} from './query';


export declare interface QueryPipelineProjectGraph {
    [name: string]: string | (1 | 0) | any;
}

export declare interface QueryPipelineSortGraph {
    [name: string]: string | (1 | -1);
}

export declare interface QueryPipelineGroupGraph {
    [name: string]: string | (1 | 0) | any;
}

export type QueryPipelineLogicalOperatorExpr = {
    $eq?: [any, any];
    $ne?: [any, any];
    $gt?: [any, any];
    $gte?: [any, any];
    $lt?: [any, any];
    $lte?: [any, any];
    $in?: [any, any[]];
    $nin?: [any, any[]];
    $and?: QueryPipelineLogicalOperatorExpr[];
    $or?: QueryPipelineLogicalOperatorExpr[];
}

export declare interface QueryPipelineMatchExpr extends QueryPipelineLogicalOperatorExpr {
    [name: string]: any;
}

export declare interface QueryPipelineStageGraph {
    $collection?: { [name: string]: string | 1 };
    $project?: QueryPipelineProjectGraph;
    $addFields?: QueryPipelineProjectGraph;
    $set?: QueryPipelineProjectGraph;
    $lookup?: QueryPipelineLookupGraph;
    $sort?: QueryPipelineSortGraph;
    $group?: QueryPipelineGroupGraph;
    $match?: { $expr: QueryPipelineMatchExpr};
    $limit?: number;
    $skip?: number;
}

export declare interface QueryPipelineLookupGraph {
    from: string;
    localField?: string;
    foreignField?: string;
    let?: string;
    pipeline?: { $match: { $expr: any } }[],
    as?: string
}

export declare class QueryPipeline {
    constructor();
    format(pipeline: QueryPipelineStageGraph[]): QueryExpression;
}