import { FastifyInstance, FastifyRequest } from "fastify";
import { AppMiddleware } from "../@types/index";
import cookie from 'cookie';
import { Express, Request } from 'express'
import { AppRequest, AppResponse, RouteParams, ParamsKey, CookieType } from "../@types";
import { CookieSerializeOptions } from 'cookie';
import { pathToRegexp, compile, Key } from "path-to-regexp";
import swagger from 'swagger-schema-official';
import { App } from '../server/server';

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
            default:
                param = isFastify ? (req as any).raw[value.param] : (req as any)[value.param];
        }
        // sey value assigne object
        let currentValue = value.value ? param[value.value] : param
        if (currentValue && value.type) Object.assign(currentValue, value.type)
        methodParams.push(currentValue)
    });
    return methodParams;
}

export const registerController = async (app: FastifyInstance | Express, object: Function, isFastify: boolean, spec: swagger.Spec, cookieparams?: CookieSerializeOptions,): Promise<swagger.Spec> => {
    if (!Object.getOwnPropertyDescriptors(object)['easy-ts-api:controller']) return spec;
    let baseUrl: string = Object.getOwnPropertyDescriptors(object)['baseUrl'].value
    let renderType: string = Object.getOwnPropertyDescriptors(object)['render'].value
    let properties: string[] = Object.getOwnPropertyNames(object.prototype)
    let classmiddlewares: Function[] = (object as any)['classmiddlewares'] ?? []
    let objectMiddlewares: any = object.prototype['middlewares'];
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
                    let requestBody: Object = {}
                    for (let b of body) {
                        let t = Reflect.getMetadata('class:schema', b.type)
                        if (t) {
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
                        if (Object.keys(requestBody).length > 0) {
                            path.parameters.push(requestBody)
                        }
                        spec.paths[swaggerRoute]['post'] = path
                    }
                    else if (route.method === 'post') {
                        path["consumes"] = ["application/json"];
                        if (Object.keys(requestBody).length > 0) {
                            path.parameters.push(requestBody)
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
                method(...methodParams).then((data: any) => {
                    if (renderType) {
                        res.header('Content-type', renderType);
                    }
                    res.send(data)
                }).catch((err: any) => {
                    res.send({ error: err }).status(500)
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

