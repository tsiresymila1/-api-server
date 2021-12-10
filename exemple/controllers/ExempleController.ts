
import { Files, SocketIO, Use } from "../../lib";
import { Get, OpenApi, Post } from "../../lib"
import { Params, Headers, } from "../../lib";
import { Controller } from "../../lib";
import { Body, Validator } from "../../lib";
import InjectClassMiddleWare from "../middlewares/InjectClassMiddleware";
import InjectMiddleWare from "../middlewares/InjectMiddleware";

import { Hash } from '../../lib';
import { RegisterInput } from './../schema/register';


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
    public async register(@SocketIO() socket: any, @Body() body: RegisterInput, @Files('profile') profile) {
        const validators = Validator.check(body) // validate body 
        console.log(body.password, validators.data, profile.filename)
        return {
            name: 'register',
        }
    }
}