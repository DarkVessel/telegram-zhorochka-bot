// import { connect } from "mongoose";

// const client = 0

// connect(<string>process.env.MONGODB_URL).then(() => {
//     client.start);
// }).catch(err => {
//     console.error('Произошла ошибка при подключении к MongoDB базе.');
//     throw err;
// });

import TelegramClient from "./classes/TelegramClient";

const bot = new TelegramClient(process.env.BOT_TOKEN);
bot.launch().then(() => {
    console.log("[CLIENT] Login!");
    bot.loadEvents();
});
// bot.start((ctx) => ctx.reply('Welcome'))
// bot.help((ctx) => ctx.reply('Send me a sticker'))
// bot.on('message', console.log);
// bot.hears('hi', (ctx) => ctx.reply('Hey there'))


module.exports = bot;