import Fastify, { FastifyInstance } from "fastify";
import { ServerOption } from "../@types";
import  { Express } from 'express';
import path from 'path';
import { App } from "./server";
import { setupEdgeJsBundle, edgeEngine } from "./edge-template";
import { setupTwigJsBundle, twigEngine } from "./twing-template";


export class FastifyApplication extends App {
    app: FastifyInstance
    appe: Express | undefined
    options: ServerOption | undefined

    constructor() {
        super();
        this.app = Fastify();
        this.isfastify = true
        // this.options = options
    }

    public async config() {
        if (this.options?.enableSocketIo) {
            await this.app.register(require('fastify-socket.io'))
        }
        const staticPath = this.options?.staticUrl ?? '/static';
        // await this.app.register(require('middie'))
        await this.app.register(require('fastify-express'))
        await this.app.register(require('fastify-cookie'))
        await this.app.register(require('fastify-static'), {
            root: this.options?.staticFolder ?? path.join(__dirname, 'public'),
            prefix: staticPath,
        })
        await this.app.register(require('fastify-multipart'))
        // if(this.options?.viewEngine && this.options?.viewEngine === "edge"){
        //     setupEdgeJsBundle(staticPath)
        //     this.app.use(edgeEngine);
        // }
        // else{   
        //     setupTwigJsBundle(staticPath)
        //     this.app.use(twigEngine)
        // }
        // this.app.set('views', this.options?.views ?? path.join(__dirname, 'views'));

        super.config();
    }

    public async configOpenApiMiddleware() {
        await this.app.register(require('fastify-swagger'), { mode: 'static', exposeRoute: true, specification: { document: this.spec }, routePrefix: this.openapiOptions ? this.openapiOptions.url ?? '/swagger.json' : '/swagger.json', })
        this.app.ready(err => {
            if (err) { console.log(err) }
            // register socket controllers here
            (this.app as any)['swagger']()
        })
    }

    public async serve(port: string | number, address: string, backlog: number, callback: (err: Error | null, address: string) => void) {
        await super.serve()
        this.app.listen(port, address, backlog, callback)
    }


}
