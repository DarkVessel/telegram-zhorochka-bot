import { relative } from "path";
import { Telegraf } from "telegraf";
import { existsSync, readdirSync, statSync } from "fs";

import CommandData from "../interfaces/CommandData";
import LogManager from "./LogManager";
import Command from "../handlers/Command";

const logmanager = new LogManager("./src/classes/TelegramClient.ts");
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
    logmanager.log("EVENTS", "Загрузка ивентов.");
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        logmanager.log("EVENTS", `${i + 1}. Загрузка ../events/${file}`);
        require(`../events/${file}`);
      } catch (err) {
        logmanager.error("COMMANDS", `Ошибка при загрузке ../events/"${file}"`, err.stack);
      }
    }
    logmanager.log("EVENTS", "Загрузка завершена!");
  }

  /**
   * Добавить команду в коллекцию.
   * @param path - Путь до команды, желательно глобальный.
   */
  public addCommand(path: string) {
    try {
      const Command = require(path);
      const command: Command = new Command();

      // Проверить команды на их наличие
      const commandCheck = this.commands.has(command.cmd.name);
      if (commandCheck) {
        logmanager.error("COMMANDS", `Kоманда по пути \`${path}\` конфликтует уже с существующей командой \`${command.cmd.name}\`\nКоманда не загружена!`);
        return;
      }

      this.commands.set(command.cmd.name, command.cmd);
      this.command(command.cmd.name, command.cmd.run);
    } catch (error) {
      logmanager.error("COMMANDS", `При загрузке команды \`${path}\` произошла ошибка:\n`, error.stack);
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
      logmanager.log("COMMANDS", `${this.commands.size+1}. Загрузка ${pathRelative}`);
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
    logmanager.log("COMMANDS", "Загрузка завершена!");
    if (this.unloadedCommands.length) {
      logmanager.log("COMMANDS", `Не было загружено ${this.unloadedCommands.length} команд.`);
    }
  }
}

export default TelegramClient;
