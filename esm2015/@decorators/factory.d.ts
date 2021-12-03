import { FastifyInstance } from "fastify";
import { AppMiddleWare } from "./../@types/index";
import cookie from 'cookie';
import { Express } from 'express';
import swagger from 'swagger-schema-official';
import { App } from './../server/server';
export declare const registerController: (app: FastifyInstance | Express, object: Function, isFastify: boolean, cookieparams?: cookie.CookieSerializeOptions | undefined, spec?: swagger.Spec | undefined) => Promise<swagger.Spec>;
export declare const registerMiddleware: (app: App, object: AppMiddleWare, route?: string) => Promise<void>;
