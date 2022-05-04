// В configSchema хранятся данные о том, как устроен конфиг.
import configSchema from '../scheme/configScheme'
import { Model } from 'sequelize-typescript'

// Интерфейс и модель Config-a.
import ConfigKeys from '../interfaces/ConfigKeys'
import Configuration from '../models/Configuration'
type modelType = Model<any, any>

interface DefaultConfiguration {
  [key: string]: undefined | null | number | string | boolean
}

/**
 * Класс, для управления конфигурацией в MySQL.
 */
class ConfigManager {
  public data: ConfigKeys

  // Данный элемент статистический, это означает что к нему можно обращаться напрямую, без инициализации класса.
  // В data хранится конфиг из config.json
  private static _data: ConfigKeys = {}
  public static get data (): ConfigKeys {
    return ConfigManager._data
  }

  public static set data (value: ConfigKeys) {
    ConfigManager._data = value
  }

  // Хранит активную модель конфигурации.
  static model: modelType | null = null

  constructor () {
    // Засовываем гиперссылку на ConfigManager.data
    this.data = ConfigManager.data
  }

  /**
   * Запустить менеджер конфигурации. После запуска обновятся таблицы, а в ConfigManager.data появится сам конфиг.
   */
  public async start () {
    return this.fetch()
  }

  /**
   * Получить модель активной конфигурации.
   * В случае, если в базе данных config не найден, создастся новая запись со значениями по умолчанию.
   * @param again При значении true заново получает модель из базы данных.
   * @returns { Promise<modelType> }
   */
  public async getModel (again?: boolean): Promise<modelType> {
    // Если модели нет или again == true
    if (!ConfigManager.model || again) {
      ConfigManager.model = await Configuration.findOne()

      // Если findOne() вернул null - создастся новая запись.
      if (!ConfigManager.model) {
        ConfigManager.model = await Configuration.create()
      }
    }

    // Возвращаем модель.
    return <modelType>ConfigManager.model
  }

  /**
   * Сохранить конфигурацию в базу данных. Данные сохраняются из ConfigManager.data
   * @returns { Promise<void> }
   */
  public async save (): Promise<void> {
    try {
      // Получаем модель.
      const model = await this.getModel()

      // Очищаем ConfigManager.data от ненужных ключеЙ.
      this._removeRedundantElements()

      // Применяем изменения.
      await Configuration.upsert({
        id: model.getDataValue('id'),
        ...ConfigManager.data
      })
    } catch (err) {
      console.error(
        '[CONFIG_MANAGER]',
        'Произошла ошибка при попытке записать данные в MySQL.',
        err
      )
    }
  }

  /**
   * Отправляет запрос на сервер MySQL для получения конфигурации.
   * @returns { Promise<ConfigKeys> }
   */
  public async fetch (): Promise<ConfigKeys> {
    try {
      const model = await this.getModel(true)

      // Присваиваем новое значение для data.
      // @ts-ignore
      ConfigManager.data = Object.assign({}, model.dataValues)
      this._removeRedundantElements()
    } catch (error) {
      console.error('[CONFIG_MANAGER]',
        'Произошла ошибка при попытке получить Configuration из MySQL.',
        error)
      this.reset()
    }
    return ConfigManager.data
  }

  /**
   * Получить конфигурацию по умолчанию.
   * @returns { ConfigKeys }
   */
  public getDefaultConfig (): ConfigKeys {
    const config: DefaultConfiguration = {}

    // Проходимся по схеме конфига.
    for (const key in configSchema) {
      if (!Object.prototype.hasOwnProperty.call(configSchema, key)) continue
      config[key] = configSchema[key].default
    }

    return config
  }

  /**
   * Сбрасывает всю конфигурацию на сервере по умолчанию.
   * @returns { Promise<ConfigKeys> }
   */
  public async reset (): Promise<ConfigKeys> {
    // Присваиваем значению data дефолтный конфиг.
    const data = this.getDefaultConfig()

    ConfigManager.data = data
    await this.save()
    return data
  }

  /**
   * Удаляет из ConfigManager.data такие ненужные ключи, как id, createdAt и updatedAt
   */
  private _removeRedundantElements (): void {
    delete ConfigManager.data.id
    delete ConfigManager.data.createdAt
    delete ConfigManager.data.updatedAt
  }
}

export default ConfigManager
