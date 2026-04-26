import { shouldNotIntercept, updateTheDOMSomehow } from './utils'

navigation.addEventListener('navigate', (event) => {
  if (shouldNotIntercept(event)) return

  const url = new URL(event.destination.url)

  if (location.origin !== url.origin) return

  event.intercept({
    async handler() {
      const res = await fetch(url.pathname)
      const html = await res.text()

      if (!document.startViewTransition) {
       function updateTheDOMSomehow(htmlString) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlString, 'text/html')

  const newContent =
    doc.querySelector('#content') ||
    doc.querySelector('#container') ||
    doc.body

  const current = document.querySelector('#content') || document.querySelector('#container')

  if (current && newContent) {
    current.innerHTML = newContent.innerHTML
  }
}
