import { existsSync, readdirSync, statSync } from 'fs'
import { Sequelize } from 'sequelize'
import { relative } from 'path'

import UnloadedEvents from '../interfaces/UnloadedEvent'
import LogManager from './LogManager'

const logmanager = new LogManager('./src/classes/SequelizeDB.ts')
class SequelizeDB extends Sequelize {
  public unloadedModels: Array<UnloadedEvents>

  constructor (...args) {
    super(...args)
    this.unloadedModels = []
  }

  /**
   * Запуск основных функций.
   */
  public async start (path: string) {
    logmanager.log('SEQUELIZE', 'Загрузка моделей...')
    this.loadingModels(path)
    logmanager.log('SEQUELIZE', 'Загрузка моделей завершена!')

    if (this.unloadedModels.length) {
      logmanager.warn('SEQUELIZE',
        `Не было загружено ${this.unloadedModels.length} моделей..`,
        this.unloadedModels.map((d, i) => `${i + 1}. ${d.filename} (${d.error})`).join('\n'))
    }

    logmanager.log('SEQUELIZE', 'Синхронизация моделей...')
    const promise = this.sync({ alter: true })
    promise.then(() => logmanager.log('SEQUELIZE', 'Синхронизация завершена!'))
    promise.catch((err) => logmanager.error('SEQUELIZE', 'Произошла ошибка при синхронизации моделей!', err.stack))
    return promise
  }

  /**
   * Путь к папке, где находятся модели.
   * @param path - Путь к папке.
   */
  public loadingModels (path: string) {
    if (!existsSync(path)) {
      throw new Error('Указан неправильный путь до папки с моделями.')
    }

    if (path[path.length - 1] !== '/') path += '/'

    const files: string[] = readdirSync(path)
      .filter((f) => statSync(path + f).isFile()) // Фильтруем по файлам.
      .filter((x) => x.endsWith('.js')) // Фильтруем по окончанию .js

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        // Получаем путь к файлу относительно папки билда.
        const pathRelative = relative('build/src/classes', path + file)
        logmanager.log('SEQUELIZE', `${i + 1}. Загрузка ${pathRelative}`)

        // Запускаем файл.
        require(pathRelative)
      } catch (error) {
        this.unloadedModels.push({ error, filename: file })
        logmanager.error('SEQUELIZE', `Ошибка при загрузке "${path}${file}"`, error.stack)
      }
    }
  }
}

export default SequelizeDB
