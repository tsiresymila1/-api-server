import { ParamsKey } from "../@types";

const paramsDecorator = (ptype: string)=> {
    return (key?: string) => {
        return (target: any, propertyKey: string, parameterIndex: number) => {
            var t = Reflect.getMetadata("design:type", target, propertyKey.toString());
            let data = {
                param : ptype,
                value: key,
                type: t
            } as ParamsKey;
            if(target['params']){
                if(!target['params'][propertyKey]){
                    target['params'][propertyKey] = []
                }
                target['params'][propertyKey][parameterIndex] = data
            }
            else{
                target['params'] = {
                    [propertyKey]: []
                }
                target['params'][propertyKey][parameterIndex] = data
            }
            return target
        }
    }
    
}

export const Req = paramsDecorator('req')
export const Res = paramsDecorator('res')
export const Params = paramsDecorator('params')
export const Body = paramsDecorator('body')
export const Query = paramsDecorator('query')
export const Headers = paramsDecorator('headers')
export const Files = paramsDecorator('files')
export const Session = paramsDecorator('session')
export const Cookies = paramsDecorator('cookies')
export const Ip = paramsDecorator('ip')
export const Database = paramsDecorator('db')
export const SocketIO = paramsDecorator('io')
export const View = paramsDecorator('renderer')
