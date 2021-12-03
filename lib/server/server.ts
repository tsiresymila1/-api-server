import { json, urlencoded } from 'body-parser';
import cookieParser from 'cookie-parser'
import cookieSession from 'cookie-session'
import { OpenAPiParams, ServerOption } from '../@types';
import { Express } from 'express';
import { FastifyInstance } from 'fastify';
import { AppMiddleWare } from './../@types/index';
import multer, { Multer } from 'multer';
import path from 'path';
import glob from 'glob';
import swagger from 'swagger-schema-official'
import { registerController, registerMiddleware } from '../@decorators';
import { Sequelize } from 'sequelize-typescript';
import database from '../providers/database';
var globule = require('globule');

export class App {
    options?: ServerOption
    openapiOptions?: OpenAPiParams
    app: Express | FastifyInstance
    isfastify?: boolean
    db: Sequelize
    middlewares: { [key: string]: (new () => AppMiddleWare)[] } = { "/": [] };
    spec: swagger.Spec = {
        swagger: '2.0',
        info: {
            title: 'API SERVER ',
            version: '1.0.0'
        },
        paths: {},
    };

    constructor() {
        this.db = database
    }
    public setServerOption(options: ServerOption) {
        this.options = options;
    }
    public async serve(...args) {
        await this.config()
        // loads models 
        if (this.options.models) {
            this.db.addModels(this.options.models);
        }
        else {
            this.db.addModels([path.join(process.cwd(), 'models/**/*Model.ts')]);
        }
        await this.db.sync({ force: true, alter: true })
        this.app['use']((req, res, next) => {
            req.db = this.db
            next()
        })
        await this.setup()
    }

    public async config() {
        if (this.options && this.options.cors) {
            this.app['use'](require('cors')())
        }
        this.app['use'](json(this.options.json ?? { limit: '150mb' }))
        this.app['use'](urlencoded(this.options.urlencoded ?? { extended: true }));
        this.app['use'](cookieParser())
        this.app['use'](cookieSession({
            name: 'session',
            keys: this.options.sessionSecretKey ?? ['super_secret', 'super_secret']
        }))
    }

    public async setup() {
        // load middlewares 
        if (Array.isArray(this.options.middlewares) && this.options.middlewares.length > 0 && (this.options.middlewares as any[]).every(t => typeof t === "string")) {
            (this.options.middlewares as String[]).push('!**/Inject*.ts')
            let middlewares = globule.find(this.options.middlewares)
            for (let mwr of middlewares) {
                let middlewareFunction = require(mwr).default as (new () => AppMiddleWare);
                this.middlewares['/'].push(middlewareFunction)
            }
        }
        else {
            this.middlewares['/'].concat(this.options.middlewares as (new () => AppMiddleWare)[])
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
        for (let controller of this.options.controllers || []) {
            if (typeof controller === "string") {
                let directory = path.join(controller.toString())
                let controllers = glob.sync(directory);
                for (let ctrl of controllers) {
                    controller = require(ctrl).default as Function;
                    this.spec = await registerController(this.app, controller, this.isfastify, this.options.cookieParams, this.spec)
                }
            }
            else {
                this.spec = await registerController(this.app, controller as Function, this.isfastify, this.options.cookieParams, this.spec)
            }
        }
        // setup openapi
        await this.configOpenApiMiddleware()
    }

    public async configMulter() {
        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, path.join(process.cwd(), 'public/uploads/'))
            },
            filename: function (req, file, cb) {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
                cb(null, file.fieldname + '-' + uniqueSuffix)
            }
        })
        const upload: Multer = multer(this.options.uploadOption ?? { storage: storage })
        if (this.isfastify) {
            this.app['use']('/', upload.any())
        }
        else {
            this.app['use'](upload.any())
        }
    }

    public setMiddlewares(middlewares: { '/': (new () => AppMiddleWare)[] }) {
        this.middlewares = middlewares;
    }

    public use(middleware: (new () => AppMiddleWare) | String, callback?: (new () => AppMiddleWare)) {
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
            swagger: '2.0',
            info: this.openapiOptions ? this.openapiOptions.options : {
                title: 'API SERVER ',
                version: '1.0.0'
            },
            paths: {},
        }
    }

    public async configOpenApiMiddleware() {

    }


}