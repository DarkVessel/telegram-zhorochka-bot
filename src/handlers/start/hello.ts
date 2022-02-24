const client = require("../../telegramClient")
module.exports = (ctx) => {
    ctx.reply("Hi!");
    client.telegram.sendMessage(-787598822, "test")
}