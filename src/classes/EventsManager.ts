import { existsSync, readdirSync, statSync } from 'fs'
// Функция relative помогает строить пути, которые будут относительны определённой папки.
import { relative } from 'path'

import UnloadedCommands from '../interfaces/UnloadedCommands'

import LogManager from './LogManager'
const logmanager = new LogManager('./src/classes/EventsManager.ts')

/**
 * Класс который загружает ивенты с events/
 */
class EventsManager {
  public events: Array<string> // Массив загруженных файлов.
  public unloadedEvents: Array<UnloadedCommands> // Массив, соответственно, не загруженных файлов.

  constructor (public pathEvents: string) {
    if (!existsSync(this.pathEvents)) {
      throw new Error('Указан неправильный путь до папки с командами.')
    }

    // Проверяем наличие символа "/" на конце пути.
    // Если его нету - мы его добавляем.
    if (this.pathEvents[this.pathEvents.length] !== '/') this.pathEvents += '/'

    this.events = []
    this.unloadedEvents = []
  }

  /**
   * Запускает сканирование папки.
   */
  public start () {
    this.events = []
    this.unloadedEvents = []

    this.loadEvents()
    logmanager.log('EVENTS', 'Загрузка завершена!')
    if (this.unloadedEvents.length) {
      logmanager.warn('EVENTS', `Не было загружено ${this.unloadedEvents.length} команд.`, this.unloadedEvents.map((d, i) => `${i + 1}. ${d.path} (${d.error})`).join('\n'))
    }
  }

  /**
   * Загружаем ивенты.
   */
  private loadEvents () {
    // Получаем все файлы и папки.
    const files: string[] = readdirSync(this.pathEvents)
      .filter((f) => statSync(this.pathEvents + f).isFile()) // Фильтруем по файлам.
      .filter((x) => x.endsWith('.js')) // Фильтруем по окончанию .js

    logmanager.log('EVENTS', 'Загрузка ивентов.')
    // Загружаем ивенты.
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        // Получаем путь к файлу относительно папки билда.
        const pathRelative = relative('build/src/', this.pathEvents + `${file}`)
        logmanager.log('EVENTS', `${i + 1}. Загрузка ${pathRelative}`)

        // Запускаем файл.
        require(pathRelative)

        // Записываем, что файл загружен.
        this.events.push(file)
      } catch (error) {
        this.unloadedEvents.push({ error, path: file })
        logmanager.error('EVENTS', `Ошибка при загрузке ${file}"`, error.stack)
      }
    }
  }
}

export default EventsManager
