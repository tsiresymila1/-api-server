
import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { ParamsKey } from '..';

type AsyncFunction = (...args: any) => Promise<any>


const bindParams = (params: ParamsKey[], socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, data: any, io: Server) => {
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
                param = socket.id
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
    let method: AsyncFunction;
    const namespace = Object.getOwnPropertyDescriptor(object, 'namespace')?.value
    const room = Object.getOwnPropertyDescriptor(object, 'room')?.value ?? 'socket.io'
    if (properties.includes('connection')) {
        method = object.prototype['connection'];
    }
    io.of(namespace).on('connection', async (socket) => {
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
            await method(...bindedParams)
        }
        socket.use(([event, ...args], next) => {
            next();
        });
        for (let p of properties) {
            let callback: AsyncFunction = object.prototype[p];
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
                socket.on(`${event}`, async (data: any) => {
                    const bindedParams = bindParams(params, socket, data, io)
                    try {
                        const data = await callback(...bindedParams);
                        const successEvents = object.prototype['success']
                        if (successEvents && successEvents[p]) {
                            socket.emit(successEvents[p], data)
                        }
                    }
                    catch (e: any) {
                        let errorEvents = object.prototype['errors']
                        if (errorEvents && errorEvents[p]) {
                            socket.emit(errorEvents[p], e.toString())
                        }
                    }
                })
            }
        }
    })

}