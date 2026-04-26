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
        updateTheDOMSomehow(html)
        return
      }

      document.startViewTransition(() => {
        updateTheDOMSomehow(html)
      })
    },
  })
})
