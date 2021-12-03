# API SERVER 

API SERVER is an ts module that have for goal to create MVC pattern with express or fastify and auto configure swagger interface to manipulate the api 

*Installing* 

    npm install --save easy-ts-api 
    
After that you create config file inside config/app.ts

```ts
    import { ServerOption } from "easy-ts-api";
    import path from "path";
    export const serverOption: ServerOption = {
        controllers: [path.join(__dirname, '..', '/controllers/**/*Controller.ts')],
        middlewares: [path.join(__dirname, '..', '/middlewares/**/*Middleware.ts')],
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
    const app: App = await AppFactory.create<ExpressApplication>(ExpressApplication, serverOption); /// .create<FastifyApplication>(AppServer)
    await app.serve(3000, (port) => {
        console.log(`Instance of express server running on port ${port}`)
    });
}
// boot app
bootstrap()
 
```

## Controller 
There is an exemple of controller with opeapi 
```ts
import { All, Get, Middleware, OpenApi } from "easy-ts-api"
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
    @Middleware(InjectMiddleWare) // can inject middleware for only some method
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
import { AppMiddleWare } from 'easy-ts-api';

export default class ExempleMiddleWare implements AppMiddleWare {

    public use(req: Request, res: Response, next: NextFunction){
        console.log('Called middleware')
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
### Tsiresy Milà
#### tsiresymila@gmail.com
