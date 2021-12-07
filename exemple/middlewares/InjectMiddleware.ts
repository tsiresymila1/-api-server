import { NextFunction,Request,Response } from 'express';
import { ExpressMiddleWare, Middleware } from '../../lib';

// @Middleware()
export default class InjectMiddleWare implements ExpressMiddleWare {

    public use(req: Request, res: Response, next: NextFunction){
        console.log('Inject Called middleware')
        next();
    }
}
