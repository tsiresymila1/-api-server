/// <reference types="node" />
import { Express } from "express";
import { ServerOption } from "../@types";
import { App } from "./server";
import http from 'http';
export declare class ExpressApplication extends App {
    app: Express;
    isfastify: boolean;
    options: ServerOption | undefined;
    server: http.Server | undefined;
    constructor();
    config(): Promise<void>;
    configOpenApiMiddleware(): Promise<void>;
    serve(port?: number, callback?: (port: number) => void): Promise<void>;
}
