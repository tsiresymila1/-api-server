import { FastifyInstance, FastifyRequest } from "fastify";
import { AppMiddleWare } from "./../@types/index";
import cookie from 'cookie';
import { Express, Request } from 'express'
import { AppRequest, AppResponse, RouteParams, ParamsKey, CookieType } from "../@types";
import DefaultMiddleWare from './Controller';
import { CookieSerializeOptions } from 'cookie';
import { pathToRegexp, compile } from "path-to-regexp";
import swagger from 'swagger-schema-official';
import { App } from './../server/server';
import { Model } from 'sequelize-typescript';
import { use } from "./shema";

const bindParams = (params: null | ParamsKey[], req: AppRequest, res: AppResponse, isFastify: boolean, cookieparams?: CookieSerializeOptions, types?: Array<any>): any[] => {
    let methodParams = []
    params?.forEach((value: ParamsKey, index) => {
        let param: any;
        switch (value.param) {
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
                let data: CookieType = isFastify ? (req as FastifyRequest).raw[value.param] : (req as Request)[value.param];
                data.set = (key: string, value: string) => {
                    res['cookie'](cookie.serialize(key, String(value), cookieparams ?? {
                        httpOnly: true,
                        maxAge: 60 * 60 * 24 * 7
                    }))
                }
                param = data;
                break;
            default:
                param = isFastify ? (req as FastifyRequest).raw[value.param] : (req as Request)[value.param];
        }
        // sey value assigne object
        let currentValue = value.value ? param[value.value] : param
        Object.assign(currentValue, types[index])
        methodParams.push(currentValue)
    });
    return methodParams;
}

const getInstance = (classRef: any): Object => {
    let Instance = class extends classRef {
        constructor(...params: any[]) {
            super(...params);
        }
    };
    return new Instance();
}

export const registerController = async (app: FastifyInstance | Express, object: Function, isFastify: boolean, cookieparams?: CookieSerializeOptions, spec?: swagger.Spec): Promise<swagger.Spec> => {
    let baseUrl: string = Object.getOwnPropertyDescriptors(object)['baseUrl'].value
    let renderType: string = Object.getOwnPropertyDescriptors(object)['render'].value
    let properties: string[] = Object.getOwnPropertyNames(object.prototype)
    for (let a of properties) {
        let method: Function = object.prototype[a];
        if (typeof method === 'function' && a !== 'constructor') {

            let route: RouteParams = object.prototype['routes'][a]
            let params: ParamsKey[] = object.prototype['params'] ? object.prototype['params'][a] ?? [] : []
            var types = Reflect.getMetadata("design:paramtypes", object.prototype, a);
            params = params.reduce<ParamsKey[]>((prev, next, index) => {
                next.type = types[index];
                prev.push(next)
                return prev;
            }, [])
            let middlewares: Function[] = object.prototype['middlewares'] ? object.prototype['middlewares'][a] ?? [DefaultMiddleWare] : [DefaultMiddleWare]
            let uses: Function[] = middlewares.reduce((p, n) => {
                p.push(n.prototype.use)
                return p
            }, [])
            let applymiddleware: Function[] | { preHandler: Function[] } = isFastify ? { preHandler: uses } : uses
            route.url = String().concat(baseUrl, route.url)
            // swagger processing
            let path = object.prototype['paths'] ? object.prototype['paths'][a] ?? null : null as swagger.Operation
            if (path) {
                const keys = [];
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
                    swaggerRoute = toPath({ [key['name']]: `{${key['name']}}` })
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
                    let requestBody = {}
                    for (let b of body) {
                        let t = Reflect.getMetadata('class:schema', b.type)
                        if (t) {
                            let jsonschema = use(b.type as unknown as Function)
                            console.log(jsonschema)
                            requestBody =
                            {
                                name: 'body',
                                in: 'body',
                                required: true,
                                description: 'Post data',
                                schema: {
                                    ...t,
                                    $ref: ""
                                }
                            }
                            break;
                        }
                    }
                    if (route.method === 'all') {
                        spec.paths[swaggerRoute]['get'] = path
                        spec.paths[swaggerRoute]['put'] = path
                        spec.paths[swaggerRoute]['delete'] = path
                        path["consumes"] = ["application/json"];
                        path.parameters.push(requestBody)
                        spec.paths[swaggerRoute]['post'] = path
                    }
                    else if (route.method === 'post') {
                        path["consumes"] = ["application/json"];
                        path.parameters.push(requestBody)
                        spec.paths[swaggerRoute][route.method] = path
                    }
                    else {
                        spec.paths[swaggerRoute][route.method] = path
                    }
                }
            }
            //End open api
            // routing configuration
            app[route.method](route.url, applymiddleware, function (req: AppRequest, res: AppResponse) {
                let methodParams = bindParams(params, req, res, isFastify, cookieparams, types);
                method(...methodParams).then((data) => {
                    if (renderType) {
                        res.header('Content-type', renderType);
                    }
                    res.send(data)
                }).catch((err) => {
                    res.send({ error: err }).status(500)
                });

            })
        }
    }
    return spec;
}


export const registerMiddleware = async (app: App, object: AppMiddleWare, route = "/") => {
    app.app['use'](route, object.use)

}

