import "reflect-metadata";
import { App, ExpressApplication, AppFactory } from "../lib";
import { serverOption } from './config/app';



// Express intance
async function bootstrap() {
    const app: App = await AppFactory.create(ExpressApplication, serverOption); /// .create<FastifyApplication>(AppServer)
    await app.serve(3000, (port) => {
        console.log(`Instance of express server running on port ${port}`)
    });
}
// boot app
bootstrap()

// Fasify instance
// async function bootstrap() {
//     const app: App = await AppFactory.create<FastifyApplication>(FastifyApplication, serverOption);
//     await app.serve(3000, 'localhost', 50, (_e, host) => {
//         console.log(`Instance of fastify server running on  ${host}`)
//     });
// }
// // boot app
// bootstrap()








