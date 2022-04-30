// В конфиг-схеме хранятся данные о том, как должен быть устроен конфиг.
import { Model } from 'sequelize/types'
import configSchema from '../configSchema'

// Копия configSchema, но она отображает только как будет выглядить сам config.json
import ConfigJSON from '../interfaces/ConfigKeys'
import Configuration from '../models/Configuration'

type modelType = Model<any, any>
class ConfigManager {
  // Данный элемент статистический, это означает что к нему можно обращаться напрямую, без инициализации класса.
  // В data хранится конфиг из config.json
  static data: ConfigJSON = {}

  // Хранит активную модель конфигурации.
  static model: modelType | null = null

  public async start () {
    return this.fetch()
  }

  public async getModel (again?: boolean): Promise<modelType> {
    if (!ConfigManager.model || again) {
      ConfigManager.model = await Configuration.findOne()
      if (!ConfigManager.model) {
        ConfigManager.model = await Configuration.create()
      }
    }

    return <modelType>ConfigManager.model
  }

  /**
   * Перезаписать конфиг.
   * @returns { void }
   */
  public async save (): Promise<void> {
    try {
      const model = await this.getModel()

      this._removeRedundantElements()
      await Configuration.upsert({
        id: model.getDataValue('id'),
        ...ConfigManager.data
      })
    } catch (err) {
      console.error(
        '[CONFIG_MANAGER]',
        'Произошла ошибка при попытке записать данные в MySQL',
        err.stack
      )
    }
  }

  /**
   * Перечитать конфиг.
   * @returns { ConfigJSON }
   */
  public async fetch (): Promise<ConfigJSON> {
    try {
      const model = await this.getModel(true)

      // Присваиваем новое значение для data.
      // @ts-ignore
      ConfigManager.data = Object.assign({}, model.dataValues)
      this._removeRedundantElements()
    } catch (error) {
      console.error('[CONFIG_MANAGER]',
        'Произошла ошибка при попытке получить Configuration из MySQL.',
        error.stack)
      this.reset()
    }
    return ConfigManager.data
  }

  /**
   * Вернуть дефолтный конфиг.
   * @returns { ConfigJSON }
   */
  public returnDefaultConfig (): ConfigJSON {
    const config = {}

    // Проходимся по схеме конфига.
    for (const key in configSchema) {
      if (!Object.prototype.hasOwnProperty.call(configSchema, key)) continue
      config[key] = configSchema[key].default
    }

    // Выводим дефолтный конфиг.
    return config
  }

  /**
   * Перезаписывает файл конфига по дефолту.
   */
  public reset (): Promise<void> {
    // Присваиваем значению data дефолтный конфиг.
    const data = this.returnDefaultConfig()

    for (const key in data) {
      ConfigManager.data[key] = data[key]
    }

    return this.save() // Перезаписываем файл.
  }

  private _removeRedundantElements () {
    delete ConfigManager.data.id
    delete ConfigManager.data.createdAt
    delete ConfigManager.data.updatedAt
  }
}

export default ConfigManager
