import { ParamsKey } from "..";

export const OnEvent = (event?: string) => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        let value: Function = descriptor.value
        if (target['events']) {
            target['events'][propertyKey] = event;
        }
        else {
            target['events'] = {
                [propertyKey]: event
            }
        }
        descriptor.value = async function (...args: any | null) {
            return await value.apply(this, args)
        }
        return target;
    }

}

export const OnConnect = () => {
    return OnEvent('connection');
}

export const OnDisconnect = () => {
    return OnEvent('disconnect');
}


const Emit = (key: string) => {
    return (event?: string) => {
        return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
            if (target[key]) {
                target[key][propertyKey] = event;
            }
            else {
                target[key] = {
                    [propertyKey]: event
                }
            }
            return target;
        }

    }
}

export const EmitOnSuccess = Emit('success')
export const EmitOnFail = Emit('error')



const paramsFactory = (ptype: string) => {
    return (key?: string) => {
        return (target: any, propertyKey: string, parameterIndex: number) => {
            var t = Reflect.getMetadata("design:type", target, propertyKey.toString());
            let data = {
                param: ptype,
                value: key,
                type: t
            } as ParamsKey;
            if (target['params']) {
                if (!target['params'][propertyKey]) {
                    target['params'][propertyKey] = []
                }
                target['params'][propertyKey][parameterIndex] = data
            }
            else {
                target['params'] = {
                    [propertyKey]: []
                }
                target['params'][propertyKey][parameterIndex] = data
            }
            return target
        }
    }

}

export const MessageBody = paramsFactory('data')
export const ConnectedSocket = paramsFactory('socket')
export const Clients = paramsFactory('clients')
export const SocketId = paramsFactory('id')
export const SocketQueryParam = paramsFactory('query')
export const SocketHeaders = paramsFactory('headers')
export const SocketAuth = paramsFactory('auth')


// Middleware

export const UseOnSocket = (middleware: Function) => {
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

