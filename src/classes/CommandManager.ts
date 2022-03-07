import { existsSync, readdirSync, statSync } from 'fs'
import { relative } from 'path'

import Command from '../handlers/Command'
import CommandData from '../interfaces/CommandData'
import UnloadedCommands from '../interfaces/UnloadedCommands'

import LogManager from './LogManager'
const logmanager = new LogManager('./src/classes/CommandManager.ts')
class CommandManager {
  public commands: Map<string, CommandData>
  public unloadedCommands: Array<UnloadedCommands>

  /**
   * @param commandsPath Путь до папки с командами относительно корня проекта.
   */
  constructor (public commandsPath: string) {
    if (!existsSync(this.commandsPath)) { throw new Error('Указан неправильный путь до папки с командами.') }

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
      logmanager.warn('COMMANDS', `Не было загружено ${this.unloadedCommands.length} команд.`, this.unloadedCommands.map((d, i) => `${i + 1}. ${d.path} (${d.error})`).join('\n'))
    }
  }

  /**
   * Добавить команду в коллекцию this.commands.
   * @param path Путь до команды, желательно глобальный.
   */
  public addCommand (path: string) {
    try {
      const Command = require(path)
      const command: Command = new Command()

      // Проверить команды на их наличие
      const commandCheck = this.commands.has(command.cmd.name)
      if (commandCheck) {
        logmanager.error('COMMANDS', `Kоманда по пути \`${path}\` конфликтует уже с существующей командой \`${command.cmd.name}\`\nКоманда не загружена!`)
        return
      }

      this.commands.set(command.cmd.name, command.cmd)
    } catch (error) {
      logmanager.error('COMMANDS', `При загрузке команды \`${path}\` произошла ошибка:\n`, error.stack)
      this.unloadedCommands.push({ path, error })
    }
  }

  private loadCommands (path = this.commandsPath): void {
    // Файлы и папки.
    const filesAndFolders: string[] = readdirSync(this.commandsPath)

    // Файлы.
    const files = filesAndFolders
      .filter((f) => statSync(this.commandsPath + f).isFile()) // Отсортировать только по файлам.
      .filter((x) => x.endsWith('.js')) // Отсортировать файлы по окончанию .js

    // Папки.
    const folders = filesAndFolders
      .filter((f) =>
        statSync(this.commandsPath + f)
          .isDirectory()
      ) // Отсортировать только по папкам.

    // Проходимся по вложенным папкам.
    for (const folder of folders) {
      this.loadCommands(path + folder + '/')
    }

    // Загрузить команды.
    for (const file of files) {
      const pathRelative = relative('build/src/', path + `${file}`)
      logmanager.log('COMMANDS', `${this.commands.size + 1}. Загрузка ${pathRelative}`)
      this.addCommand(pathRelative)
    }
  }
}

export default CommandManager
