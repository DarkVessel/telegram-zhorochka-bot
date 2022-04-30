import { Context } from 'telegraf'
import { Update } from 'telegraf/typings/core/types/typegram'

/**
 * Интерфейс для команд.
 */
interface CommandData {
    readonly name: string, // Название команды
    readonly checkOwner: boolean, // Команда будет доступна только создателям бота. 
    readonly checkAdmin: boolean, // ...Для админов.
    readonly checkMeAdmin: boolean, // Проверка, чтобы бот был админом.
    readonly allowUseInDM: boolean, // Разрешение на использование команды в ЛС.
    disable?: boolean, // Значение true сделает команду недоступной.
    /**
     * Функция, вызывающаяся при прописывании команды.
     * @param ctx - Экземпляр сообщения.
     * @param args - Массив аргументов.
     */
    run(ctx: Context<Update>, args: Array<string>): void | Promise<any>
}

export default CommandData;
