const { Token } = require('./odata');
// eslint-disable-next-line no-unused-vars
const { ExpressionBase, SwitchExpression, isLogicalOperator, createMemberExpression, MethodCallExpression, SelectAnyExpression, OrderByAnyExpression } = require('./expressions');
const { Args } = require("@themost/common");
const { OpenDataParser, SyntaxToken } = require('./odata');
const { SyncSeriesEventEmitter } = require('@themost/events');

class SimpleOpenDataParser extends OpenDataParser {
    constructor() {
        super();
        this.resolvingMember = new SyncSeriesEventEmitter();
        this.resolvingMethod = new SyncSeriesEventEmitter();
    }

    /**
     * @protected
     * @returns {import('./expressions').MemberExpression|undefined}
     */
    parseMemberSync() {
        if (this.tokens.length === 0) {
            return;
        }
        if (this.currentToken.type !== 'Identifier') {
            throw new Error('Expected identifier.');
        }
        let identifier = this.currentToken.identifier;
        while (this.nextToken && this.nextToken.syntax === SyntaxToken.Slash.syntax) {
            //read syntax token
            this.moveNext();
            //get next token
            if (this.nextToken.type !== 'Identifier') {
                throw new Error('Expected identifier.');
            }
            //read identifier token
            this.moveNext();
            //format identifier
            identifier += '/' + this.currentToken.identifier;
        }
        //support member to member comparison (with $it identifier e.g. $it/address/city or $it/category etc)
        if (/^\$it\//.test(identifier)) {
            identifier = identifier.replace(/^\$it\//, '');
        }
        const event = {
            target: this,
            member: identifier
        }
        this.resolvingMember.emit(event);
        return createMemberExpression(event.member);
    }

    /**
     * @protected
     * @returns {import('./expressions').MethodCallExpression|undefined}
     */
    parseCommonItemSync() {
        if (this.tokens.length===0) {
            return;
        }
        let value;
        switch (this.currentToken.type) {
            case Token.TokenType.Identifier:
                //if next token is an open parenthesis token and the current token is not an operator. current=indexOf, next=(
                if (this.nextToken && this.nextToken.syntax === SyntaxToken.ParenOpen.syntax
                        && this.getOperator(this.currentToken) == null) {
                    //then parse method call
                    return this.parseMethodCallSync();
                } else if (this.getOperator(this.currentToken) === Token.Operator.Not){
                    throw new Error('Not operator is not yet implemented.');
                } else {
                    const result = this.parseMemberSync();
                    while (!this.atEnd() && this.currentToken.syntax === SyntaxToken.Slash.syntax) {
                        throw new Error('Slash syntax is not yet implemented.');
                    }
                    this.moveNext();
                    return result;
                }
            case Token.TokenType.Literal:
                value = this.currentToken.value;
                this.moveNext();
                return value;
            case Token.TokenType.Syntax:
                if (this.currentToken.syntax === SyntaxToken.Negative.syntax) {
                    throw new Error('Negative syntax is not yet implemented.');
                }
                if (this.currentToken.syntax === SyntaxToken.ParenOpen.syntax) {
                    this.moveNext();
                    const result = this.parseCommonSync();
                    this.expect(SyntaxToken.ParenClose);
                    return result;
                }
                else {
                    throw new Error('Expected syntax.');
                }
            default:break;
        }
    }

    /**
     * @protected
     * @returns {ExpressionBase|undefined}
     */
    parseCommonSync() {
        if (this.tokens.length===0) {
            return;
        }
        let result = this.parseCommonItemSync();
        if (this.atEnd()) {
            return result;
        } else if ((this.currentToken.syntax===SyntaxToken.Comma.syntax) ||
            (this.currentToken.syntax===SyntaxToken.ParenClose.syntax)) {
            return result;
        }
        // get current operator
        let oper = this.getOperator(this.currentToken);
        Args.check(oper != null, new Error('Expected operator.'));
        this.moveNext();
        // if current operator is a logical operator ($or, $and etc)
        // parse right operand by using parseCommon() method 
        // important note: the current expression probably is not using parentheses
        // e.g. (category eq 'Laptops' or category eq 'Desktops') and round(price,2) ge 500 and round(price,2) le 1000
        // instead of (category eq 'Laptops' or category eq 'Desktops') and (round(price,2) ge 500) and (round(price,2) le 1000)
        if (this.atEnd() === false && isLogicalOperator(oper)) {
            // parse next expression
            const expr = this.parseCommonSync();
            // return expression
            return this.createExpression(result, oper, expr);
        }
        // otherwise, parse right operand by using parseCommonItemSync() method
        const right = this.parseCommonItemSync();
        // create expression
        const expr = this.createExpression(result, oper, right);
        const atEnd = this.atEnd();
        if (!atEnd && (isLogicalOperator(this.getOperator(this.currentToken)))) {
            oper = this.getOperator(this.currentToken);
            this.moveNext();
            result = this.parseCommonSync();
            return this.createExpression(expr, oper, result);
        }
        return expr;
    }

    /**
     * @protected
     * @returns {Expression|undefined}
     */
    parseMethodCallSync() {
        if (this.tokens.length === 0)  {
            return;
        }
        //get method name
        const method = this.currentToken.identifier;
        this.moveNext();
        this.expect(SyntaxToken.ParenOpen);
        if (method === 'case') {
            const expr = this.parseSwitchMethodBranchesSync([], undefined);
            return new SwitchExpression(expr.branches, expr.defaultValue);
        }
        const args = [];
        this.parseMethodCallArgumentsSync(args);
        const event = {
            target: this,
            method: method,
            args: args
        }
        this.resolvingMethod.emit(event);
        return new MethodCallExpression(event.method, event.args);
    }

    /**
     * @protected
     */
    parseMethodCallArgumentsSync(args) {
        //ensure callback
        args = args || [];
        this.expectAny();
        if (this.currentToken.syntax===SyntaxToken.Comma.syntax) {
            this.moveNext();
            this.expectAny();
            return this.parseMethodCallArgumentsSync(args);
        } else if (this.currentToken.syntax===SyntaxToken.ParenClose.syntax) {
            this.moveNext();
            return Array.from(arguments)
        }
        else {
            const result = this.parseCommonItemSync();
            args.push(result);
            return this.parseMethodCallArgumentsSync(args);
        }
    }

    /**
     * @protected
     * @param {*} branches 
     * @param {*} defaultValue 
     * @returns 
     */
    parseSwitchMethodBranchesSync(branches, defaultValue) {
        /**
         * @type {Token|SyntaxToken|LiteralToken|*}
         */
        let currentToken = this.currentToken;
        if (currentToken.type === Token.TokenType.Literal &&
            currentToken.value === true) {
            this.moveNext();
            this.expect(SyntaxToken.Colon);
            const defaultValue = this.parseCommonSync();
            return {
                branches: branches,
                defaultValue: defaultValue
            };
        }
        const caseExpr = this.parseCommonSync();
        this.expect(SyntaxToken.Colon);
        const thenExpr = this.parseCommonSync();
        branches.push({
            case: caseExpr,
            then: thenExpr
        });
        currentToken = this.currentToken;
        if (currentToken.type === Token.TokenType.Syntax &&
            currentToken.syntax === SyntaxToken.ParenClose) {
            this.moveNext();
            return {
                branches: branches
            };
        }
        this.expect(SyntaxToken.Comma);
        return this.parseSwitchMethodBranchesSync(branches, defaultValue);
    }

    /**
     * Parses OData $select query option
     * @param {string} str 
     * @returns {Array<ExpressionBase>}
     */
    parseSelectSequenceSync(str) {
        this.source = str;
        //get tokens
        this.tokens = this.toList();
        //reset offset
        this.offset = 0; this.current = 0;
        const tokens = this.tokens;
        const results = [];
        if (tokens.length === 0) {
            return results;
        }
        while(this.atEnd() === false) {
            let offset = this.offset;
            let result = this.parseCommonItemSync();
            if (this.currentToken && this.currentToken.type === Token.TokenType.Identifier &&
                this.currentToken.identifier.toLowerCase() === 'as') {
                // get next token
                this.moveNext();
                // get alias identifier
                if (this.currentToken != null && this.currentToken.type === Token.TokenType.Identifier) {
                        result = new SelectAnyExpression(result, this.currentToken.identifier);
                        this.moveNext();
                }
            }
            Object.assign(result, {
                source: this.getSource(offset, this.offset)
            });
            results.push(result);
            if (this.atEnd() === false && this.currentToken.syntax === SyntaxToken.Comma.syntax) {
                this.moveNext();
            }
        }
        return results;
    }
    /**
     * Parses OData $groupby query option e.g. $groupby=category or $groupby=category,year(dateReleased) etc.
     * @param {string} str 
     * @returns {Array<ExpressionBase>}
     */
    parseGroupBySequenceSync(str) {
        return this.parseSelectSequenceSync(str);
    }
    /**
     * Parses OData $expand query option e.g. $expand=category,products or $expand=category($expand=products($select=name,price)) etc.
     * @param {string} str 
     * @returns {Array<ExpressionBase>}
     */
    parseExpandSequenceSync(str) {
        return this.parseExpandSequence(str);
    }

    /**
     * Parses OData $orderby query option e.g. $orderby=category asc, price desc or $orderby=round(price,2) asc etc.
     * @param {string} str 
     * @returns {Array<ExpressionBase>}
     */
    parseOrderBySequenceSync(str) {
        this.source = str;
            //get tokens
        this.tokens = this.toList();
        //reset offset
        this.offset = 0;
        this.current = 0;
        const tokens = this.tokens;
        const results = [];
        if (tokens.length === 0) {
            return results;
        }
        while(this.atEnd() === false) {
            let offset = this.offset;
            let result = this.parseCommonItemSync();
            let direction = 'asc';
            if (this.currentToken && this.currentToken.type === Token.TokenType.Identifier &&
                (this.currentToken.identifier.toLowerCase() === 'asc' || 
                    this.currentToken.identifier.toLowerCase() === 'desc')) {
                    result.source = this.getSource(offset, this.offset);
                    direction = this.currentToken.identifier.toLowerCase();
                    result = new OrderByAnyExpression(result, direction);
                    // go to next token
                    this.moveNext();
                } else {
                    result = new OrderByAnyExpression(result, direction);
                }
            Object.assign(result, {
                source: this.getSource(offset, this.offset)
            });
            results.push(result);
            if (this.atEnd() === false && this.currentToken.syntax === SyntaxToken.Comma.syntax) {
                this.moveNext();
            }
        }
        return results;
    }

    /**
     * 
     * @param {string} str 
     * @returns {ExpressionBase|undefined}
     */
    parseSync(str) {
        if (str == null) {
            return;
        }
        Args.check(typeof str === 'string', new Error('The argument str must be a string.'));
        this.current = 0;
        this.offset = 0;
        this.source = str;
        //get tokens
        this.tokens = this.toList();
        //reset offset
        this.offset=0;
        this.current=0;
        const result = this.parseCommonSync();
        if (typeof result.exprOf === 'function') {
            return result.exprOf();
        }
        return result;
    }

    /**
     * @param {{$select?:string,$filter?:string,$orderBy?:string,$groupBy?:string,$top:number,$skip:number}} queryOptions 
     * @returns {{$where?:ExpressionBase,$select?:Array<ExpressionBase>,$orderBy?:Array<ExpressionBase>,$groupBy?:Array<ExpressionBase>,$expand?:Array<ExpressionBase>,$take?:number,$skip?:number}}
     */
    parseQueryOptionsSync(queryOptions) {
        const result = {};
        if (queryOptions.$filter) {
            const $where = this.parseSync(queryOptions.$filter);
            if ($where) {
                result.$where = $where;
            }
        }
        if (queryOptions.$select) {
            const $select = this.parseSelectSequenceSync(queryOptions.$select);
            if ($select) {
                result.$select = $select;
            }
        }
        if (queryOptions.$orderBy) {
            const $orderby = this.parseOrderBySequenceSync(queryOptions.$orderBy);
            if ($orderby) {
                result.$orderBy = $orderby;
            }
        }
        if (queryOptions.$expand) {
            const $expand = this.parseExpandSequenceSync(queryOptions.$expand);
            if ($expand) {
                result.$expand = $expand;
            }
        }
        if (queryOptions.$groupBy) {
            const $groupBy = this.parseGroupBySequenceSync(queryOptions.$groupBy);
            if ($groupBy) {
                result.$groupBy = $groupBy;
            }
        }
        if (typeof queryOptions.$top === 'number') {
            result.$take = queryOptions.$top;
        }
        if (typeof queryOptions.$skip === 'number') {
            result.$skip = queryOptions.$skip;
        }
        return result;
    }

}
module.exports = {
    SimpleOpenDataParser
}
