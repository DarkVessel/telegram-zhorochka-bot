import { DataTypes } from 'sequelize'
import { Telegram } from 'telegraf'
import ConfigSchema from './interfaces/ConfigSchema'

const schema: ConfigSchema = {
  logChat: {
    type: 'number',
    typeDB: DataTypes.BIGINT,
    default: undefined,
    description: 'ID группы, куда будут скидываться логи и ошибки.',
    mutable: true,
    show: true,
    check: (data: string|number, telegram: Telegram) => new Promise(resolve => {
      telegram.getChat(data)
        .then(() => resolve())
        .catch(() => resolve('Не найден чат.'))
    })
  },
  adminChat: {
    type: 'number',
    typeDB: DataTypes.BIGINT,
    default: undefined,
    description: 'ID группы, где сидят Администраторы вашего проекта. Туда будет скидываться важная информация.',
    mutable: true,
    show: true,
    check: (data: string|number, telegram: Telegram) => new Promise(resolve => {
      telegram.getChat(data)
        .then(() => resolve())
        .catch(() => resolve('Не найден чат.'))
    })
  },
  sendLogsToAGroup: {
    type: 'boolean',
    typeDB: DataTypes.BOOLEAN,
    default: false,
    description: 'Отправлять логи в группу?',
    mutable: true,
    show: true
  },
  bot_owner: {
    type: 'number',
    typeDB: DataTypes.BIGINT,
    default: undefined,
    description: 'ID аккаунта создателя бота.',
    mutable: false,
    show: true
  },
  urlToRules: {
    type: 'string',
    typeDB: DataTypes.STRING,
    default: undefined,
    description: 'URL-ссылка на правила вашего чата.',
    mutable: true,
    show: true
  }
}

export default schema
