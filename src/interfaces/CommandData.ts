import DialogManager from '../classes/DialogManager'
import CommandContext from '../types/CommandContext'
import { Context } from 'grammy'

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
    run(ctx: CommandContext<Context>, args: Array<string>, extra: { dialogManager: DialogManager }): void | Promise<any>
}

export default CommandData
