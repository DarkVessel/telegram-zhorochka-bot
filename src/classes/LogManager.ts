import { timezone } from 'strftime'

// Интерфейсы.
import { Message } from 'grammy/out/platform.node'
import ConfigKeys from '../interfaces/ConfigKeys'
import TelegramClient from './TelegramClient'

const strftime = timezone(180) // 180 - это московская таймзона.
const colors = {
  log: '14',
  error: '1',
  warn: '3'
}

// Какой тип возвращают все функции из класса LogManager.
type returnMethods = Promise<void | Message.TextMessage>

// Это просто текстовый разделитель.
const strip = '-'.repeat(50)

/**
 * Данный класс ответственный за вывод логов.
 * Например, он их окрашивает в различные цвета, а ошибки выводит в Телеграм чат.
 * @example Пример использования функции .log
 * ```js
 * const logManager = new LogManager('./src/classes/LogManager.ts')
 * logManager.log('DATABASE', 'Подключение выполнилось успешно!')
 * logManager.log('DATABASE', 'Подключение выполнилось успешно!', undefined, [`Дополнительная информация: ...`])
 * ```
 * @example Пример использования функции .warn/.error
 * ```js
 * logManager.warn('DATABASE', 'Слишком долгое подключение.')
 * logManager.warn('DATABASE', 'Произошла ошибка при отправке чего-то', 'Текст ошибки.')
 * logManager.warn('DATABASE', 'Произошла ошибка при отправке чего-то', 'Текст ошибки.', undefined, ['Дополнительная информация...'])
 * ```
 */
class LogManager {
  // Последний путь, о котором сообщалось в логах.
  static lastPath: string = ''

  // Последний тип лога который использовался, например warn
  static lastTypeLog: string = ''

  // Телеграм клиент.
  static telegramClient: TelegramClient

  static config: ConfigKeys = {}

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
   * @param color - Цвет, просто число.
   * @param blocks - Дополнительные блоки сообщений.
   * @returns { returnMethods }
   */
  private async _send (typeConsole: 'log' | 'error' | 'warn', typeLog: string, title: string, color?: number | undefined, blocks?: Array<string>): returnMethods {
    if (process.env.DISABLE_LOGGING) return

    // Получаем время в формате "Hours:Min:Sec"
    const time = strftime('%H:%M:%S', new Date())

    // Выводим путь, если он ещё не вывелся.
    // Для этого и нужна переменная LogManager.lastPath, она записывает последний путь который вывелся в консоль.
    // На основе этого проверяется, стоит ли ещё раз выводить с какого файла идёт лог.
    if (this.path !== LogManager.lastPath || typeConsole !== LogManager.lastTypeLog) {
      LogManager.lastPath = this.path
      LogManager.lastTypeLog = typeConsole
      if (process.env.NO_COLOR) {
        console.log('\n', this.path)
      } else console.log(`\n\x1B[38;5;5m\x1B[1m${this.path}\x1B[22m\x1B[39m`)
    }

    // [TYPE: time] >> Text
    // Пример: [COMMANDS: 20:02:47] >> Команды загрузились!
    if (process.env.NO_COLOR) {
      console[typeConsole](`[${typeLog.toUpperCase}: ${time}] >> ${title}`)
    } else {
      console[typeConsole](`\x1B[38;5;${color ?? colors[typeConsole]}m\x1B[1m[${typeLog.toUpperCase()}: ${time}]\x1B[22m\x1B[39m >> ${title}`)
    }

    // Если есть блоки дополнительные - выводим их.
    if (blocks?.length) {
      console.log(strip)
      for (const block of blocks) {
        console[typeConsole](block, '\n', strip)
      }
    }

    // Если Телеграм клиент не подключён - ничего не делаем дальше.
    if (!LogManager.telegramClient) return

    // Нужно ли отправлять лог в группу Телеграма?
    // НЕ отправится лог в 3 случаях:
    // 1. Если лог является обычным, а не предупреждением или ошибкой.
    // 2. Если параметр sendLogsToAGroup в конфиге стоит в значении false
    // 3. Если не установлен параметр logChat в конфиге.
    if (!['error', 'warn'].includes(typeConsole) ||
      !LogManager.config.sendLogsToAGroup ||
      !LogManager.config.logChat) return

    // Форматируем дополнительные блоки для сообщений.
    let formatBlocks: string = ''
    if (blocks?.length) {
      title += '\n' // Добавляем отступ.

      formatBlocks = blocks.map(b => `\`\`\`\n${b}\n\`\`\``).join('\n')
    }

    LogManager.telegramClient.api.getChat(LogManager.config.logChat)
      .then(() => {
        // Отправка сообщения в чат.
        const sendMessage = LogManager.telegramClient.api
          .sendMessage(<number>LogManager.config.logChat,
            `>> *${this.path}*\n[[ ${typeLog.toUpperCase()} ]] >> ${title}\n${formatBlocks ?? ''}`,
            { parse_mode: 'Markdown' })

        return sendMessage
      })
      .catch((err) => {
        console.error('[LOG_MANAGER_ERROR] Произошла ошибка при попытке отправить сообщение. Чата не существует!\n' + err.stack)
      })
  }

  /**
   * Отправить обычный лог.
   * @param type Тип лога, любая строка.
   * @param title Основное сообщение.
   * @param color - Цвет, просто число.
   * @param blocks Дополнительные блоки.
   * @example ```js
   * logManager.log('DATABASE', 'Подключение выполнилось успешно!')
   * logManager.log('DATABASE', 'Подключение выполнилось успешно!', undefined, [`Дополнительная информация: ...`])
   * ```
   * @returns { returnMethods }
   */
  public log (type: string, title: string, color?: number | number, blocks?: Array<string>): returnMethods {
    return this._send('log', type, title, color, blocks)
  }

  /**
   * Отправить лог с предупреждением.
   * @param type Тип лога, любая строка.
   * @param title Основное сообщение.
   * @param color - Цвет, просто число.
   * @param blocks Дополнительные блоки.
   * @example ```js
   * logManager.warn('DATABASE', 'Слишком долгое подключение.')
   * logManager.warn('DATABASE', 'Произошла ошибка при отправке чего-то', 'Текст ошибки.')
   * logManager.warn('DATABASE', 'Произошла ошибка при отправке чего-то', 'Текст ошибки.', undefined, ['Дополнительная информация...'])
   * ```
   * @returns { returnMethods }
   */
  public warn (type: string, title: string, warn?: string, color?: number | number, blocks?: Array<string>): returnMethods {
    if (!blocks) blocks = []
    if (warn) blocks.push(warn)

    return this._send('warn', type, title, color, blocks)
  }

  /**
   * Отправить лог c ошибкой.
   * @param type Тип лога, любая строка.
   * @param title Основное сообщение.
   * @param color - Цвет, просто число.
   * @param blocks Дополнительные блоки.
   * @example ```js
   * logManager.error('CLIENT', 'Произошзла какая-то ошибка.')
   * logManager.error('CLIENT', 'Произошла какая-то ошибка.', 'Текст ошибки.')
   * logManager.error('CLIENT', 'Произошла какая-то ошибка.', 'Текст ошибки.', undefined, ['Дополнительная информация...'])
   * ```
   * @returns { returnMethods }
   */
  public error (type: string, title: string, error?: string, color?: number | number, blocks?: Array<string>): returnMethods {
    if (!blocks) blocks = []
    if (error) blocks.push(error)

    return this._send('error', type, title, color, blocks)
  }
}

export default LogManager
