# EASY API SERVER 

EASY API SERVER is an ts module that have for goal to create MVC pattern with express or fastify and auto configure swagger interface to manipulate the api 

*Installing* 

    npm install --save easy-ts-api 
    
After that you create config file inside config/app.ts

```ts
    import { ServerOption } from "easy-ts-api";
    import path from "path";
    export const serverOption: ServerOption = {
        controllers: [path.join(__dirname, '..', '/controllers/**/*Controller')],
        middlewares: [path.join(__dirname, '..', '/middlewares/**/*Middleware')],
        models: [path.join(__dirname, '..', '/models/**/*Model.ts')]
    }

```

After that you can create server via express or fastify 

## Fastify server

```ts
import "reflect-metadata";
import { FastifyApplication, AppFactory, App } from 'easy-ts-api';
import {serverOption} from './config/app.ts'
// Fasify instance
async function bootstrap() {
    const app: App = await AppFactory.create<FastifyApplication>(FastifyApplication, serverOption);
    await app.serve(3000, 'localhost', 50, (_e, host) => {
        console.log(`Instance of fastify server running on  ${host}`)
    });
}
// boot app
bootstrap()
  
```

## Express server

```ts
import "reflect-metadata";
import { ExpressApplication, AppFactory, App } from 'easy-ts-api';
import {serverOption} from './config/app.ts'

// Express inntance
async function bootstrap() {
    const app: App = await AppFactory.create<ExpressApplication>(ExpressApplication, serverOption); 
    await app.serve(3000, (port) => {
        console.log(`Instance of express server running on port ${port}`)
    });
}
// boot app
bootstrap()
 
```

## Controller 
There is an exemple of controller with openapi 
```ts
import { All, Get,Use , OpenApi } from "easy-ts-api"
import { AppRequest, CookieType, AppResponse } from "easy-ts-api"
import { Params, Req, Res, Query, Headers, Ip, Session, Cookies } from "easy-ts-api";
import { Controller } from "easy-ts-api";



@Controller({ prefix: '/api' })
export default class ExempleController {

    @OpenApi({
        responses: {
            '200': {
                '$ref': '',
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
    public async login(@Params('id') id: number,@Headers('authorization') authorization) {
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
    @Use(InjectMiddleWare) // can inject middleware for only some method
    @All('/register')
    public async register(@Req() req: AppRequest, @Res() res: AppResponse, @Query() query: any, @Headers() headers: any, @Ip() ip: string, @Session() session: any, @Cookies() cookies: CookieType) {
        cookies.set('name', 'cookies test') // setting cookie 
        cookies.set('key', 'cookies test') // setting cookie 
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
```
## Middleware 

Middleware is based on express middleware but it can work perfectly with fastify 

```ts
import { NextFunction,Request,Response } from 'express';
import { AppMiddleWare,Middleware } from 'easy-ts-api';

@Middleware()
export default class ExempleMiddleWare implements AppMiddleWare {

    public use(req: Request, res: Response, next: NextFunction){
        console.log('Called middleware')
        next();
    }
}

```
If you want to create InjectMiddleware, you dont need to use decorator @Middleware() to create it.<br> 
Inject middleware can be injected by decorate class or decorate method.<br>
@Middleware() tell server that this middleware will be used globaly. 

```ts
import { NextFunction,Request,Response } from 'express';
import { AppMiddleWare,Middleware } from 'easy-ts-api';

export default class InjectMiddleWare implements AppMiddleware {

    public use(req: Request, res: Response, next: NextFunction){
        console.log('Called inject middleware')
        next();
    }
}

```
For database create  .env file and specify some parameters

```
NODE_ENV=development
DRIVER=mysql/postgres/sqlite/mongo
DATABASE=database
USER=root
PASSWORD=password
EXTENSION=.ts // .js for production
```
And model is base on sequilize-typescritpt 


```ts
import { AutoIncrement, Column, Model, PrimaryKey, Table } from "sequelize-typescript";
import { prop, Schema } from 'easy-ts-api';

@Table({
    timestamps: true,
})
@Schema()
export default class User extends Model {

    @AutoIncrement
    @PrimaryKey
    @Column
    @prop()
    id: number;

    @Column
    @prop()
    nickname: string;
}
```

You can transform Model or any class to body schema 

```ts
import { prop, Schema } from 'easy-ts-api';

@Schema()
export default class RegisterInput {

    @prop()
    email: string;

    @prop()
    password: string;
}

```
if you want to use socket io with , enable it in serveroption 

```ts
export const serverOption: ServerOption = {
    controllers: [path.join(__dirname, '..', '/controllers/**/*Controller')],
    middlewares: [path.join(__dirname, '..', '/middlewares/**/*Middleware')],
    models: [path.join(__dirname, '..', '/models/**/*Model.ts')],
    sockets: [path.join(__dirname, '..', '/sockets/**/*SocketController')], // socket controller
    cors: true,
    enableSocketIo: true
}
```

and Create socket controller 

```ts

import { ConnectedSocket, MessageBody, OnConnect, SocketController } from "easy-ts-api";
import { OnEvent,EmitOnSuccess,EmitOnFail,UseOnSocket } from 'easy-ts-api';
import TestMethodSocketMiddleware from './TestMethodSocketMiddleware'
import TestSocketMiddleware from "./TestSocketMiddleware";

@UseOnSocket(TestSocketMiddleware)
@SocketController()
export default class TestSocketController {

    @OnConnect()
    public async connection(@ConnectedSocket() socket) {
        console.log('user connected')
        console.log(socket.id)
    }

    @UseOnSocket(TestMethodSocketMiddleware)
    @EmitOnFail('error')
    @EmitOnSuccess('message')
    @OnEvent('message')
    public async message(@ConnectedSocket() socket, @MessageBody() data: any) {
        console.log('Message get from zvznr message : ', data, socket)
        return data;
    }
}
```
And socket middleware must be like 

```ts
import { AppSocketMiddleware, SocketMiddleware } from 'easy-ts-api';

@SocketMiddleware()
export default class TestMethodSocketMiddleware implements AppSocketMiddleware {
    use(socket: any, next: ((err?: any) => any)) {
        console.log("do something, for example get authorization token and check authorization");
        next();
    }

}

```
You must use decorator middleware with @SocketMiddleware() to know that it is a socket decorator and not any class. It will be ignore without this decorator.<br>
After all, you can able to SocketIO from controller method parameter

```ts

...
    @OpenApi({
        responses: {
            '200': {
                '$ref': '',
                'description': 'Response',
            }
        }
    })
    @Middleware(InjectMiddleWare) 
    @All('/register')
    public async register(@SocketIO() socket: Server) {
        console.log(socket)
        return {
            name: 'register',
        }
    }

...

```
### Tsiresy Milà
#### tsiresymila@gmail.com
