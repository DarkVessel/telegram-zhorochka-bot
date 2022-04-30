import uts from './uts'

function duration (ms: number): string {
  const sec = Math.floor((ms / 1000) % 60)
  const min = Math.floor((ms / (1000 * 60)) % 60)
  const hrs = Math.floor((ms / (1000 * 60 * 60)) % 60)
  const days = Math.floor((ms / (1000 * 60 * 60 * 24)) % 60)

  const elements: Array<string> = []
  if (days) elements.push(uts(days, ['день', 'дня', 'дней']))
  if (hrs) elements.push(uts(hrs, ['час', 'часа', 'часов']))
  if (min) elements.push(uts(min, ['минуту', 'минуты', 'минут']))
  if (sec || !elements.length) elements.push(uts(sec, ['секунду', 'секунды', 'секунд']))

  if (elements.length >= 2) elements[elements.length - 1] = 'и ' + elements[elements.length - 1]
  return elements.join(' ')
}

export default duration
