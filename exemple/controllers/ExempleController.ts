
import { SocketIO, Use } from "../../esm2015";
import { Get, OpenApi, Post } from "../../esm2015"
import { Params, Headers, } from "../../esm2015";
import { Controller } from "../../esm2015";
import InjectClassMiddleWare from "../middlewares/InjectClassMiddleware";
import InjectMiddleWare from "../middlewares/InjectMiddleware";

import { Hash } from './../../esm2015/providers/hash';


@Use(InjectClassMiddleWare)
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
    @Use(InjectMiddleWare)
    @Post('/register')
    public async register(@SocketIO() socket: any) {
        console.log(socket)
        return {
            name: 'register',
        }
    }
}