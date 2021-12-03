import { NextFunction,Request,Response } from "express";
import { ExpressMiddleWare } from "../@types";

type ControllerOptions = {
    prefix?: string
}
export const Controller = (options?: string | ControllerOptions, responseType?: string ) => {
    return (target: Function) => {
        let url: string = '/';
        if(typeof options === 'string'){
            url = options
        }
        else{
            url = options.prefix 
        }
        Object.defineProperty(target,'baseUrl', {
            value: url
        })
        Object.defineProperty(target,'render', {
            value: responseType
        })
    }
}
export const JsonController = (baseUrl?: string | ControllerOptions ) => {
    return Controller(baseUrl, 'application/json')
}

export default class DefaultMiddleWare implements ExpressMiddleWare {
    public use(req: Request, res: Response, next: NextFunction){
        console.log('Default middleware')
        next();
    }
}

