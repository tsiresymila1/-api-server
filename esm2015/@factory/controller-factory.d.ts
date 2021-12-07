import { FastifyInstance } from "fastify";
import { AppMiddleware } from "../@types/index";
import cookie from 'cookie';
import { Express } from 'express';
import swagger from 'swagger-schema-official';
import { App } from '../server/server';
export declare const registerController: (app: FastifyInstance | Express, object: Function, isFastify: boolean, spec: swagger.Spec, cookieparams?: cookie.CookieSerializeOptions | undefined) => Promise<swagger.Spec>;
export declare const registerMiddleware: (app: App, object: AppMiddleware, route?: string) => Promise<void>;
