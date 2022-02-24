import { Message } from "telegraf/typings/core/types/typegram";

interface CommandData {
    name: string, // Название команды
    /**
     * Функция, вызывающаяся при прописывании команды.
     * @param ctx - Экземпляр сообщения.
     */
    run(message: Message): void | Promise<any>
};

export = CommandData;