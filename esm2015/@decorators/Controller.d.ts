import { NextFunction, Request, Response } from "express";
import { ExpressMiddleWare } from "../@types";
declare type ControllerOptions = {
    prefix?: string;
};
declare type SocketControllerOptions = {
    namespace?: string;
    room?: string;
};
export declare const Controller: (options?: string | ControllerOptions | undefined, responseType?: string | undefined) => (target: Function) => void;
export declare const JsonController: (baseUrl?: string | ControllerOptions | undefined) => (target: Function) => void;
export declare const SocketController: (options?: string | SocketControllerOptions | undefined) => (target: Function) => void;
export declare const Middleware: () => (target: Function) => void;
export declare const SocketMiddleware: () => (target: Function) => void;
export declare class DefaultMiddleWare implements ExpressMiddleWare {
    use(req: Request, res: Response, next: NextFunction): void;
}
export {};
