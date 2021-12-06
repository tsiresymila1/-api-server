import { FastifyInstance } from "fastify";
import { ServerOption } from "../@types";
import { Express } from 'express';
import { App } from "./server";
export declare class FastifyApplication extends App {
    app: FastifyInstance;
    appe: Express | undefined;
    options: ServerOption | undefined;
    constructor();
    config(): Promise<void>;
    configOpenApiMiddleware(): Promise<void>;
    serve(port: string | number, address: string, backlog: number, callback: (err: Error | null, address: string) => void): Promise<void>;
}
