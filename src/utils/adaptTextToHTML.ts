/**
 * Адаптирует текст под HTML-разметку, например заменяя символы "<" и ">" на "&lt;" и "&gt;"
 */
function adaptTextToHTML (text: string): string {
  return text.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export default adaptTextToHTML
