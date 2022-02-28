import Command from "../handlers/Command";

class Src extends Command {
  constructor() {
    super({
      name: "src",
      run(ctx) {
        // @ts-ignore
        const message = ctx.update.message.reply_to_message;
        if (!message) return ctx.reply("Вы не ответили на сообщение.");
        ctx.reply("```\n" + JSON.stringify(message, null, 2) + "\n```", {
          parse_mode: "Markdown",
        });
      },
    });
  }
}
export = Src;
