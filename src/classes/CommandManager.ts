// Модули.
import { existsSync, readdirSync, statSync } from 'fs'
import { relative } from 'path'

// Интерфейсы и типы.
import UnloadedCommands from '../interfaces/UnloadedCommand'
import CommandContext from '../types/CommandContext'
import CommandData from '../interfaces/CommandData'
import { Context } from 'grammy'

// Менеджеры, обработчики и утилиты.
import generateBasicDialogTags from '../utils/generateBasicDialogTags'
import ConfigManager from './ConfigManager'
import DialogManager from './DialogManager'
import isAdmin from '../utils/isAdmin'
import bot from '../telegramClient'
import Command from './Command'

// Диалоги.
import cannotBeUsedInDM from '../contents/commandHandler/cannotBeUsedInDM.dialogues'
import memberNotAdmin from '../contents/commandHandler/memberNotAdmin.dialogues'
import notBotCreator from '../contents/commandHandler/notBotCreator.dialogues'
import botNotAdmin from '../contents/commandHandler/botNotAdmin.dialogues'

import LogManager from './LogManager'
const logmanager = new LogManager('./src/classes/CommandManager.ts')

/**
 * Менеджер команд.
 */
class CommandManager {
  public commands: Map<string, CommandData>
  public unloadedCommands: Array<UnloadedCommands>

  /**
   * @param commandsPath Путь до папки с командами относительно корня проекта.
   */
  constructor (public commandsPath: string) {
    if (!existsSync(this.commandsPath)) {
      throw new Error('Указан неправильный путь до папки с командами.')
    }

    // Проверяем наличие символа "/" на конце пути.
    // Если его нету - мы его добавляем.
    if (this.commandsPath[this.commandsPath.length] !== '/') this.commandsPath += '/'

    this.commands = new Map()
    this.unloadedCommands = []
  }

  public static async commandCallHandler (cmd: CommandData, ctx: CommandContext<Context>): Promise<any> {
    try {
      // Генерируем теги.
      const dialogManager = new DialogManager(ctx.chat.id, ctx.message?.message_id)
      const tags = generateBasicDialogTags(ctx)

      // Если команда отключена.
      if (cmd.disable) {
        return logmanager.warn('COMMANDS', `Команда "/${cmd.name}" не выполнилась, так как выключена.`)
      }

      // Выдаём ошибку, если команда была использована в ЛС.
      if (!cmd.allowUseInDM && ctx.chat?.type === 'private') {
        return dialogManager.send(cannotBeUsedInDM, { tags })
      }

      // Проверка, чтобы команду мог выполнять только создатель бота.
      if (cmd.checkOwner) {
        if (!ConfigManager.data.botOwner) {
          return logmanager.warn('COMMANDS', `Команда "/${cmd.name}" не выполнилась, из-за отсутствия ключа "botOwner" в модели Configuration MySQL.`)
        }

        if (ConfigManager.data.botOwner !== ctx.message?.from.id) {
          return dialogManager.send(notBotCreator, { tags, deleteMsg: true })
        }
      }

      // Проверка на то, чтобы бот был админом и участник тоже.
      // Проверка на админа пропускается, если чат приватный.
      if ((cmd.checkAdmin || cmd.checkMeAdmin) && ctx.chat?.type !== 'private') {
        if (!ctx.from) return

        // Получаем список админов.
        const chatAdministrators = await ctx.getChatAdministrators()

        // Проверка, чтобы участник был админом.
        if (cmd.checkAdmin && !isAdmin(chatAdministrators, ctx.from?.id)) {
          return dialogManager.send(memberNotAdmin, { tags, deleteMsg: true })
        }

        // Проверка, чтобы бот был админом.
        if (cmd.checkMeAdmin && !isAdmin(chatAdministrators, bot.botInfo.id)) {
          logmanager.warn('COMMANDS', `Не удалось выполнить команду "/${cmd.name}", так как бот не является админом.`)
          return dialogManager.send(botNotAdmin, { tags, deleteMsg: true })
        }
      }

      // Получаем аргументы после команды.
      const args = String(ctx.message?.text)
        .trim() // Удаляем пробелы по бокам.
        .split(' ')
        .filter(s => s !== '') // Удаляем пустые аргументы.

      args.shift() // Удаляем первый аргумент, это /command
      cmd.run(ctx, args, { dialogManager }) // Запускаем команду.
    } catch (err) {
      logmanager.error('COMMAND', `Не удалось обработать команду /${cmd.name}`, String(err))
    }
  }

  /**
   * Просканировать папку с командами и загрузить их.
   */
  public start () {
    this.commands.clear()
    this.unloadedCommands = []

    this.loadCommands()
    logmanager.log('COMMANDS', 'Загрузка завершена!')
    if (this.unloadedCommands.length) {
      logmanager.warn('COMMANDS',
        `Не было загружено ${this.unloadedCommands.length} команд.`,
        this.unloadedCommands.map((d, i) => `${i + 1}. ${d.path} (${d.error})`).join('\n')
      )
    }
  }

  /**
   * Добавить команду в коллекцию this.commands.
   * @param path Путь до команды, желательно глобальный.
   */
  public addCommand (path: string) {
    try {
      // Вызываем файл с командой.
      const Command = require(path).default

      // Получаем объект самой команды.
      const command: Command = new Command()

      // Проверяем дубликат.
      const commandCheck = this.commands.has(command.cmd.name)
      if (commandCheck) {
        const error = Error(`Kоманда по пути \`${path}\` конфликтует уже с существующей командой \`${command.cmd.name}\``)
        this.unloadedCommands.push({ path, error })
        logmanager.error('COMMANDS', `${error.message}\nКоманда не загружена!`)
        return
      }

      // Записываем команду.
      this.commands.set(command.cmd.name, command.cmd)

      // Выводим дополнительную информацию.
      if (command.cmd.disable) {
        logmanager.warn('COMMANDS', `Команда "/${command.cmd.name}" загружена, однако выполнятся не будет, из-за активного параметра "disable" в команде.`)
      }
    } catch (error) {
      logmanager.error('COMMANDS',
        `При загрузке команды \`${path}\` произошла ошибка:`,
        String(error))
      this.unloadedCommands.push({
        path,
        error: !(error instanceof Error)
          ? new Error(String(error))
          : error
      })
    }
  }

  /**
   * Проходится по файлам и папкам, загружая команды.
   * @param path { string }
   */
  private loadCommands (path = this.commandsPath): void {
    // Получаем файлы и папки.
    const filesAndFolders: string[] = readdirSync(path)

    // Сортируем из общего списка только .js файлы.
    const files = filesAndFolders
      .filter((f) => statSync(path + f).isFile()) // Отсортировать только по файлам.
      .filter((x) => x.endsWith('.js')) // Отсортировать файлы по окончанию .js

    // Сортируем из общего списка только папки.
    const folders = filesAndFolders
      .filter((f) => statSync(path + f).isDirectory())

    // Проходимся по вложенным папкам.
    for (const folder of folders) {
      // Заново вызываем эту функцию, чтобы загрузить команды уже с папок.
      this.loadCommands(path + folder + '/')
    }

    // Загружаем команды.
    for (const file of files) {
      const pathRelative = relative('build/src/classes/', path + `${file}`)
      logmanager.log('COMMANDS', `${this.commands.size + 1}. Загрузка ${pathRelative}`)
      this.addCommand(pathRelative)
    }
  }
}

export default CommandManager
