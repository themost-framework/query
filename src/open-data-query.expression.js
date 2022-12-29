import { QueryExpression } from './query';

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
}

export {
    OpenDataQuery
}