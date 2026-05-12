export declare class SqlSynonym {
    static add(name: string, synonym: string): void;
    static remove(name: string): boolean;
    static clear(): void;
    static get(name: string): string | undefined;
    static resolve(name: string): string;
}
