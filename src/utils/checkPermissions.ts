// Менеджеры, утилиты.
import generateBasicDialogTags from './generateBasicDialogTags'
import DialogManager from '../classes/DialogManager'
import ConfigManager from '../classes/ConfigManager'
import isAdmin from './isAdmin'

// Наш клиент.
import bot from '../telegramClient'

// Типы.
import CommandContext from '../types/CommandContext'
import { Context } from 'grammy'

// Диалоги.
import cannotBeUsedInDM from '../contents/commandHandler/cannotBeUsedInDM.dialogues'
import memberNotAdmin from '../contents/commandHandler/memberNotAdmin.dialogues'
import notBotCreator from '../contents/commandHandler/notBotCreator.dialogues'
import botNotAdmin from '../contents/commandHandler/botNotAdmin.dialogues'

// Менеджер логов.
import LogManager from '../classes/LogManager'
const logmanager = new LogManager('./src/utils/checkPermissions.ts')

interface Options {
  allowUseInDM: boolean,
  checkOwner: boolean,
  checkAdmin: boolean,
  checkMeAdmin: boolean
}

/**
 * Проверяет основные права пользователя. Используется в командах.
 * @param cmdName Название команды.
 * @param ctx Context
 * @param options Параметры, такие как: allowUseInDM, checkOwner, checkAdmin, checkMeAdmin
 * @returns { boolean }
 */
async function checkPermissions (cmdName: string, ctx: CommandContext<Context>, options: Options): Promise<boolean> {
  try {
    // Генерируем теги.
    const dialogManager = new DialogManager(ctx.chat.id, ctx.message?.message_id)
    const tags = generateBasicDialogTags(ctx)

    // Выдаём ошибку, если команда была использована в ЛС.
    if (!options.allowUseInDM && ctx.chat?.type === 'private') {
      dialogManager.send(cannotBeUsedInDM, { tags })
      return false
    }

    // Проверка, чтобы команду мог выполнять только создатель бота.
    if (options.checkOwner) {
      if (!ConfigManager.data.botOwner) {
        logmanager.warn('COMMANDS', `Команда "/${cmdName}" не выполнилась, из-за отсутствия ключа "botOwner" в модели Configuration MySQL.`)
        return false
      }

      if (ConfigManager.data.botOwner !== ctx.message?.from.id) {
        dialogManager.send(notBotCreator, { tags, deleteMsg: true })
        return false
      }
    }

    // Проверка на то, чтобы бот был админом и участник тоже.
    // Проверка на админа пропускается, если чат приватный.
    if ((options.checkAdmin || options.checkMeAdmin) && ctx.chat?.type !== 'private') {
      if (!ctx.from) return false

      // Получаем список админов.
      const chatAdministrators = await ctx.getChatAdministrators()

      // Проверка, чтобы участник был админом.
      if (options.checkAdmin && !isAdmin(chatAdministrators, ctx.from?.id)) {
        dialogManager.send(memberNotAdmin, { tags, deleteMsg: true })
        return false
      }

      // Проверка, чтобы бот был админом.
      if (options.checkMeAdmin && !isAdmin(chatAdministrators, bot.botInfo.id)) {
        logmanager.warn('COMMANDS', `Не удалось выполнить команду "/${cmdName}", так как бот не является админом.`)
        dialogManager.send(botNotAdmin, { tags, deleteMsg: true })
        return false
      }
      return true
    }
  } catch (err) {
    logmanager.error('COMMAND', `Не удалось обработать команду /${cmdName}`, String(err))
  }
  return true
}

export default checkPermissions
