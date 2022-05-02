// Инициализируем класс LogManager.
// Он отвечает за красивое оформление текста в консоли, а также отправку ошибок в чат Телеграмма.
import ConfigManager from './classes/ConfigManager'
import LogManager from './classes/LogManager'

// Класс клиента, в нём хранится всё самое нужное.
import TelegramClient from './classes/TelegramClient'

// Создаём экземпляр Телеграмм Клиента и передаём ему токен.
const bot = new TelegramClient(<string>process.env.BOT_TOKEN)

const configManager = new ConfigManager()
configManager.start().then(async () => {
  // Создаём экземпляр LogManager'a
  const logmanager = new LogManager('./src/telegramClient.ts')
  logmanager.log('CLIENT', 'Login...')

  // Сообщаем LogManager'y о том, что бот залогинился и передаём ему экземпляр.
  LogManager.telegramClient = bot
  LogManager.config = ConfigManager.data

  // Вызываем в боте функцию старта обработчиков.
  // Проверьте classes/TelegramClient.ts чтобы понять, о чём я.
  await bot.startHandlers()
  await bot.start()
  logmanager.log('CLIENT', 'Login!')
}).catch(err => {
  console.error('>>> Произошла ошибка при попытке бота залогиниться!')
  throw err
})

export default bot
