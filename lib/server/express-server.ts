import express, { Express } from "express";
import { ServerOption } from "../@types";
import path from 'path';
import { json, raw, urlencoded } from 'body-parser';
import cookieParser from 'cookie-parser'
import cookieSession from 'cookie-session'
import { App } from "./server";
import swaggerUi from 'swagger-ui-express'
import http from 'http'
import { Server } from 'socket.io';
import  {edgeEngine, setupEdgeJsBundle } from './edge-template';
import  {twigEngine,setupTwigJsBundle } from './twing-template';


export class ExpressApplication extends App {
    app: Express
    isfastify: boolean = false
    options: ServerOption | undefined
    server: http.Server | undefined
    constructor() {
        super()
        this.app = express();
        //this.options = options;
    }

    public async config() {
        if (this.options?.enableSocketIo) {
            this.server = http.createServer(this.app)
            this.app.set('io', new Server(this.server, {
                cors: {
                    origin: "*",
                    credentials: true
                }
            }));
        }
        super.config();
        this.app.use(raw(this.options?.json ?? { limit: '50mb' }))
        this.app.use(urlencoded(this.options?.urlencoded ?? { extended: true }));
        this.app.use(cookieParser())
        this.app.use(cookieSession({
            name: 'session',
            keys: this.options?.sessionSecretKey ?? ['super_secret', 'super_secret']
        }))
        const staticPath = this.options?.staticUrl ?? '/static';
        this.app.use(staticPath, express.static(this.options?.staticFolder ?? path.join(__dirname, 'public')));
        
        if(this.options?.viewEngine && this.options?.viewEngine === "edge"){
            setupEdgeJsBundle(staticPath)
            this.app.use(edgeEngine);
        }
        else{   
            setupTwigJsBundle(staticPath)
            this.app.use(twigEngine)
        }
        
        this.app.set('views', this.options?.views ?? path.join(__dirname, 'views'));

    }

    public async configOpenApiMiddleware() {
        this.app.use(this.openapiOptions ? this.openapiOptions.url ?? '/swagger.json' : '/swagger.json', swaggerUi.serve, swaggerUi.setup(this.spec))
    }

    public async serve(port: number = 3000, callback?: (port: number) => void) {
        await super.serve()
        // register socket controllers here ;
        if (this.server) {
            this.server.listen(port, () => {
                console.log('Server with socket ')
                if (callback) {
                    callback(port)
                }
            })
        }
        else {
            this.app.listen(port, () => {
                if (callback) {
                    callback(port)
                }
            })
        }
    }

}