/**
 * Получаем аргументы с /команды
 * @example ```js
 * getArgs('/cmd User Reason Arg3'); // ["User", "Reason", "Arg3"]
 * ```
 * @param text Текст
 * @returns { Array<string> }
 */
function getArgs (text: string | undefined): Array<string> {
  // Получаем аргументы после команды.
  const args = String(text)
    .trim() // Удаляем пробелы по бокам.
    .split(' ')
    .filter(s => s !== '') // Удаляем пустые аргументы.

  args.shift() // УДаляем из аргументов /команду
  return args
}

export default getArgs
