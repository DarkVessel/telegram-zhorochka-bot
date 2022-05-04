/* eslint-disable no-redeclare */
import { ReplyMessage } from 'grammy/out/platform.node'
import CommandContext from '../types/CommandContext'
import { Context } from 'grammy'

import generateFullName from './generateFullName'

interface Data {
  username?: string | undefined,
  userId: number | string | undefined,
  firstName: string | undefined,
  lastName: string | undefined
}
type CmdContext = CommandContext<Context> | ReplyMessage

/**
 * Генерирует или @упоминание к пользователю или fullName пользователя и гиперссылку на его профиль.
 * @param param Либо Context, либо объект состоящий из username, userId, firstName и lastName.
 */
function generateHTMLUserHyperlink (param: CmdContext | Context): string
function generateHTMLUserHyperlink (param: Data): string
function generateHTMLUserHyperlink (param: CmdContext | Data | Context): string {
  let username: string | undefined

  // Получаем username.
  if ('username' in param) username = param.username
  else username = (param as CmdContext).from?.username

  // Если есть username у пользователя, возвращаем @username
  if (username) return '@' + username // Возвращаем @упоминание.

  let userId: number | string | undefined
  let firstName: string | undefined
  let lastName: string | undefined

  if ('userId' in param) userId = param.userId
  else userId = param.from?.id

  if ('firstName' in param) firstName = param.firstName
  else firstName = param.from?.first_name

  if ('lastName' in param) lastName = param.lastName
  else lastName = param.from?.last_name

  // Генерируем гиперссылку на профиль пользователя.
  return `<a href="tg://user?id=${userId}">${generateFullName(firstName, lastName)}</a>`
}

export default generateHTMLUserHyperlink
