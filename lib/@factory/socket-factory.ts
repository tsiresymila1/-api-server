
import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { ParamsKey } from '..';

const bindParams = (params: ParamsKey[], socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, data: any, io: Server, anotherSocketId?: any) => {
    let methodParams: any[] = []
    params?.forEach((value: ParamsKey, index) => {
        let param: any;
        switch (value.param) {
            case 'socket':
                param = socket
                break
            case 'data':
                param = data
                break;
            case 'ids':
                param = io.engine.clientsCount
                break;
            case 'clients':
                param = io.fetchSockets()
                break;
            case 'id':
                param = anotherSocketId
                break;
        }
        // sey value assigne object
        let currentValue = value.value ? param[value.value] : param
        if (value.type) Object.assign(currentValue, value.type)
        methodParams.push(currentValue)
    });
    return methodParams;
}
export const registerSocket = async (io: Server, object: Function) => {
    let properties: string[] = Object.getOwnPropertyNames(object.prototype)
    let method: Function;
    const namespace = Object.getOwnPropertyDescriptor(object, 'namespace')?.value
    const room = Object.getOwnPropertyDescriptor(object, 'room')?.value
    if (properties.includes('connection')) {
        method = object.prototype['connection'];
    }
    io.of(namespace).on('connection', (socket) => {
        socket.join(room);
        if (method) {
            let paramsConnection: ParamsKey[] = object.prototype['params'] ? object.prototype['params']['connection'] ?? [] : []
            var typesConnection = Reflect.getMetadata("design:paramtypes", object.prototype, 'connection');
            paramsConnection = paramsConnection.reduce<ParamsKey[]>((prev, next, index) => {
                next.type = typesConnection[index];
                prev.push(next)
                return prev;
            }, [])
            const bindedParams = bindParams(paramsConnection, socket, "user connected", io)
            method(...bindedParams)
        }
        socket.use(([event, ...args], next) => {
            next();
        });
        for (let p of properties) {
            let callback: Function = object.prototype[p];
            if (typeof method === 'function' && p !== 'constructor') {
                let event = object.prototype['events'][p]
                if (!event || p === "connection") continue;
                let params: ParamsKey[] = object.prototype['params'] ? object.prototype['params'][p] ?? [] : []
                var types = Reflect.getMetadata("design:paramtypes", object.prototype, p);
                params = params.reduce<ParamsKey[]>((prev, next, index) => {
                    next.type = types[index];
                    prev.push(next)
                    return prev;
                }, [])
                // register all socket 
                socket.on(`${event.event}`, (data: any) => {
                    const bindedParams = bindParams(params, socket, data, io)
                    callback(...bindedParams);
                })
            }
        }
    })

}