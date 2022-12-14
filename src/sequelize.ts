import LogManager from './classes/LogManager'
import SequelizeDB from './classes/SequelizeDB'

require('dotenv').config()

const logmanager = new LogManager('./src/sequelize.ts')
const { MYSQL_DATABASE, MYSQL_USERNAME, MYSQL_PASSWORD, MYSQL_HOST, MYSQL_PORT } = process.env
const sequelize = new SequelizeDB(<string>MYSQL_DATABASE, <string>MYSQL_USERNAME, MYSQL_PASSWORD, {
  host: MYSQL_HOST,
  port: Number(MYSQL_PORT),
  dialect: 'mysql',
  logging: process.env.DISABLE_LOGGING_MYSQL ? false : console.log
})

sequelize.authenticate().then(async () => {
  logmanager.log('SEQUELIZE', 'Connect!')
  sequelize.start('build/src/models/')
}).catch((err) => {
  logmanager.error('SEQUELIZE', 'Ошибка подключения к MySQL!', err.stack, [
    `Подключение проводилось по таким данным:

> Host: ${MYSQL_HOST}
> Port: ${MYSQL_PORT}
> Username: ${MYSQL_USERNAME}
> Password: ${MYSQL_PASSWORD}
> DataBase: ${MYSQL_DATABASE}`
  ]).then(() => process.exit())
})

export default sequelize
