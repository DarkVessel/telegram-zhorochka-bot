import { existsSync, readdirSync, statSync } from 'fs'
import { relative } from 'path'

import Command from '../handlers/Command'
import CommandData from '../interfaces/CommandData'
import UnloadedCommands from '../interfaces/UnloadedCommands'

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
      const Command = require(path)

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
      const pathRelative = relative('build/src/', path + `${file}`)
      logmanager.log('COMMANDS', `${this.commands.size + 1}. Загрузка ${pathRelative}`)
      this.addCommand(pathRelative)
    }
  }
}

export default CommandManager
