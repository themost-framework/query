export declare class SqlSynonym extends Map<string, string> {
    constructor();
    constructor(entries?: readonly (readonly [string, string])[] | null);
    resolve(name: string): string;
    static getInstance(): SqlSynonym;
}
