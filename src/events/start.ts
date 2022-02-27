import bot from "../telegramClient";

const hello = require("../handlers/start/hello");
bot.start(hello);
