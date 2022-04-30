interface Data {
  chatName: string | undefined,
  chatId: string | number | undefined,
  messageId: string | number,
}

function generateLinkToPost (params: Data): string | void {
  if (params.chatName) return `https://t.me/${params.chatName}/${params.messageId}`
  if (params.chatId) return `https://t.me/c/${String(params.chatId).slice(4)}/${params.messageId}`
}

export default generateLinkToPost
