import { Sequelize } from 'sequelize-typescript'
import { DatabaseConfig } from '..';
import { ENV } from './../utils/env';
const  defaultDatabaseConfig : DatabaseConfig = {
    database: ENV.Get('DATABASE'),
    host: ENV.Get('HOST'),
    port: ENV.Get('PORT') || 3306,
    dialect:  ENV.Get('DRIVER'),
    username: ENV.Get('USER'),
    password: ENV.Get('PASSWORD'),
    logging: console.log
}
export  default new Sequelize(defaultDatabaseConfig)