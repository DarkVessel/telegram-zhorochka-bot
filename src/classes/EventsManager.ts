import { existsSync, readdirSync, statSync } from 'fs'
import { relative } from 'path'

import UnloadedCommands from '../interfaces/UnloadedCommands'

import LogManager from './LogManager'
const logmanager = new LogManager('./src/classes/EventsManager.ts')
class EventsManager {
  public events: Array<string>
  public unloadedEvents: Array<UnloadedCommands>

  constructor (public pathEvents: string) {
    if (!existsSync(this.pathEvents)) { throw new Error('Указан неправильный путь до папки с командами.') }

    if (this.pathEvents[this.pathEvents.length] !== '/') this.pathEvents += '/'
    this.events = []
    this.unloadedEvents = []
  }

  public start () {
    this.events = []
    this.unloadedEvents = []

    this.loadEvents()
    logmanager.log('EVENTS', 'Загрузка завершена!')
    if (this.unloadedEvents.length) {
      logmanager.warn('EVENTS', `Не было загружено ${this.unloadedEvents.length} команд.`, this.unloadedEvents.map((d, i) => `${i + 1}. ${d.path} (${d.error})`).join('\n'))
    }
  }

  private loadEvents () {
    // Получаем все файлы.
    const files: string[] = readdirSync(this.pathEvents)
      .filter((f) => statSync(this.pathEvents + f).isFile())
      .filter((x) => x.endsWith('.js'))

    // Загружаем их.
    logmanager.log('EVENTS', 'Загрузка ивентов.')
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        const pathRelative = relative('build/src/', this.pathEvents + `${file}`)
        logmanager.log('EVENTS', `${i + 1}. Загрузка ${pathRelative}`)
        require(pathRelative)
        this.events.push(file)
      } catch (error) {
        this.unloadedEvents.push({ error, path: file })
        logmanager.error('EVENTS', `Ошибка при загрузке ${file}"`, error.stack)
      }
    }
  }
}

export default EventsManager
