
import { AppResponse, SocketIO } from "../../lib";
import { All, Body, Get, Middleware, OpenApi, Post } from "../../lib"
import { AppRequest, CookieType } from "../../lib"
import { Params, Req, Res, Query, Headers, Ip, Session, Cookies } from "../../lib";
import { Controller } from "../../lib";
import InjectMiddleWare from "../middlewares/InjectMiddleware";
import User from './../models/UserModel';
import { Hash } from './../../lib/providers/hash';
import { RegisterInput } from "../schema/register";


@Controller({ prefix: '/api' })
export default class ExempleController {

    @OpenApi({
        responses: {
            '200': {
                'description': 'Response',
            }
        },
        parameters: [
            {
                name: 'authorization',
                in: 'header'
            }
        ]
    })
    @Get('/login/:id')
    public async login(@Params('id') id: number, @Headers('authorization') authorization) {
        const a = Hash.generate(5)
        return {
            name: 'login', 
            params: id,
            authorization: authorization,
            token: a
        }
    }

    @OpenApi({
        responses: {
            '200': {
                '$ref': '',
                'description': 'Response',
            }
        }
    })
    @Middleware(InjectMiddleWare)
    @Post('/register')
    public async register(@SocketIO() socket: any) {
        console.log(socket)
        return {
            name: 'register',
        }
    }
}