import { existsSync, readFileSync, writeFileSync } from "fs";
import configSchema from "../configSchema";
import ConfigJSON from "../interfaces/ConfigJSON";
import LogManager from "./LogManager";

const logmanager = new LogManager("./src/classes/ConfigManager.ts");
class ConfigManager {
  static data: ConfigJSON = {};
  static initialized = false; // Определяет, инициализирован ли конфиг.

  constructor() {
    if (ConfigManager.initialized) return;
    ConfigManager.initialized = true;

    if (!existsSync("./src/config.json")) {
      writeFileSync("./src/config.json", "{}");
    };

    this.reread()
    this.rereadSchema();
  }
  /**
   * Перезаписать файл конфига.
   * @returns { void }
   */
   overwrite(): void {
    try {
      // Записываем файл.
      writeFileSync(
        "./src/config.json",
        JSON.stringify(ConfigManager.data, null, 4)
      );
    } catch (err) {
      logmanager.error(
        "CONFIG_MANAGER",
        "Произошла ошибка при попытке записать данные в `config.json`\n",
        err.stack
      );
    }
  }

  /**
   * Перечитать файл конфига.
   * @returns { ConfigJSON }
   */
  reread(): ConfigJSON {
    try {
      // Читаем файл.
      const data = readFileSync("./src/config.json");
      ConfigManager.data = JSON.parse(data.toString());
    } catch (error) {
      // Сообщаем об ошибке.
      logmanager.error(
        "CONFIG_MANAGER",
        "Произошла ошибка при попытке прочитать `config.json`\nСброс конфига!\n",
        error.stack
      );
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
  reset(): void {
    ConfigManager.data = this.returnDefaultConfig();
    return this.overwrite(); // Переписать конфиг.
  }

  /**
   * Перечитать схему и дополнить `config.json`
   * @returns { Promise<void> }
   */
  rereadSchema(): void | Promise<void> {
    const data = {};
    // Читаем ключи со схемы.
    for (const key in configSchema) {
      // Проверяем, есть ли в конфиге этот ключ.
      if (ConfigManager.data[key]) {
        data[key] = ConfigManager.data[key];
      } else if (configSchema[key].default !== undefined) {
        // Если нет - добавляем.
        data[key] = configSchema[key].default;
      }
    }

    // Проверка двух объектов.
    const dataKeys = Object.keys(data);
    const dataKeys2 = Object.keys(ConfigManager.data);

    if (dataKeys.length == dataKeys2.length) {
      dataKeys.sort();
      dataKeys2.sort();

      if (dataKeys.join(",") === dataKeys2.join(",")) return;
    }

    // Переписываем конфиг.
    ConfigManager.data = data;
    return this.overwrite();
  }
}

export default ConfigManager;
