import { existsSync, readdirSync, statSync } from 'fs'
import { Sequelize } from 'sequelize'
import LogManager from './LogManager'
import { relative } from 'path'

interface UnloadedModel {
  fileName: string,
  error: string
}
const logmanager = new LogManager('./src/classes/SequelizeDB.ts')
class SequelizeDB extends Sequelize {
  static unloadedModels: Array<UnloadedModel> = []

  /**
   * Запуск сканирования всех моделей и синхронизации их с базой данных.
   * @param path Путь, откуда сканировать ивенты.
   */
  public async start (path: string) {
    logmanager.log('SEQUELIZE', 'Загрузка моделей...')
    this.loadingModels(path)
    logmanager.log('SEQUELIZE', 'Загрузка моделей завершена!')

    // Если есть не загруженные модели.
    if (SequelizeDB.unloadedModels.length) {
      logmanager.warn('SEQUELIZE',
        `Не было загружено ${SequelizeDB.unloadedModels.length} моделей..`,
        SequelizeDB.unloadedModels.map((d, i) => `${i + 1}. ${d.fileName} (${d.error})`).join('\n'))
    }

    logmanager.log('SEQUELIZE', 'Синхронизация моделей...')
    const promise = this.sync({ alter: true })
    promise.then(() => logmanager.log('SEQUELIZE', 'Синхронизация завершена!'))
    promise.catch((err) => logmanager.error('SEQUELIZE', 'Произошла ошибка при синхронизации моделей!', err.stack))
    return promise
  }

  /**
   * Загрузка моделей.
   * @param path - Путь к папке с моделями.
   */
  public loadingModels (path: string) {
    if (!existsSync(path)) {
      throw new Error('Указан неправильный путь до папки с моделями.')
    }

    if (path[path.length - 1] !== '/') path += '/'

    // Получаем все файлы.
    const files: string[] = readdirSync(path)
      .filter((x) => x.endsWith('.js')) // Фильтруем по окончанию .js
      .filter((f) => statSync(path + f).isFile()) // Фильтруем по файлам.

    // Загружаем все модели.
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        // Получаем путь к файлу относительно папки билда.
        const pathRelative = relative('build/src/classes', path + file)
        logmanager.log('SEQUELIZE', `${i + 1}. Загрузка ${pathRelative}`)

        // Загружаем файл.
        require(pathRelative)
      } catch (error) {
        SequelizeDB.unloadedModels.push({ error: String(error), fileName: file })
        logmanager.error('SEQUELIZE', `Ошибка при загрузке "${path}${file}"`, String(error))
      }
    }
  }
}

export default SequelizeDB
