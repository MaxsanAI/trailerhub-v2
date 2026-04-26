import {
  getNavigationType,
  getPathId,
  shouldNotIntercept,
  updateTheDOMSomehow,
  useTvFragment,
} from './utils'

navigation.addEventListener('navigate', (event) => {
  if (shouldNotIntercept(event)) return

  const toUrl = new URL(event.destination.url)

  if (location.origin !== toUrl.origin) return

  const toPath = toUrl.pathname

  event.intercept({
    scroll: 'manual',

    async handler() {
      const isTv = useTvFragment(event)
      const base = isTv ? '/fragments/TvDetails' : '/fragments/MovieDetails'

      const id = getPathId(toPath)

      const res = await fetch(`${base}/${id}`)
      const html = await res.text()

      if (!document.startViewTransition) {
        updateTheDOMSomehow(html)
        return
      }

      document.startViewTransition(() => {
        updateTheDOMSomehow(html)

        const container = document.getElementById('container')
        if (container) container.scrollTop = 0
      })
    },
  })
})
