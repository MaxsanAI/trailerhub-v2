import {
  getNavigationType,
  getPathId,
  isBackNavigation,
  shouldNotIntercept,
  updateTheDOMSomehow,
  useTvFragment,
} from './utils'

function shouldDisableSpa() {
  return false
}

/* =========================
   NAVIGATION
========================= */

navigation.addEventListener('navigate', (event) => {
  if (shouldDisableSpa()) return
  if (shouldNotIntercept(event)) return

  const toUrl = new URL(event.destination.url)
  const toPath = toUrl.pathname
  const fromPath = location.pathname

  if (location.origin !== toUrl.origin) return

  const type = getNavigationType(fromPath, toPath)

  switch (type) {
    case 'home-to-movie':
    case 'tv-to-show':
    case 'movie-to-home':
    case 'show-to-tv':
    case 'movie-to-person':
    case 'person-to-movie':
    case 'person-to-show':
      handleTransition(event, toPath, fromPath)
      break
    default:
      return
  }
})

/* =========================
   SAFE TRANSITION (NO DOM BREAK)
========================= */

function handleTransition(event, toPath, fromPath) {
  event.intercept({
    scroll: 'manual',

    async handler() {
      const fragmentUrl = useTvFragment(event)
        ? '/fragments/TvDetails'
        : '/fragments/MovieDetails'

      const response = await fetch(fragmentUrl + getPathId(toPath))
      const data = await response.text()

      // fallback (no ViewTransition support)
      if (!document.startViewTransition) {
        updateTheDOMSomehow(data)
        return
      }

      document.startViewTransition(() => {
        updateTheDOMSomehow(data)

        // safe scroll reset
        const container = document.getElementById('container')
        if (container) container.scrollTop = 0
      })
    },
  })
}
