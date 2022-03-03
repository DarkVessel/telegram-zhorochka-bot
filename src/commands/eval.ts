import ConfigManager from "../classes/ConfigManager";
import Command from "../handlers/Command";
import { inspect } from "util";
import { Markup } from "telegraf";
import bot from "../telegramClient";

class Eval extends Command {
  constructor() {
    super({
      name: "eval",
      async run(ctx) {
        if (!ConfigManager.data.bot_owner) return ctx.reply("Неа.");
        if (ConfigManager.data.bot_owner !== ctx.message?.from?.id)
          return ctx.reply("Неа, ты не создатель бота.");

        try {
          // @ts-ignore
          const evaled = eval(ctx.message.text.slice(5));
          const formatEvaled = inspect(evaled, { depth: 0, maxArrayLength: 50 })
            .replace(<string>process.env.BOT_TOKEN, "Не в этот раз.");

          //let button: any;
          // if (evaled instanceof Promise) {
          //   button = Markup.keyboard([Markup.button.callback('Открыть Промиз?', 'open_promise')]).oneTime().resize();
          // }

          await ctx.reply("```\n" + formatEvaled + "\n```", { parse_mode: "Markdown" });
          // bot.hears("Открыть Промиз?", async(ctx) => {
          //     const openPromise = await evaled;
          //     const formatEvaled = inspect(openPromise, { depth: 0, maxArrayLength: 50 })
          //       .replace(<string>process.env.BOT_TOKEN, "Не в этот раз.");

              
          //     //bot.telegram.editMessageText(message.from?.id, "вввв", { parse_mode: "Markdown" })
          //     //.catch(console.error)
          //   })
        } catch (error) {
          ctx.reply("```\n" + error.stack + "\n```", { parse_mode: "Markdown" })
            .catch(console.error);
        }
      },
    });
  }
}
export = Eval;
