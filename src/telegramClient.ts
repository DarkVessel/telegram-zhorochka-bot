// import { connect } from "mongoose";

// const client = 0

// connect(<string>process.env.MONGODB_URL).then(() => {
//     client.start);
// }).catch(err => {
//     console.error('Произошла ошибка при подключении к MongoDB базе.');
//     throw err;
// });

import LogManager from './classes/LogManager'
import TelegramClient from './classes/TelegramClient'

const bot = new TelegramClient(<string>process.env.BOT_TOKEN)
bot.launch().then(() => {
  const logmanager = new LogManager('./src/telegramClient.ts')
  logmanager.log('CLIENT', 'Login!')

  bot.startHandlers()
}).catch(err => {
  throw err
})

export default bot
