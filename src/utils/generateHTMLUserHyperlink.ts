import generateFullName from './generateFullName'
interface DataUsername {
  username?: string | undefined,
  userId: number | string | undefined,
  firstName: string | undefined,
  lastName: string | undefined
}

function generateHTMLUserHyperlink (params: DataUsername): string {
  if (params.username) return '@' + params.username

  return `<a href="tg://user?id=${params.userId}">${generateFullName(params.firstName, params.lastName)}</a>`
}

export default generateHTMLUserHyperlink
