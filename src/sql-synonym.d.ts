export declare class SqlSynonym extends Map<string, string> {
    add(name: string | [string, string][], synonym?: string): SqlSynonym;
    resolve(name: string): string;
    static getInstance(): SqlSynonym;
    static add(name: string | [string, string][], synonym?: string): SqlSynonym;
    static remove(name: string): boolean;
    static clear(): void;
    static get(name: string): string | undefined;
    static resolve(name: string): string;
}
