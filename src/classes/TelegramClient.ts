import { Telegraf } from "telegraf";
import { readdirSync } from "fs";

// import CommandData from '../interfaces/CommandData';
class TelegramClient extends Telegraf {
  // public commands: Map<string, CommandData>
  public constructor(options) {
    super(options);
    process.once("SIGINT", () => this.stop("SIGINT"));
    process.once("SIGTERM", () => this.stop("SIGTERM"));
  }

  /**
   * Загрузить ивенты.
   */
  public loadEvents() {
    // Получаем все ивенты.
    const files: string[] = readdirSync("./build/events/").filter((x) => x.endsWith(".js"));

    // Загружаем их.
    console.log("[EVENTS] Загрузка ивентов.");
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        console.log(`[EVENTS] ${i + 1}. Загрузка ../events/${file}`)
        require(`../events/${file}`);
      } catch (err) {
        console.error(`Ошибка при загрузке ../events/"${file}"\n${err.stack}`);
      }
    };
    console.log("[EVENTS] Загрузка завершена!");
  }
}

export default TelegramClient;
