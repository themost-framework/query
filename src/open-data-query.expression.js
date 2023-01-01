import { QueryExpression } from './query';
import { ClosureParser } from './closures/ClosureParser';

class OpenDataQuery extends QueryExpression {
    constructor() {
        super();
        this.resolvingJoinMember.subscribe((event) => {
            const fullyQualifiedMember = event.fullyQualifiedMember.split('.');
            if (fullyQualifiedMember.length > 2) {
                fullyQualifiedMember.pop();
                event.object = fullyQualifiedMember.reverse().join('.');
            }
        });
    }
    // eslint-disable-next-line no-unused-vars
    expand(expr) {
        const args = Array.from(arguments);
        this.$expand = [];
        for (const arg of args) {
            if (arg instanceof OpenDataQuery) {
                this.$expand.push(arg);
            } else if (typeof arg === 'function') {
                // convert closure to query expression
                this.$expand.push(any(arg));
            } else if (typeof arg === 'string') {
                this.$expand.push(arg);
            } else {
                throw new Error('Expected string, closure or instance of query expression');
            }
        }
        return this;
    }
}

function any(expr) {
    if (typeof expr === 'string') {
        return new OpenDataQuery(expr);
    }
    if (typeof expr !== 'function') {
        throw new Error('Expected closure');
    }
    /**
     * @type {Array<{$name: string}>}
     */
    const select = new ClosureParser().parseSelect(expr);
    if (select.length === 0 || select.length > 1) {
        throw new Error('Select closure should return a single expression.');
    }
    const expand = select[0].$name;
    // get expand segments e.g. customer.address => [ 'customer', 'address' ]
    const expands = expand.split('.');
    let index = 0;
    const result = new OpenDataQuery().from(expands[index]);
    let current = result;
    index += 1;
    while(index < expands.length) {
        let expand = new OpenDataQuery().from(expands[index]);
        current.$expand = [
            expand
        ];
        current = expand;
        index += 1;
    }
    return result;
}

export {
    any,
    OpenDataQuery
}