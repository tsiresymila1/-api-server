import express, { Express } from "express";
import { ServerOption } from "../@types";
import path from 'path';
import { json, urlencoded } from 'body-parser';
import cookieParser from 'cookie-parser'
import cookieSession from 'cookie-session'
import { App } from "./server";
import swaggerUi from 'swagger-ui-express'

export class ExpressApplication extends App {
    app: Express
    isfastify: false
    options: ServerOption
    constructor() {
        super()
        this.app = express();
        //this.options = options;
    }

    public async config() {
        super.config();
        this.app.use(json(this.options.json ?? { limit: '50mb' }))
        this.app.use(urlencoded(this.options.urlencoded ?? { extended: true }));
        this.app.use(cookieParser())
        this.app.use(cookieSession({
            name: 'session',
            keys: this.options.sessionSecretKey ?? ['super_secret', 'super_secret']
        }))
        this.app.use(this.options.staticUrl ?? '/static', express.static(this.options.staticFolder ?? path.join(__dirname, 'public')));
    }

    public async configOpenApiMiddleware() {
        this.app.use(this.openapiOptions ? this.openapiOptions.url ?? '/swagger.json' : '/swagger.json', swaggerUi.serve, swaggerUi.setup(this.spec))
    }

    public async serve(port: number = 3000, callback?: (port: number) => void) {
        await super.serve()
        this.app.listen(3000, () => {
            if (callback) {
                callback(port)
            }
        })
    }

}