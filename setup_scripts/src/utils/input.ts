import { createInterface } from 'readline'

/**
 * Задать вопрос в консоли.
 * @param question
 * @returns { Promise<string> }
 */
function input (question: string): Promise<string> {
  return new Promise(resolve => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    })
    rl.question(question, answer => {
      rl.close()
      resolve(answer)
    })
  })
}

export default input
