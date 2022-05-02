import getRandomElement from '../utils/getRandomElement'
import ConfigManager from './ConfigManager'
import LogManager from './LogManager'
import bot from '../telegramClient'

const logManager = new LogManager('./src/classes/DialogManager.ts')
interface ReplaceArgument {
  [key: string]: string
}

interface Options {
  parseMode?: 'HTML' | 'Markdown'
  deleteMsg?: boolean,
  tags?: ReplaceArgument,
}
/**
 * Менеджер диалогов.
 */
class DialogManager {
  public chatId: number
  public messageId: number | undefined

  /**
   * @param chatId ID чата.
   * @param messageId ID cообщения, на которое нужно ответить.
   */
  constructor (chatId: number, messageId?: number | undefined) {
    this.chatId = chatId
    this.messageId = messageId
  }

  /**
   * Callback для обработки ошибок, связанные с удалением сообщений.
   * @param err Текст ошибки.
   */
  private static _handleMessageDeletionError (err: string): void {
    logManager.warn('DIALOG_MANAGER', 'Не удалось удалить сообщение.', err)
  }

  /**
   * Отправить сообщение.
   * @param contents Массив строк, отправится случайная стройка.
   * @param options Дополнительные параметры.
   * @param options.deleteMsg Нужно ли удалять сообщение, по умолчанию не удаляется.
   * @param options.parseMode parse_mode, либо HTML, либо Markdown
   * @param options.replace Объект из ключей и значений в виде строки.
   */
  public async send (contents: Array<string>, options: Options = {}) {
    try {
      if (!options.parseMode) options.parseMode = 'HTML'

      // Получаем рандомный элемент.
      let text = getRandomElement(contents)

      // Заменяем {теги}
      if (options.tags) {
        const keys = Object.keys(options.tags)
        for (const tag of keys) {
          text = text.replace('{' + tag + '}', options.tags[tag])
        }
      }

      // Отправляем сообщение.
      const message = await bot.api.sendMessage(this.chatId, text, {
        parse_mode: options.parseMode,
        reply_to_message_id: this.messageId,
        allow_sending_without_reply: true
      })

      // Удаляем сообщение по заданному тайм-ауту.
      if (options.deleteMsg && ConfigManager.data.messageDeletionTimeout && ConfigManager.data.messageDeletionTimeout > 0) {
        setTimeout(() => {
          bot.api.deleteMessage(this.chatId, message.message_id).catch(DialogManager._handleMessageDeletionError)
          bot.api.deleteMessage(this.chatId, message.message_id).catch(DialogManager._handleMessageDeletionError)
        }, ConfigManager.data.messageDeletionTimeout)
      }
    } catch (err) {
      logManager.error('DIALOG_MANAGER', 'Произошла какая-то ошибка, при обработке лога.', String(err), [`ID Чата: ${this.chatId}\nID сообщения: ${this.messageId}`])
    }
  }
}

export default DialogManager
