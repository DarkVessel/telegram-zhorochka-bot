// import { connect } from "mongoose";

// const client = 0

// connect(<string>process.env.MONGODB_URL).then(() => {
//     client.start);
// }).catch(err => {
//     console.error('Произошла ошибка при подключении к MongoDB базе.');
//     throw err;
// });

// Инициализируем класс LogManager.
// Он отвечает за красивое оформление текста в консоли, а также отправку ошибок в группу Телеграмма.
import LogManager from './classes/LogManager'

// Класс клиента, в нём хранится всё самое нужное.
import TelegramClient from './classes/TelegramClient'

// Создаём экземпляр Телеграмм Клиента и передаём ему токен.
const bot = new TelegramClient(<string>process.env.BOT_TOKEN)

bot.launch().then(() => {
  // Этот блок кода выполняется после того, как бот вышел в сеть.

  // Сообщаем LogManager'y о том, что бот залогинился и передаём ему экземпляр.
  LogManager.telegramClient = bot

  // Создаём экземпляр LogManager'a
  const logmanager = new LogManager('./src/telegramClient.ts')
  logmanager.log('CLIENT', 'Login!')

  // Вызываем в боте функцию старта обработчиков.
  // Проверьте classes/TelegramClient.ts чтобы понять, о чём я.
  bot.startHandlers()
}).catch(err => {
  throw err
})

export default bot
