const bot = require("../telegramClient");

const hello = require("../handlers/start/hello");
bot.start(hello);