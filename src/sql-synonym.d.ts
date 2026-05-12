export declare class SqlSynonym extends Map<string, string> {
    add(...args: [name: string, synonym: string] | [entries: [string, string][]]): SqlSynonym;
    resolve(name: string): string;
    static getInstance(): SqlSynonym;
    static add(...args: [name: string, synonym: string] | [entries: [string, string][]]): SqlSynonym;
    static remove(name: string): boolean;
    static clear(): void;
    static get(name: string): string | undefined;
    static resolve(name: string): string;
}
