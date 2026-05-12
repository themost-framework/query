export declare class SqlSynonym extends Map<string, string> {
    add(...args: [name: string, synonym: string] | [entries: [string, string][]]): SqlSynonym;
    resolve(name: string): string;
    static getInstance(): SqlSynonym;
}
