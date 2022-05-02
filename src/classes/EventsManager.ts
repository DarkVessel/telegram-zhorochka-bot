// Модули.
import { existsSync, readdirSync, statSync } from 'fs'
import { relative } from 'path' // Поможет строить пути, которые будут относительны определённой папки.
import LogManager from './LogManager'

// Интерфейсы и типы.
import UnloadedEvents from '../interfaces/UnloadedEvent'

const logmanager = new LogManager('./src/classes/EventsManager.ts')

/**
 * Класс который загружает ивенты с events/
 */
class EventsManager {
  public events: Array<string>
  public unloadedEvents: Array<UnloadedEvents>

  /**
   * @param pathEvents Папка с ивентами
   */
  constructor (public pathEvents: string) {
    if (!existsSync(this.pathEvents)) {
      throw new Error('Указан неправильный путь до папки с ивентами.')
    }

    // Проверяем наличие символа "/" на конце пути.
    // Если его нету - мы его добавляем.
    if (this.pathEvents[this.pathEvents.length] !== '/') this.pathEvents += '/'

    this.events = []
    this.unloadedEvents = []
  }

  /**
   * Начинает сканировать папку с ивентами.
   */
  public start () {
    this.events = []
    this.unloadedEvents = []

    this.loadEvents()
    logmanager.log('EVENTS', 'Загрузка завершена!')
    if (this.unloadedEvents.length) {
      logmanager.warn('EVENTS',
        `Не было загружено ${this.unloadedEvents.length} ивентов.`,
        this.unloadedEvents.map((d, i) => `${i + 1}. ${d.filename} (${d.error})`).join('\n'))
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

    // Проходимся по массиву files
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        // Получаем путь к файлу относительно папки билда.
        const pathRelative = relative('build/src/classes/', this.pathEvents + `${file}`)
        logmanager.log('EVENTS', `${i + 1}. Загрузка ${pathRelative}`)

        // Запускаем файл.
        require(pathRelative)

        // Записываем, что файл загружен.
        this.events.push(file)
      } catch (error) {
        this.unloadedEvents.push({
          error: !(error instanceof Error) ? new Error(String(error)) : error,
          filename: file
        })
        logmanager.error('EVENTS', `Ошибка при загрузке ${file}`, String(error))
      }
    }
  }
}

export default EventsManager
