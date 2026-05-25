export declare class SqlSynonym {
    set(synonym: string, value: string): this;
    drop(synonym: string): this;
    get(synonym: string): string;
    format(value: string): string;
}