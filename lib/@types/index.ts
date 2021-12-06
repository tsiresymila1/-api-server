import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify"
import {Request,Response, NextFunction,} from 'express'
import multer from "multer"
import {OptionsJson,OptionsUrlencoded} from "body-parser"
import { CookieSerializeOptions } from "cookie"
import swagger from 'swagger-schema-official';
import { Model, ModelCtor } from "sequelize-typescript"
type ControllerOptions = {
    url?: string
}

export  interface ExpressMiddleWare {
    use : (req: Request, res: Response, next: NextFunction) => void;
}
export interface ExpressErrorMiddleWare {
    use: (error: Error, res: Response, next: NextFunction) => void;
}

export type AppRequest = Request | FastifyRequest
export type AppResponse = Response | FastifyReply

export interface  ServerOption {
    sessionSecretKey?: string[],
    cors?: boolean,
    controllers?: Function[] | String[],
    middlewares?: Function[] | String[],
    models?: (string | ModelCtor<Model<any, any>>)[],
    sockets?: Function[] | String[],
    uploadOption?: multer.Options,
    json? : OptionsJson
    urlencoded? : OptionsUrlencoded;
    cookieParams?: CookieSerializeOptions,
    staticFolder? :string,
    staticUrl?: string
    enableSocketIo?: boolean
 }



 export interface RouteParams {
     url: string,
     method: string
     
 }

 export interface CookieType{
     set: (key:string, value: string)=> any,
 }

 export type ParamsKey = {
    param : string,
    value :  string
     type?: any
 }

 export type OpenAPiParams = {
     options : swagger.Info
     url?: string
 }

export class AppMiddleWare {
    use: ((req: Request, res: Response, next: NextFunction) => void) | undefined;
}

