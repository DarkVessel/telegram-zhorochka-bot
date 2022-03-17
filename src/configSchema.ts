import { Telegram } from 'telegraf'
import ConfigSchema from './interfaces/ConfigSchema'

const schema: ConfigSchema = {
  logChannel: {
    type: 'number',
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
  sendLogsToAGroup: {
    type: 'boolean',
    default: false,
    description: 'Отправлять логи в группу.',
    mutable: true,
    show: true
  },
  bot_owner: {
    type: 'number',
    default: undefined,
    description: 'ID аккаунта создателя бота.',
    mutable: false,
    show: true
  },
  chat_id: {
    type: 'number',
    default: undefined,
    description: 'ID основного чата, где будут работать команды модерации.',
    mutable: true,
    show: true
  }
}

export default schema
