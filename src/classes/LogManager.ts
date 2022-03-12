import { Message } from 'telegraf/typings/core/types/typegram'
import { timezone } from 'strftime'

import TelegramClient from './TelegramClient'
import ConfigManager from './ConfigManager'
const strftime = timezone(180) // 180 - это московская таймзона.

const colors = {
  error: '1',
  warn: '3'
}

// Какой тип возвращают все функции из класса LogManager'a?
type returnMethods = void | Promise<Message.TextMessage>;

// Это просто разделитель текстовый.
const strip: string = '-'.repeat(50)

/**
 * Данный класс ответственный за вывод логов.
 * Например он их украшает, а ошибки выводит в Телеграм группу.
 */
class LogManager {
  // Последний путь, о котором сообщалось в логах.
  static lastPath: string = ''

  // Последний тип лога который использовался, например warn
  static lastTypeLog: string = ''

  // Телеграм клиент.
  static telegramClient: TelegramClient

  /**
   * @param path - Путь, который будет показываться при выводе лога.
   */
  constructor (public path: string) {
    this.path = path
  }

  /**
   * Отправляет сообщение в консоль и чат в Телеграме (если typeConsole == 'error' или 'warn')
   * @param typeConsole { 'log' | 'error' | 'warn' } - Влияет на то, какая функция вызовется. console.error, console.warn или console.log
   * @param typeLog Тип [ЛОГА]
   * @param title - Сообщение.
   * @param blocks - Дополнительные блоки сообщений.
   * @returns { returnMethods }
   */
  private _send (typeConsole: 'log' | 'error' | 'warn', typeLog: string, title: string, blocks?: Array<string>): returnMethods {
    if (process.env.MOCHA_WORKING) return

    // Получаем время в формате "Hours:Min:Sec"
    const time = strftime('%H:%M:%S', new Date())

    // Выводим путь, если он ещё не вывелся.
    // Для этого и нужна переменная LogManager.lastPath, она записывает последний путь который вывелся в консоль.
    // На основе этого проверяется, стоит ли ещё раз выводить с какого файла идёт лог.
    if (this.path !== LogManager.lastPath || typeConsole !== LogManager.lastTypeLog) {
      LogManager.lastPath = this.path
      LogManager.lastTypeLog = typeConsole
      console.log(`\n\x1B[38;5;5m\x1B[1m${this.path}\x1B[22m\x1B[39m`)
    }

    // [TYPE: time] >> Text
    // Пример: [COMMANDS: 20:02:47] >> Команды загрузились!
    console[typeConsole](`\x1B[38;5;${colors[typeConsole] ?? 14}m\x1B[1m[${typeLog.toUpperCase()}: ${time}]\x1B[22m\x1B[39m >> ${title}`)

    // Если есть блоки дополнительные - выводим их.
    if (blocks?.length) {
      console.log(strip)
      for (const block of blocks) {
        console[typeConsole](`${block}\n${strip}`)
      }
    }

    // Если Телеграм клиент не подключён - ничего не делаем дальше.
    if (!LogManager.telegramClient) return

    // Нужно ли отправлять лог в группу Телеграма?
    // НЕ отправится лог в 3 случаях:
    // 1. Если лог является обычным, а не предупреждением или ошибкой.
    // 2. Если параметр sendLogsToAGroup в конфиге стоит в значении false
    // 3. Если не установлен параметр logChannel в конфиге.
    if (!['error', 'warn'].includes(typeConsole) ||
      !ConfigManager.data.sendLogsToAGroup ||
      !ConfigManager.data.logChannel) return

    // Форматируем дополнительные блоки для сообщений.
    let formatBlocks: string = ''
    if (blocks?.length) {
      title += '\n' // Добавляем отступ.

      formatBlocks = blocks.map(b => `\`\`\`\n${b}\n\`\`\``).join('\n')
    }

    // Отправка сообщения в чат.
    const sendMessage = LogManager.telegramClient.telegram
      .sendMessage(ConfigManager.data.logChannel,
        `>> *${this.path}*\n[[ ${typeLog.toUpperCase()} ]] >> ${title}\n${formatBlocks ?? ''}`,
        { parse_mode: 'Markdown' })

    sendMessage.catch((err) => {
      console.error('[ERROR] Произошла ошибка при попытке отправить сообщение.\n' + err.stack)
    })

    return sendMessage
  }

  public log (type: string, title: string, blocks?: Array<string>): returnMethods {
    return this._send('log', type, title, blocks)
  }

  public error (type: string, title: string, error?: string, blocks?: Array<string>): returnMethods {
    if (!blocks) blocks = []
    if (error) blocks.push(error)

    return this._send('error', type, title, blocks)
  }

  public warn (type: string, title: string, warn?: string, blocks?: Array<string>): returnMethods {
    if (!blocks) blocks = []
    if (warn) blocks.push(warn)

    return this._send('warn', type, title, blocks)
  }
}

export default LogManager
