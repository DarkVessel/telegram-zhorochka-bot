// import { connect } from "mongoose";

// const client = 0

// connect(<string>process.env.MONGODB_URL).then(() => {
//     client.start);
// }).catch(err => {
//     console.error('Произошла ошибка при подключении к MongoDB базе.');
//     throw err;
// });

import ConfigManager from "./classes/ConfigManager";
import LogManager from "./classes/LogManager";
import TelegramClient from "./classes/TelegramClient";

const bot = new TelegramClient(<string>process.env.BOT_TOKEN);
new ConfigManager();
bot.launch().then(() => {
    const logmanager = new LogManager("./src/telegramClient.ts");
    logmanager.log("CLIENT", "Login!");

    bot.loadEvents();
    bot.loadCommands();
}).catch(err => {
    throw err;
})
// bot.start((ctx) => ctx.reply('Welcome'))
// bot.help((ctx) => ctx.reply('Send me a sticker'))
// bot.on('message', console.log);
// bot.hears('hi', (ctx) => ctx.reply('Hey there'))


export default bot;