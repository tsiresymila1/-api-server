import { OpenAPiParams, ServerOption } from '../@types';
import { Express } from 'express';
import { FastifyInstance } from 'fastify';
import { AppMiddleware } from './../@types/index';
import swagger from 'swagger-schema-official';
import { Sequelize } from 'sequelize-typescript';
import { SyncOptions } from 'sequelize/types';
export declare class App {
    options?: ServerOption;
    openapiOptions?: OpenAPiParams;
    app: Express | FastifyInstance | undefined;
    isfastify?: boolean;
    db: Sequelize;
    syncOption?: SyncOptions | undefined;
    middlewares: {
        [key: string]: (new () => AppMiddleware)[];
    };
    spec: swagger.Spec;
    constructor();
    setServerOption(options: ServerOption): void;
    serve(...args: any): Promise<void>;
    config(): Promise<void>;
    setup(): Promise<void>;
    configMulter(): Promise<void>;
    setMiddlewares(middlewares: {
        '/': (new () => AppMiddleware)[];
    }): void;
    use(middleware: (new () => AppMiddleware) | String, callback: (new () => AppMiddleware)): void;
    configOpenAPi(openapiOptions: OpenAPiParams): void;
    configDatabaseOption(options: SyncOptions): void;
    configOpenApiMiddleware(): Promise<void>;
}
