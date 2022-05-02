import "reflect-metadata";
import { App, AppFactory, ExpressApplication, FastifyApplication, OpenAPiParams, twig } from "../lib";
import { serverOption } from './config/app';
import { databaseConfig } from "./config/database";



// Express intance
async function bootstrap() {
    const app: App = await AppFactory.create(ExpressApplication, serverOption);
    app.configOpenAPi({
        url: '/api/docs',
        options: {
            version: '3.0.0',
            title: 'Test API'
        }
    } as OpenAPiParams)
    // app.configDatabaseOption({
    //     force: true,
    //     alter: true
    // })
    // app.initDatabase(databaseConfig);
    twig.addGlobal('text', 'hello')
    await app.serve(9000, (port) => {
        console.log(`Instance of express server running on port ${port}`)
    });
}
// boot app
bootstrap()

// Fasify instance
// async function bootstrap() {
//     const app: App = await AppFactory.create<FastifyApplication>(FastifyApplication, serverOption);
//     app.configOpenAPi({
//         url: '/api/docs',
//         options: {
//             version: '1.0.0',
//             title: 'Test API'
//         }
//     } as OpenAPiParams)
//     // app.configDatabaseOption({
//     //     force: true,
//     //     alter: true
//     // })
//     // app.initDatabase(databaseConfig);
//
//     await app.serve(4000, 'localhost', 50, (_e, host) => {
//         console.log(`Instance of fastify server running on  ${host}`)
//     });
// }
// // boot app
// bootstrap()








