import ConfigManager from './ConfigManager'
import { timezone } from 'strftime'
import { Message } from 'telegraf/typings/core/types/typegram'
import TelegramClient from './TelegramClient'
const strftime = timezone(180)

const colors = {
  error: '1',
  warn: '3'
}

type returnMethods = boolean | Promise<Message.TextMessage>;
const strip: string = '-'.repeat(50)
class LogManager {
  // Последний путь, о котором сообщалось в логах.
  static lastPath: string = ''
  public path

  // Последний тип лога который использовался, например warn
  static lastTypeLog: string = ''

  static telegramClient: TelegramClient
  constructor (path: string) {
    this.path = path
  }

  /**
     * Отправляет сообщение в консоль и чат в Телеграме.
     * @param typeConsole { 'log' | 'error' | 'warn' } - Влияет на то, какая функция вызовется. console.error, console.warn или console.log
     * @param typeLog Тип [ЛОГА]
     * @param title - Сообщение
     * @param blocks - Дополнительные блоки.
     * @returns { returnMethods }
     */
  private _send (typeConsole: 'log' | 'error' | 'warn', typeLog: string, title: string, blocks?: Array<string>): returnMethods {
    const time = strftime('%H:%M:%S', new Date())

    if (this.path !== LogManager.lastPath || typeConsole !== LogManager.lastTypeLog) {
      LogManager.lastPath = this.path
      LogManager.lastTypeLog = typeConsole
      console.log(`\n\x1B[38;5;5m\x1B[1m${this.path}\x1B[22m\x1B[39m`)
    }

    // [type: time] >> Colors Text
    console[typeConsole](`\x1B[38;5;${colors[typeConsole] ?? 14}m\x1B[1m[${typeLog.toUpperCase()}: ${time}]\x1B[22m\x1B[39m >> ${title}`)
    if (blocks?.length) {
      for (const block of blocks) {
        console[typeConsole](`${strip}\n${block}\n${strip}`)
      }
    }

    if (!LogManager.telegramClient) return true

    // Нужно ли отправлять логи?
    if (typeConsole !== 'error' || !ConfigManager.data.sendLogsToAGroup || !ConfigManager.data.logChannel) return false

    // Отступ.
    let formatBlocks: string = ''
    if (blocks?.length) {
      title += '\n'

      formatBlocks = blocks.map(b => `\`\`\`\n${b}\n\`\`\``).join('\n')
    }

    // Отправка лога.
    const sendMessage = LogManager.telegramClient.telegram.sendMessage(ConfigManager.data.logChannel, `>> *${this.path}*\n[[ ${typeLog.toUpperCase()} ]] >> ${title}\n${formatBlocks ?? ''}`, { parse_mode: 'Markdown' })

    sendMessage.catch((err) => {
      console.error('[ERROR] Произошла ошибка при попытке отправить сообщение.\n' + err.stack)
    })

    return sendMessage
  }

  public log (type: string, title: string, blocks?: Array<string>): returnMethods {
    return this._send('log', type, `${title}`, blocks)
  }

  public error (type: string, title: string, error?: string, blocks?: Array<string>): returnMethods {
    if (!blocks) blocks = []
    if (error) blocks.push(error)

    return this._send('error', type, `${title}`, blocks)
  }

  public warn (type: string, title: string, warn?: string, blocks?: Array<string>): returnMethods {
    if (!blocks) blocks = []
    if (warn) blocks.push(warn)

    return this._send('warn', type, `${title}`, blocks)
  }
}

export default LogManager
