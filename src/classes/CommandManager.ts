import { existsSync, readdirSync, statSync } from 'fs'
import { relative } from 'path'
import { Context } from 'telegraf'
import { Update } from 'telegraf/typings/core/types/typegram'

import Command from '../handlers/Command'
import CommandData from '../interfaces/CommandData'
import UnloadedCommands from '../interfaces/UnloadedCommands'
import isAdmin from '../utils/isAdmin'
import ConfigManager from './ConfigManager'
import DialogManager from './DialogManager'

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

  public static async commandCallHandler (cmd: CommandData, ctx: Context<Update>): Promise<any> {
    try {
      if (!cmd.allowUseInDM && ctx.chat?.type === 'private') return DialogManager.doNotUseInDM(ctx)

      if (cmd.disable) {
        logmanager.warn('COMMANDS', `Команда "/${cmd.name}" не выполнилась, так как выключена.`)
        return
      }

      // Проверка на создателя.
      if (cmd.checkOwner) {
        if (!ConfigManager.data.bot_owner) return DialogManager.notKey(ctx, 'bot_owner')
        if (ConfigManager.data.bot_owner !== ctx.message?.from.id) return DialogManager.notOwner(ctx)
      }

      if ((cmd.checkAdmin || cmd.checkMeAdmin) && ctx.chat?.type !== 'private') {
        if (!ctx.from) return
        const chatAdministrators = await ctx.getChatAdministrators()
        if (cmd.checkAdmin && !isAdmin(chatAdministrators, ctx.from?.id)) return DialogManager.notAdmin(ctx)
        if (cmd.checkMeAdmin && !isAdmin(chatAdministrators, ctx.botInfo.id)) return DialogManager.meNotAdmin(ctx)
      }

      // @ts-ignore
      const args = ctx.message.text
        .trim()
        .split(' ')
        .filter(s => s !== '')

      args.shift()
      cmd.run(ctx, args)
    } catch (err) {
      logmanager.error('COMMAND', `Не удалось обработать команду /${cmd.name}`, err.stack)
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
        error.stack)
      this.unloadedCommands.push({ path, error })
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
