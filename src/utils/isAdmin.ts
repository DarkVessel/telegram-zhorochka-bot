import { ChatMember } from 'telegraf/typings/core/types/typegram'
const isAdmin = (arr: ChatMember[], id: string | number): boolean =>
  !!arr.find(c => c.user.id === id)

export default isAdmin
