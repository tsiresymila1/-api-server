import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { AppMiddleware } from "../@types/index";
import cookie from 'cookie';
import { Express, Request, Response } from 'express'
import { AppRequest, AppResponse, RouteParams, ParamsKey, CookieType } from "../@types";
import { CookieSerializeOptions } from 'cookie';
import { pathToRegexp, compile, Key } from "path-to-regexp";
import swagger from 'swagger-schema-official';
import { App } from '../server/server';
import { plainToInstance } from 'class-transformer';
import mime from 'mime';
import {join as pathFileJoin} from "path";
import fs from 'fs';
const bindParams = (params: null | ParamsKey[], req: AppRequest, res: AppResponse, isFastify: boolean, cookieparams?: CookieSerializeOptions, app?: FastifyInstance | Express): any[] => {
    let methodParams: any[] = []
    params?.forEach((value: ParamsKey) => {
        let param: any;
        switch (value.param) {
            case 'io':
                param = isFastify ? (app as any).io : (app as Express).get('io');
                break
            case 'req':
                param = isFastify ? (req as FastifyRequest).raw : (req as Request);
                break;
            case 'res':
                param = res;
                break;
            case 'params':
                param = req[value.param];
                break;
            case 'cookies':
                let data: CookieType = isFastify ? (req as any).raw[value.param] : (req as Request)[value.param];
                data.set = (key: string, value: string) => {
                    (res as any)['cookie'](cookie.serialize(key, String(value), cookieparams ?? {
                        httpOnly: true,
                        maxAge: 60 * 60 * 24 * 7
                    }))
                }
                param = data;
                break;
            case 'files':
                const r: any = isFastify ? (req as FastifyRequest).raw : (req as Request)
                param = r[value.param] as Array<{ fieldname: string }>;
                param = param.reduce((p: any, n: { fieldname: string }) => {
                    p[n.fieldname] = n;
                    return p
                }, {})
                break
            case 'renderer':
                param = (req as Request).app.get('renderer');
                break;
            default:
                const request: any = isFastify ? (req as FastifyRequest).raw : (req as Request)
                param = request[value.param];
        }
        // sey value assigne object
        let currentValue = value.value ? param[value.value] : param
        if (currentValue && value.type && value.type != Object) {
            try {
                currentValue = plainToInstance(value.type, currentValue, { enableCircularCheck: true })
            }
            catch (e: any) {
                console.log(e)
            }

        }
        methodParams.push(currentValue)
    });
    return methodParams;
}

