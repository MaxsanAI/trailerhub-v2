import {
  getNavigationType,
  getPathId,
  isBackNavigation,
  shouldNotIntercept,
  useTvFragment,
} from './utils'

function shouldDisableSpa() {
  return false
}

/* =========================
   NAVIGATION INTERCEPT
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
      handleTransition(event, {
        id: getPathId(toPath),
        from: 'list',
      })
      break

    case 'movie-to-home':
    case 'show-to-tv':
      handleTransition(event, {
        id: getPathId(fromPath),
        from: 'detail',
      })
      break

    case 'movie-to-person':
    case 'person-to-movie':
      handleTransition(event, {
        id: getPathId(toPath),
        from: 'mixed',
      })
      break

    default:
      return
  }
})

/* =========================
   CORE SAFE TRANSITION
========================= */

async function handleTransition(event, { id, from }) {
  event.intercept({
    scroll: 'manual',

    async handler() {
      const fragmentUrl = useTvFragment(event)
        ? resolveTv(from)
        : resolveMovie(from, id)

      const response = await fetch(fragmentUrl)
      const html = await response.text()

      if (!document.startViewTransition) {
        safeRender(html)
        return
      }

      await document.startViewTransition(() => {
        requestAnimationFrame(() => {
          safeRender(html)
          resetScroll()
          cleanupAlpine()
        })
      }).finished
    },
  })
}

/* =========================
   SAFE DOM REPLACE (KEY FIX)
========================= */

function safeRender(htmlString) {
  const container = document.getElementById('container')
  if (!container) return

  const parsed = new DOMParser().parseFromString(htmlString, 'text/html')
  const newContainer = parsed.querySelector('#container')

  if (!newContainer) return

  // HARD CLEAN REPLACE (no innerHTML bugs)
  container.replaceChildren(...newContainer.childNodes)
}

/* =========================
   CLEANUP HELPERS
========================= */

function resetScroll() {
  document.getElementById('container')?.scrollTo(0, 0)
}

/* Alpine cleanup to prevent state bleed */
function cleanupAlpine() {
  document.querySelectorAll('[x-data]').forEach((el) => {
    try {
      el.__x = null
    } catch (e) {}
  })
}

/* =========================
   FRAGMENT RESOLVERS
========================= */

function resolveMovie(from, id) {
  if (from === 'list') {
    return `/fragments/MovieDetails/${id}`
  }
  return `/fragments/MovieList`
}

function resolveTv(from) {
  if (from === 'list') {
    return `/fragments/TvDetails`
  }
  return `/fragments/TvList`
}
