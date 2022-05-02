import { NextFunction,Request,Response } from 'express';
import { AppMiddleware, ExpressMiddleWare, Middleware } from '../../../lib';

@Middleware()
export default class ExempleAfterMiddleware implements AppMiddleware {

    public use(req: Request, res: Response, next: NextFunction){
        console.log('Called after middleware')
        next();
    }
}
