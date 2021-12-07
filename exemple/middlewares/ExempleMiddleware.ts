import { NextFunction,Request,Response } from 'express';
import { AppMiddleware, ExpressMiddleWare, Middleware } from '../../esm2015';

@Middleware()
export default class ExempleMiddleWare implements AppMiddleware {

    public use(req: Request, res: Response, next: NextFunction){
        console.log('Called middleware')
        next();
    }
}
