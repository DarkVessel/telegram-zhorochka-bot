import { Markup } from "telegraf";
import { button } from "telegraf/typings/markup";
import Command from "../handlers/Command";
import bot from "../telegramClient";

class Test extends Command {
  constructor() {
    super({
      name: "test",
      async run(ctx) {
        const markup = Markup.inlineKeyboard([Markup.button.callback('Открыть Промиз?', 'open_promise')]);
        ctx.reply("Promise<>?", markup);
        
        bot.action("open_promise", (ctx) => {
            ctx.answerCbQuery();
            ctx.editMessageText("Открыл!");
        })
      },
    });
  }
}
export = Test;