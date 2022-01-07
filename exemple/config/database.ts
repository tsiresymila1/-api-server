import { DatabaseConfig, ENV } from "../../esm2015";

export const databaseConfig : DatabaseConfig = {
    database: ENV.Get('DATABASE'),
    host: ENV.Get('HOST'),
    port: ENV.Get('PORT') || 3306,
    dialect:  ENV.Get('DRIVER'),
    username: ENV.Get('USER'),
    password: ENV.Get('PASSWORD'),
    logging: console.log
}