
import { ServerOption } from "../@types";
import { App } from "../server/server";
export class AppFactory<T extends App> {
    public server: T;
    constructor(AppInstance: new () => T, options: ServerOption) {
        this.server = new AppInstance()
        this.server.setServerOption(options)
    }

    public static async create<T extends App>(instance: new () => T, options: ServerOption): Promise<App> {
        const app = new AppFactory<T>(instance, options)
        return app.server
    }
}





