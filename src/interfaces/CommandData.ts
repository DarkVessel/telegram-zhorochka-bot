import { Context } from 'telegraf'
import { Update } from 'telegraf/typings/core/types/typegram'

interface CommandData {
    readonly name: string, // Название команды
    /**
     * Функция, вызывающаяся при прописывании команды.
     * @param ctx - Экземпляр сообщения.
     */
    run(ctx: Context<Update>): void | Promise<any>
}

export = CommandData;
