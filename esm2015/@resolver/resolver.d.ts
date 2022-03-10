import { ServerOption } from "../@types";
import { App } from "../server/server";
export declare class AppFactory<T extends App> {
    server: T;
    constructor(AppInstance: new () => T, options: ServerOption);
    static create<T extends App>(instance: new () => T, options: ServerOption): Promise<App>;
}
