import { ServerOption } from "../../lib";
import path from "path";
export const serverOption: ServerOption = {
    controllers: [path.join(__dirname, '..', '/controllers/**/*Controller')],
    middlewares: [path.join(__dirname, '..', '/middlewares/**/*Middleware')],
    models: [path.join(__dirname, '..', '/models/**/*Model')],
    sockets: [path.join(__dirname, '..', '/sockets/**/*SocketController')],
    cors: true,
    enableSocketIo: true
}