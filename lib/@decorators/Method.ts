
import { RouteParams } from "./../@types/index";
import * as swagger from "swagger-schema-official";
const methodFactory = (method: string)=>{
    return (url: string)=>{
        return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
            let value: Function = descriptor.value
            if(target['routes']){
                target['routes'][propertyKey] =  {
                    method: method,
                    url : url,
                    render: null
                };
            }
            else{
                target['routes'] = {
                    [propertyKey]: {
                        method: method, 
                        url : url,
                        render: null
                    }
                }
            }
            descriptor.value = async function (...args: any) {
                 return  await value.apply(this,args)
            }
            return target;
        }
    }
}

export const Use = (middleware: Function) => {
    return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
        if (!target['middlewares']) {
            target['middlewares'] = {}
        }
        if (!target['classmiddlewares']) {
            target['classmiddlewares'] = []
        }
        if (propertyKey) {
            if (!target['middlewares'][propertyKey]) {
                target['middlewares'][propertyKey] = []
            }
            target['middlewares'][propertyKey].push(middleware)
        }
        else {
            target['classmiddlewares'].push(middleware)
        }
        return target;
    }
    
}

export const OpenApi = (options: swagger.Operation) => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        if(!target['paths']){
            target['paths'] = {} 
        }
        let route : RouteParams  = target['routes'][propertyKey]
        let operationId: string = String().concat(target.constructor.name,'.',propertyKey)
        options.operationId = operationId
        options.tags = [String(target.constructor.name).replace('Controller','')]
        target['paths'][propertyKey] = options
        return target;
    } 
    
}
export const Render = (file:string) => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        if(target['routes']){
            target['routes'][propertyKey]['render'] = file;
        }
        return target;
    } 
    
}

export const RenderFile = (storage?:string,download?:boolean) => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        if(target['routes']){
            target['routes'][propertyKey]['renderfile'] =  {
                storage,
                download
            };
        }
        return target;
    } 
    
}

export const Get = methodFactory('get')
export const Post = methodFactory('post')
export const Put = methodFactory('put')
export const All = methodFactory('all')