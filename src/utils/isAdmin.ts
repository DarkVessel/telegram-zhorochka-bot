import { ChatMember } from 'grammy/out/platform.node'

/**
 * Проверяет, является ли пользователь админом.
 * @param arr Массив участников.
 * @param id id пользователя
 * @returns { boolean }
 */
const isAdmin = (arr: ChatMember[], id: string | number): boolean =>
  !!arr.find(c => c.user.id === id)

export default isAdmin
