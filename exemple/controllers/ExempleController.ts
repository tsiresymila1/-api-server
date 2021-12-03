
import { AppResponse } from "../../esm2015";
import { All, Body, Get, Middleware, OpenApi, Post } from "../../esm2015"
import { AppRequest, CookieType } from "../../esm2015"
import { Params, Req, Res, Query, Headers, Ip, Session, Cookies } from "../../esm2015";
import { Controller } from "../../esm2015";
import InjectMiddleWare from "../middlewares/InjectMiddleware";
import User from './../models/UserModel';


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
        return {
            name: 'login', 
            params: id,
            authorization: authorization
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
    public async register(@Req() req: AppRequest, @Res() res: AppResponse, @Query() query: any, @Headers() headers: any, @Ip() ip: string, @Session() session: any, @Cookies() cookies: CookieType, @Body() body: User) {
        cookies.set('name', 'tsiresy')
        cookies.set('key', 'tsiresy')
        console.log(body)
        return {
            name: 'register',
            query: query,
            headers: headers,
            ip: ip,
            session: session,
            cookies: cookies
        }
    }
}