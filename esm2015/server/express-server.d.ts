import { Express } from "express";
import { ServerOption } from "../@types";
import { App } from "./server";
export declare class ExpressApplication extends App {
    app: Express;
    isfastify: false;
    options: ServerOption;
    constructor();
    config(): Promise<void>;
    configOpenApiMiddleware(): Promise<void>;
    serve(port?: number, callback?: (port: number) => void): Promise<void>;
}
