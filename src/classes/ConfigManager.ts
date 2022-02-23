import { readFile, writeFile } from 'fs';
import { promisify } from 'util';

import configSchema from '../configSchema';
import ConfigJSON from '../interfaces/ConfigJSON';

const readFilePromise = promisify(readFile);
const writeFilePromise = promisify(writeFile);

class ConfigManager {
  static data: ConfigJSON = {};

  /**
   * Перезаписать файл конфига.
   * @returns { Promise<void> }
   */
  async overwrite(): Promise<void> {
    try {
      // Записываем файл.
      await writeFilePromise('../../config.json', JSON.stringify(ConfigManager.data));
    } catch (err) {
      console.error('Произошла ошибка при попытке записать данные в `config.json`\n', err.stack);
    }
  }

  /**
   * Перечитать файл конфига.
   * @returns { Promise<ConfigJSON> }
   */
  async reread(): Promise<ConfigJSON> {
    try {
      // Читаем файл.
      const data = await readFilePromise('../config.json');
      ConfigManager.data = JSON.parse(data.toString());
    } catch (error) {
      // Сообщаем об ошибке.
      console.error('Произошла ошибка при попытке прочитать `config.json`\nСброс конфига!\n', error.stack);
      this.reset();
    }
    return ConfigManager.data;
  }

  /**
   * Вернуть дефолтный конфиг.
   * @returns { ConfigJSON }
   */
  returnDefaultConfig(): ConfigJSON {
    const config = {};
    for (const key in configSchema) {
      if (!Object.prototype.hasOwnProperty.call(configSchema, key)) continue;
      config[key] = configSchema[key].default;
    }

    return config;
  }

  /**
   * Перезаписывает файл `config.json` по дефолту.
   */
  reset(): Promise<void> {
    ConfigManager.data = this.returnDefaultConfig();
    return this.overwrite(); // Переписать конфиг.
  }

  /**
   * Перечитать схему и дополнить `config.json`
   * @returns { Promise<void> }
   */
  rereadSchema(): Promise<void> {
    const data = {};
    for (const key in configSchema) {
      if (ConfigManager.data[key]) {
        data[key] = ConfigManager.data[key];
      } else {
        ConfigManager.data[key] = configSchema[key].default;
      }
    }

    // Переписываем конфиг.
    ConfigManager.data = data;
    return this.overwrite();
  }
}

export default ConfigManager;