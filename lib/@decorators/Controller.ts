import { NextFunction,Request,Response } from "express";
import { ExpressMiddleWare } from "../@types";

type ControllerOptions = {
    prefix?: string
}

type SocketControllerOptions = {
    namespace?: string,
    room?: string
}
export const Controller = (options?: string | ControllerOptions, responseType?: string ) => {
    return (target: Function) => {
        let url: string = '/';
        if(typeof options === 'string'){
            url = options
        }
        else if (options && options.prefix) {
            url = options.prefix 
        }
        Object.defineProperty(target, 'easy-ts-api-controller', {
            value: true
        })

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

export const SocketController = (options?: string | SocketControllerOptions) => {
    return (target: Function) => {
        let namespace: string = '/';
        let room: string | undefined;
        if (typeof options === 'string') {
            namespace = options
        }
        else if (options && options.namespace) {
            namespace = options.namespace
        }
        if (options && typeof options !== 'string' && options.room) {
            room = options.room
        }
        Object.defineProperty(target, 'namespace', {
            value: namespace
        })
        Object.defineProperty(target, 'room', {
            value: room
        })
    }
}



export class DefaultMiddleWare implements ExpressMiddleWare {
    public use(req: Request, res: Response, next: NextFunction){
        console.log('Default middleware')
        next();
    }
}

