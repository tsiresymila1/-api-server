export declare class Hash {
    static defaultkey: string;
    static generate(id: any, expiresInexp?: any): string;
    static auth(token: string): any | boolean;
}