export const registerController = async (app: FastifyInstance | Express, object: new () => any, isFastify: boolean, spec: swagger.Spec, cookieparams?: CookieSerializeOptions,): Promise<swagger.Spec> => {
    
    
    let properties: string[] = Object.getOwnPropertyNames(object.prototype)
    let baseUrl: string = Object.getOwnPropertyDescriptors(object)['baseUrl'].value
    let renderType: string = Object.getOwnPropertyDescriptors(object)['render'].value
    let classmiddlewares: Function[] = (object as any)['classmiddlewares'] ?? []
    let objectMiddlewares: any = (object as any)['middlewares'];
    for (let a of properties) {
        let instance = new (object as any)()
        let method: Function = instance[a];
        if (typeof method === 'function' && a !== 'constructor') { 

            let route: RouteParams = instance['routes'][a]
            let params: ParamsKey[] = instance['params'] ? instance['params'][a] ?? [] : []
            var types = Reflect.getMetadata("design:paramtypes", instance, a);
            params = params.reduce<ParamsKey[]>((prev, next, index) => {
                next.type = types[index];
                prev.push(next)
                return prev;
            }, [])
            let middlewares: Function[] = objectMiddlewares ? objectMiddlewares[a] ?? [classmiddlewares] : [classmiddlewares]
            middlewares = Array().concat(classmiddlewares, middlewares)
            let uses: Function[] = middlewares.reduce<Function[]>((p, n) => {
                if (n && n.prototype) {
                    p.push(n.prototype.use)
                }
                return p
            }, [])
            let applymiddleware: Function[] | { preHandler: Function[] } = isFastify ? { preHandler: uses } : uses
            route.url = String().concat(baseUrl, route.url)
            // swagger processing
            let path = object.prototype['paths'] ? object.prototype['paths'][a] ?? null : null as unknown as swagger.Operation
            if (path) {
                const keys: Key[] | undefined = [];
                await pathToRegexp(route.url, keys)  
                if ('parameters' in path === false) {
                    path.parameters = []
                }
                const toPath = compile(route.url);
                let swaggerRoute: string = route.url 
                for (let key of keys) { 
                    path.parameters.push({
                        name: key['name'],
                        in: 'path',
                        required: true
                    })
                }
                //compile route 
                const pathCompiled =  keys.reduce<Record<string, any>>((p,key)=>{
                    p[key['name']] = `{${key['name']}}`
                    return p;
                }, {})
                if(Object.keys(pathCompiled).length > 0 ){
                    swaggerRoute = toPath(pathCompiled).replace('//','/')
                }
                // openAPi
                if (spec) {
                    if (!spec.paths) {
                        spec.paths = {}
                    }
                    if (!spec.paths[swaggerRoute]) {
                        spec.paths[swaggerRoute] = {}
                    }
                    let body = params.filter((e) => e.param === 'body')
                    path.produces = [
                        "application/xml",
                        "application/json"
                    ]
                    let jsonBody: Array<any> = [] 
                    for (let b of body) {
                        let t = Reflect.getMetadata('class:schema', b.type)
                        if (t) {
                            jsonBody = Object.values(t.properties) 
                            break;
                        }
                    }
                    if (route.method === 'all') {
                        spec.paths[swaggerRoute]['get'] = path
                        spec.paths[swaggerRoute]['put'] = path
                        spec.paths[swaggerRoute]['delete'] = path
                        path["consumes"] = ["multipart/form-data"]
                        if (Object.keys(jsonBody).length > 0) {
                            path.parameters = path.parameters.concat(jsonBody)
                        }
                        spec.paths[swaggerRoute]['post'] = path
                    }
                    else if (route.method === 'post') {
                        path["consumes"] = ["multipart/form-data"]
                        if (Object.keys(jsonBody).length > 0) {
                            path.parameters = path.parameters.concat(jsonBody)
                        }
                        spec.paths[swaggerRoute][route.method] = path
                    }
                    else {
                        (spec.paths as any)[swaggerRoute][route.method] = path
                    }
                }
            }
            //End open api
            // routing configuration
            (app as any)[route.method](route.url, applymiddleware, function (req: AppRequest, res: AppResponse) {
                let methodParams = bindParams(params, req, res, isFastify, cookieparams, app);
                instance[a](...methodParams).then((data: any) => {
                    if (renderType) {
                        res.type(renderType);
                    }
                    if(route.renderfile){
                        const renderType = mime.getType(data)
                        if(route.renderfile.download){
                            res.header('Content-Disposition', 'attachment;filename=' + data);
                        }
                        if(renderType) res.type(renderType);
                        const filepath = pathFileJoin(process.cwd(),route.renderfile.storage ?? '',data)
                        if(!isFastify){
                            (res as Response).download(filepath)
                        }
                        else{
                            const stream = fs.readFileSync(filepath);
                            res = (res as FastifyReply).type(renderType ?? 'application/octet-stream').send(stream);
                        }
                    }
                    else if(route.render && !isFastify){
                        
                        (res as Response).render(route.render, data)
                    }
                    else{
                        res.send(data)
                    }
                    
                }).catch((err: { message: string, stack: string } | any) => {
                    console.log(err)
                    res.send({ error: err.message ?? err }).status(500)
                });

            })
        }
    }
    return spec;
}


export const registerMiddleware = async (app: App, object: AppMiddleware, route = "/") => {
    const propertiesDescriptors = Object.getOwnPropertyDescriptors(object.constructor)
    if (!propertiesDescriptors['easy-ts-api:middleware']) return;
    (app.app as any)['use'](route, object.use)

}

