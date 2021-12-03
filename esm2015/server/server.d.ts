import { OpenAPiParams, ServerOption } from '../@types';
import { Express } from 'express';
import { FastifyInstance } from 'fastify';
import { AppMiddleWare } from './../@types/index';
import swagger from 'swagger-schema-official';
import { Sequelize } from 'sequelize-typescript';
export declare class App {
    options?: ServerOption;
    openapiOptions?: OpenAPiParams;
    app: Express | FastifyInstance;
    isfastify?: boolean;
    db: Sequelize;
    middlewares: {
        [key: string]: (new () => AppMiddleWare)[];
    };
    spec: swagger.Spec;
    constructor();
    setServerOption(options: ServerOption): void;
    serve(...args: any[]): Promise<void>;
    config(): Promise<void>;
    setup(): Promise<void>;
    configMulter(): Promise<void>;
    setMiddlewares(middlewares: {
        '/': (new () => AppMiddleWare)[];
    }): void;
    use(middleware: (new () => AppMiddleWare) | String, callback?: (new () => AppMiddleWare)): void;
    configOpenAPi(openapiOptions: OpenAPiParams): void;
    configOpenApiMiddleware(): Promise<void>;
}
