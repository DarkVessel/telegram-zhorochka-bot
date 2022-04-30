import { Message } from "telegraf/typings/core/types/typegram"

interface Extra {
    msgBot?: Message.TextMessage,
    offenderHyperlink?: string,
    moderatorHyperlink?: string,
    summa: number
}

export default Extra
