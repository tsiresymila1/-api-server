import { ParamsKey } from "..";

export const OnMessage = (event?: string) => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        let value: Function = descriptor.value
        if (target['events']) {
            target['events'][propertyKey] = {
                event: event
            };
        }
        else {
            target['events'] = {
                [propertyKey]: {
                    event: event
                }
            }
        }
        descriptor.value = async function (...args: any | null) {
            return await value.apply(this, args)
        }
        return target;
    }

}

export const OnConnection = () => {
    return OnMessage('connection');
}

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
export const ConnectedId = paramsFactory('id')
export const ConnectedIds = paramsFactory('ids')

