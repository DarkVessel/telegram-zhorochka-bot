import { relative } from "path";
import { Telegraf } from "telegraf";
import { existsSync, readdirSync, statSync } from "fs";

import CommandData from "../interfaces/CommandData";

interface UnloadedCommands {
  path: string,
  error: Error
}
class TelegramClient extends Telegraf {
  public commands: Map<string, CommandData>;
  public unloadedCommands: Array<UnloadedCommands>;

  public constructor(options) {
    super(options);

    this.commands = new Map();
    this.unloadedCommands = [];

    process.once("SIGINT", () => this.stop("SIGINT"));
    process.once("SIGTERM", () => this.stop("SIGTERM"));
  }

  /**
   * Загрузить ивенты.
   */
  public loadEvents() {
    // Получаем все ивенты.
    const files: string[] = readdirSync("./build/events/").filter((x) =>
      x.endsWith(".js")
    );

    // Загружаем их.
    console.log("[EVENTS] Загрузка ивентов.");
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        console.log(`[EVENTS] ${i + 1}. Загрузка ../events/${file}`);
        require(`../events/${file}`);
      } catch (err) {
        console.error(`Ошибка при загрузке ../events/"${file}"\n${err.stack}`);
      }
    }
    console.log("[EVENTS] Загрузка завершена!");
  }

  /**
   * Добавить команду в коллекцию.
   * @param path - Путь до команды, желательно глобальный.
   */
  public addCommand(path: string) {
    try {
      const command = require(path);

      // Проверить команды на их наличие
      const commandCheck = this.commands.has(command.info.name);
      if (commandCheck) {
        console.error(`Kоманда по пути \`${path}\` конфликтует уже с существующей командой \`${command.cmd.name}\`\nКоманда не загружена!`);
        return;
      }

      this.commands.set(command.info.name, command);
      this.command(command.info.name, command.run);
    } catch (error) {
      console.error(`При загрузке команды \`${path}\` произошла ошибка:\n`, error.stack);
      this.unloadedCommands.push({ path, error });
    }
  }

  private loadCommandsFromFolder(path: string): void {
    if (!existsSync(path)) return;

    // Файлы и папки.
    const filesAndFolders: string[] = readdirSync(path);

    // Файлы.
    const files = filesAndFolders
      .filter((f) => statSync(path + f).isFile()) // Отсортировать только по файлам.
      .filter((x) => x.endsWith(".js")); // Отсортировать файлы по окончанию .js

    // Папки.
    const folders = filesAndFolders.filter((f) => statSync(path + f).isDirectory()); // Отсортировать только по папкам.

    // Прооходимся по вложенным папкам.
    for (const folder of folders) {
      this.loadCommandsFromFolder(path + folder + "/");
    }

    // Загрузить команды.
    for (const file of files) {
      const pathRelative = relative("build/src/", path + `${file}`);
      console.log(`[COMMANDS] ${this.commands.size+1}. Загрузка ${pathRelative}`);
      this.addCommand(pathRelative);
    }
  }

  /**
   * Просканировать папку с командами и загрузить их.
   */
  public loadCommands() {
    this.commands.clear();
    this.unloadedCommands = [];

    this.loadCommandsFromFolder("./build/commands/");
    console.log("[COMMANDS] Загрузка завершена!");
    if (this.unloadedCommands.length) {
      console.log(`[COMMANDS] Не было загружено ${this.unloadedCommands.length} команд.`);
    }
  }
}

export default TelegramClient;
