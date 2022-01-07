import { json, urlencoded } from 'body-parser';
import cookieParser from 'cookie-parser'
import cookieSession from 'cookie-session'
import { DatabaseConfig, OpenAPiParams, ServerOption } from '../@types';
import { Express } from 'express';
import { FastifyInstance } from 'fastify';
import { AppMiddleware } from './../@types/index';
import multer, { Multer } from 'multer';
import path from 'path';
import glob from 'glob';
import swagger from 'swagger-schema-official'
import { registerController, registerMiddleware } from '../@decorators';
import { Model, ModelCtor, Sequelize } from 'sequelize-typescript';
import database from '../providers/database';
import { ENV } from './../utils/env';
import { registerSocket } from './../@factory/socket-factory';
import { Server } from 'socket.io';
import { SyncOptions } from 'sequelize/types';
var globule = require('globule');

export class App {
    options?: ServerOption
    databaseConfig?: DatabaseConfig
    openapiOptions?: OpenAPiParams
    app: Express | FastifyInstance | undefined
    isfastify?: boolean
    db: Sequelize
    syncOption?: SyncOptions | undefined
    middlewares: { [key: string]: (new () => AppMiddleware)[] } = { "/": [] };
    spec: swagger.Spec = {
        swagger: '2.0', 
        info: {
            title: 'API SERVER ',
            version: '1.0.0',
        },
        schemes: ["http", "https"],
        paths: {},
    };

    constructor() {
        this.db = database
    }
    public setServerOption(options: ServerOption) {
        this.options = options;
    }
    public initDatabase(config: DatabaseConfig) {
        this.databaseConfig = config;
    }

    public async serve(...args: any) {
        await this.config()
        // loads models 
        if (this.options?.models) {
            const modelsFinds = this.options?.models?.reduce<(string | ModelCtor<Model<any, any>>)[]>((p, n) => {
                const s = String(n) + String(ENV.Get('EXTENSION') ?? '.ts')
                p.push(s)
                return p;
            }, []) ?? []
            this.db.addModels(modelsFinds);
        }
        else {
            this.db.addModels([path.join(process.cwd(), 'models/**/*Model') + String(ENV.Get('EXTENSION') ?? '.ts')]);
        }
        await this.db.sync(this.syncOption ? this.syncOption : { alter: false });
        //register db to request
        (this.app as any)['use']((req: any, res: any, next: () => void) => {
            req.db = this.db
            next()
        })
        // setup 
        await this.setup()
    }

    public async config() {
        // check if have database config
        if(this.databaseConfig){
            this.db = new Sequelize(this.databaseConfig)
        }
        const app = (this.app as any)
        if (this.options && this.options.cors) {
            app['use'](require('cors')())
        }
        // (this.app)['use'](json(this.options && this.options.json ? this.options.json : { limit: '150mb' }))
        app['use'](urlencoded(this.options && this.options.urlencoded ? this.options.urlencoded : { extended: true }));
        app['use'](cookieParser())
        app['use'](cookieSession({
            name: 'session',
            keys: this.options && this.options.sessionSecretKey ? this.options.sessionSecretKey : ['super_secret', 'super_secret'],
        }))
    }

    public async setup() {
        // load middlewares 
        if (this.options && Array.isArray(this.options.middlewares) && this.options.middlewares.length > 0 && (this.options.middlewares as any[]).every(t => typeof t === "string")) {
            // (this.options.middlewares as String[]).push('!**/Inject*')
            const middlewaresFind = (this.options.middlewares as String[])?.reduce((p, n) => {
                const s = String(n) + String(ENV.Get('EXTENSION') ?? '.ts')
                p.push(s)
                return p;
            }, [] as string[]) ?? []
            let middlewares = globule.find(middlewaresFind)
            for (let mwr of middlewares) {
                let middlewareFunction = require(mwr).default as (new () => AppMiddleware);
                this.middlewares['/'].push(middlewareFunction)
            }
        }
        else if (this.options) {
            this.middlewares['/'].concat(this.options.middlewares as (new () => AppMiddleware)[])
        }
        // config middlewares 
        for (let key of Object.keys(this.middlewares) || []) {
            let middlewares = this.middlewares[key];
            for (let middleware of middlewares || []) {
                await registerMiddleware(this, new middleware(), key)
            }
        }
        // config file upload
        this.configMulter()

        // load controllers 
        for (let controller of (this.options && this.options.controllers ? this.options.controllers : [])) {
            if (typeof controller === "string") {
                let directory = path.join(controller.toString() + String(String(ENV.Get('EXTENSION') ?? '.ts')))
                let controllers = glob.sync(directory);
                for (let ctrl of controllers) {
                    controller = require(ctrl).default as Function;
                    this.spec = await registerController((this.app as any), controller, this.isfastify ?? false, this.spec, this.options && this.options.cookieParams ? this.options.cookieParams : undefined,)
                }
            }
            else {
                this.spec = await registerController((this.app as any), controller as Function, this.isfastify ?? false, this.spec, this.options && this.options.cookieParams ? this.options.cookieParams : undefined)
            }
        }
        // register socket
        for (let socketPath of (this.options && this.options.sockets ? this.options.sockets : [])) {
            if (typeof socketPath === "string") {
                let directory = path.join(socketPath.toString() + (String(ENV.Get('EXTENSION') ?? '.ts')))
                let sockets = glob.sync(directory);
                for (let socket of sockets) {
                    let event = require(socket).default as Function;
                    let io = this.isfastify ? (this.app as any).io : (this.app as any).get('io') as Server
                    await registerSocket(io, event)
                }
            }
        }
        // setup openapi
        await this.configOpenApiMiddleware()
    }

    public async configMulter() {
        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, path.join(process.cwd(), String(this.options?.staticFolder ?? 'public') + '/uploads/'))
            },
            filename: (req, file, cb) => {
                let ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
                const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9) + ext
                cb(null, file.fieldname + '_' + uniqueSuffix)
            }
        })
        const upload: Multer = multer(this.options && this.options.uploadOption ? this.options.uploadOption : { storage: storage })
        if (this.isfastify) {
            (this.app as any)['use']('/', upload.any())
        }
        else {
            (this.app as any)['use'](upload.any())
        }
    }

    public setMiddlewares(middlewares: { '/': (new () => AppMiddleware)[] }) {
        this.middlewares = middlewares;
    }

    public use(middleware: (new () => AppMiddleware) | String, callback: (new () => AppMiddleware)) {
        if (middleware instanceof String) {
            this.middlewares[String(middleware)].push(callback)
        }
        else {
            this.middlewares['/'].push(middleware)
        }
    }

    public configOpenAPi(openapiOptions: OpenAPiParams) {
        this.openapiOptions = openapiOptions
        this.spec = {
            swagger: '2.0.0',
            info: this.openapiOptions ? this.openapiOptions.options : {
                title: 'API SERVER ',
                version: '3.0.0'
            },
            paths: {},
        }
    }

    public configDatabaseOption(options: SyncOptions) {
        this.syncOption = options;
    }

    public async configOpenApiMiddleware() {

    }


}