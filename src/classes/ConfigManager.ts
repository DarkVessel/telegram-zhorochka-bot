// Экспортируем функции из fs.
import { existsSync, readFileSync, writeFileSync } from 'fs'

// В конфиг-схеме хранятся данные о том, как должен быть устроен конфиг.
import configSchema from '../configSchema'

// Копия configSchema, но она отображает только как будет выглядить сам config.json
import ConfigJSON from '../interfaces/ConfigJSON'

class ConfigManager {
  // Данный элемент статистический, это означает что к нему можно обращаться напрямую, без инициализации класса.
  // В data хранится конфиг из config.json
  static data: ConfigJSON = {}

  // Конструктор вызывается при инициализации класса.
  constructor (public path: string) {
    this.path = path // Указываем менеджеру, что конфиг находится по такому-то пути.
  }

  public start () {
    // Проверяет наличие конфиг-файла.
    if (!existsSync(this.path)) {
      // Если конфиг-файл не существует, мы создаём его с содержимым "{}"
      writeFileSync(this.path, '{}')
    }

    // Вызываем функции reread, rereadSchema
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
      if (process.env.MOCHA_WORKING) return
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

      // Присваиваем новое значение для data.
      ConfigManager.data = JSON.parse(data.toString())
    } catch (error) {
      if (!process.env.MOCHA_WORKING) {
        console.error('[CONFIG_MANAGER]',
          `Произошла ошибка при попытке прочитать "${this.path}"\nСброс конфига!`,
          error.stack)
      }
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
  public reset (): void {
    // Присваиваем значению data дефолтный конфиг.
    ConfigManager.data = this.returnDefaultConfig()
    return this.overwrite() // Перезаписываем файл.
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
        // Если нет - добавляем новое значение, дефолтное.
        data[key] = configSchema[key].default
      }
    }

    // Проверка двух объектов, если объекты равны - перезапись не делается.
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
