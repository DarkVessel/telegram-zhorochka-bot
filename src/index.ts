console.log('[PROJECT] Start!')

require('dotenv').config()

if (!process.env.BOT_TOKEN) { throw new Error('Отсутствует значение "BOT_TOKEN" в .env файле.') }

// if (!process.env.MONGODB_URL)
//     throw new Error('Отсутствует значение "MONGODB_URL" в .env Файле.');

require('./telegramClient')
