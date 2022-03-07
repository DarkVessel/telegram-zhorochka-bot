import { existsSync, readFileSync, writeFileSync } from 'fs'
import configSchema from '../configSchema'
import ConfigJSON from '../interfaces/ConfigJSON'

class ConfigManager {
  static data: ConfigJSON = {}

  constructor (public path: string) {
    this.path = path
  }

  public start () {
    if (!existsSync(this.path)) {
      writeFileSync(this.path, '{}')
    }

    this.reread()
    this.rereadSchema()
  }

  /**
   * Перезаписать файл конфига.
   * @returns { void }
   */
  public overwrite (): void {
    try {
      // Записываем файл.
      writeFileSync(
        this.path,
        JSON.stringify(ConfigManager.data, null, 4)
      )
    } catch (err) {
      console.error(
        '[CONFIG_MANAGER]',
        'Произошла ошибка при попытке записать данные в "' + this.path + '"\n',
        err.stack
      )
    }
  }

  /**
   * Перечитать файл конфига.
   * @returns { ConfigJSON }
   */
  public reread (): ConfigJSON {
    try {
      // Читаем файл.
      const data = readFileSync(this.path)
      ConfigManager.data = JSON.parse(data.toString())
    } catch (error) {
      // Сообщаем об ошибке.
      console.error(
        '[CONFIG_MANAGER]',
        `Произошла ошибка при попытке прочитать "${this.path}"\nСброс конфига!\n`,
        error.stack
      )
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
    for (const key in configSchema) {
      if (!Object.prototype.hasOwnProperty.call(configSchema, key)) continue
      config[key] = configSchema[key].default
    }

    return config
  }

  /**
   * Перезаписывает файл конфига по дефолту.
   */
  public reset (): void {
    ConfigManager.data = this.returnDefaultConfig()
    return this.overwrite() // Переписать конфиг.
  }

  /**
   * Перечитать схему и дополнить `config.json`
   * @returns { Promise<void> }
   */
  public rereadSchema (): void | Promise<void> {
    const data = {}
    // Читаем ключи со схемы.
    for (const key in configSchema) {
      // Проверяем, есть ли в конфиге этот ключ.
      if (ConfigManager.data[key]) {
        data[key] = ConfigManager.data[key]
      } else if (configSchema[key].default !== undefined) {
        // Если нет - добавляем.
        data[key] = configSchema[key].default
      }
    }

    // Проверка двух объектов.
    const dataKeys = Object.keys(data)
    const dataKeys2 = Object.keys(ConfigManager.data)

    if (dataKeys.length === dataKeys2.length) {
      dataKeys.sort()
      dataKeys2.sort()

      if (dataKeys.join(',') === dataKeys2.join(',')) return
    }

    // Переписываем конфиг.
    ConfigManager.data = data
    return this.overwrite()
  }
}

export default ConfigManager
