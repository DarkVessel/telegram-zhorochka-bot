const getRandomElement = <T>(arr: Array<T>): T =>
  arr[Math.floor(Math.random() * arr.length)]

export default getRandomElement
