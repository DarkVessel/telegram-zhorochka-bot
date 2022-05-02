interface Colors {
  [colorName: string]: string
}

const colors: Colors = {
  red: '1',
  yellow: '3',
  blue: '6',
  green: '40'
}

/**
 * Функция для окрашивания лога в определённый цвет.
 * Поддерживает переменную окружения NO_COLOR
 * @param color Название цвета из объекта Colors
 * @param text Содержимое лога
 * @returns { string }
 */
const colorTheText = (color: 'red' | 'yellow' | 'blue' | 'green', text: string | number | boolean): string => {
  if (process.env.NO_COLOR) return String(text)
  else return `\x1B[38;5;${colors[color] ?? 8}m\x1B[1m${text}\x1B[22m\x1B[39m`
}
export default colorTheText
