import { ServerOption } from "../../esm2015";
import path from "path";
export const serverOption: ServerOption = {
    controllers: [path.join(__dirname, '..', '/controllers/**/*Controller.ts')],
    middlewares: [path.join(__dirname, '..', '/middlewares/**/*Middleware.ts')],
    models: [path.join(__dirname, '..', '/models/**/*Model.ts')]
}