
import { AppSocketMiddleware, SocketMiddleware } from './../../lib';

@SocketMiddleware()
export default class TestSocketMiddleware implements AppSocketMiddleware {

    use(socket: any, next: ((err?: any) => any)) {
        console.log("do something, for example get authorization token and check authorization");
        next();
    }

}