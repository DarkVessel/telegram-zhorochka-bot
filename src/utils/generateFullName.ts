/**
 * Генерирует полное имя.
 * @param firstName ctx.from.first_name
 * @param lastName ctx.from.last_name
 * @example ```js
 * generateFullName('Жора') // Жора
 * generateFullName('Жора', 'Змейкин') // Жора Змейкин
 * ```
 * @returns { string }
 */
function generateFullName (firstName: string | undefined, lastName: string | undefined): string {
  let fullName = ''
  if (firstName) fullName += firstName + ' '
  if (lastName) fullName += lastName

  return fullName.trim()
}

export default generateFullName
