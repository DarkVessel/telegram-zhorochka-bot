import { ChatMember, Message } from "telegraf/typings/core/types/typegram"

interface Extra {
    userAdmin?: ChatMember | undefined,
    msgBot?: Message.TextMessage,
    offenderHyperlink?: string,
    moderatorHyperlink?: string,
    warnsLength?: number
}

export default Extra
