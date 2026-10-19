import {QueryEntity, QueryExpression, QueryField} from './query';

function nameReferenceReplacer(key, value) {
    if (typeof value === 'string') {
        if (/^\$((\w+)(\.(\w+))?)$/.test(value)) {
            return {
                $name: value.replace(/^\$/, '')
            }
        }
    }
    return value;
}

class QueryPipeline {
    constructor() {
        //
    }

    /**
     * @param {import('./query-pipeline').QueryPipelineStageGraph[]} pipeline
     * @returns {QueryExpression}
     */
    format(pipeline) {
        if (Array.isArray(pipeline)) {
            if (pipeline.length === 0) {
                throw 'Pipeline must contain at least one stage';
            }
            // the first stage must contain $collection
            const firstStage = pipeline[0];
            if (!firstStage.$collection) {
                throw 'The first stage of the pipeline must contain $collection';
            }
            // initialize query expression from first stage
            const [collection] = Object.keys(firstStage.$collection);
            const entity = (firstStage.$collection[collection] === 1) ?
                new QueryEntity(collection) :
                new QueryEntity(firstStage.$collection[collection]).as(collection);
            const q = new QueryExpression().from(entity);
            // loop stages and apply them to the query expression
            for (let i = 0; i < pipeline.length; i++) {
                const stage = pipeline[i];
                if (stage.$project) {
                    const project = JSON.parse(JSON.stringify(stage.$project, (key, value) => {
                        return nameReferenceReplacer(key, value);
                    }));
                    q.select(...Object.keys(project).map((key) => {
                        const value = project[key];
                        if (value === 1) {
                            return new QueryField(key);
                        } else {
                            return new QueryField(value).as(key);
                        }
                    }));
                }
                if (stage.$addFields) {
                    const addFields = JSON.parse(JSON.stringify(stage.$addFields, (key, value) => {
                        return nameReferenceReplacer(key, value);
                    }));
                    q.select(...Object.keys(addFields).map((key) => {
                        const value = addFields[key];
                        if (value === 1) {
                            return new QueryField(key);
                        } else {
                            return new QueryField(value).as(key);
                        }
                    }));
                }
                if (stage.$match && stage.$match.$expr) {
                    q.$where = JSON.parse(JSON.stringify(stage.$match.$expr, (key, value) => {
                        return nameReferenceReplacer(key, value);
                    }));
                }
                if (stage.$limit) {
                    q.take(stage.$limit);
                }
                if (stage.$skip) {
                    q.skip(stage.$skip);
                }
                if (stage.$sort) {

                }
            }
            return q;
        }
        throw 'Pipeline must be an array of stages';
    }
}

export {QueryPipeline};