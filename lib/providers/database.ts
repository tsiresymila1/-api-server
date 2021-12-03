import { Sequelize } from 'sequelize-typescript'
import ENV from './../utils/env';
export default new Sequelize({
    database: ENV.Get('DATABASE'),
    host: ENV.Get('HOST'),
    port: ENV.Get('PORT') || 3306,
    dialect:  ENV.Get('DRIVER'),
    username: ENV.Get('USER'),
    password: ENV.Get('PASSWORD'),
    logging: console.log
})