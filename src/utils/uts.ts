const locale = (num) => parseInt(num).toLocaleString().replace(/,/g, '')
/**
 * Функция для выставления правильного окончания словам с числами.
 * Пример: 2 => 2 секунды.
 * @param { Number } UT - Число.
 * @param { String[]|String } pack - Массив из трёх элементов которые будут ставится после числа. Первый элемент массива это то что будет выводиться при числе 1, второй элемент при числе 2, а третий массив то что будет выводиться при числе больше 5.
 * @param { Boolean } localeUT - Включить ли разделение чисел ( locale.js );
 * @example uts(1, ["секунда", "секунды", "секунд"]); // 1 секунда
 * @example uts(2, ["секунда", "секунды", "секунд"]); // 5 секунды
 * @example uts(5, ["секунда", "секунды", "секунд"]); // 5 секунд
 * @returns { String }
 */
function uts (UT: number, pack: Array<string>, localeUT?: boolean) {
  let index = 2
  if (`${UT}`.split('').reverse()[1] === '1') return `${UT} ${pack[2]}`
  if (`${UT}`.split('').reverse()[0] === '1') return `${UT} ${pack[0]}`
  if (+`${UT}`.split('').reverse()[0] >= 2 && +`${UT}`.split('').reverse()[0] <= 4) index = 1
  return `${localeUT ? locale(UT) : UT} ${pack[index]}`
}

export default uts
