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
  const fromPath = location.pathname

  const type = getNavigationType(fromPath, toPath)

  event.intercept({
    scroll: 'manual',

    async handler() {
      const fragmentUrl = useTvFragment(event)
        ? '/fragments/TvDetails'
        : '/fragments/MovieDetails'

      const id = getPathId(toPath)

      const response = await fetch(`${fragmentUrl}/${id}`)
      const data = await response.text()

      // SIMPLE SAFE SWAP (old stable way)
      if (!document.startViewTransition) {
        updateTheDOMSomehow(data)
        return
      }

      document.startViewTransition(() => {
        updateTheDOMSomehow(data)

        const container = document.getElementById('container')
        if (container) container.scrollTop = 0
      })
    },
  })
})
