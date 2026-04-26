import {
  getNavigationType,
  getPathId,
  isBackNavigation,
  shouldNotIntercept,
  updateTheDOMSomehow,
  useTvFragment,
} from './utils'

// Keep SPA enabled
function shouldDisableSpa() {
  return false
}

navigation.addEventListener('navigate', (navigateEvent) => {
  if (shouldDisableSpa()) return
  if (shouldNotIntercept(navigateEvent)) return

  const toUrl = new URL(navigateEvent.destination.url)
  const toPath = toUrl.pathname
  const fromPath = location.pathname

  const navigationType = getNavigationType(fromPath, toPath)

  if (location.origin !== toUrl.origin) return

  switch (navigationType) {
    case 'home-to-movie':
    case 'tv-to-show':
      handleHomeToMovieTransition(navigateEvent, getPathId(toPath))
      break

    case 'movie-to-home':
    case 'show-to-tv':
      handleMovieToHomeTransition(navigateEvent, getPathId(fromPath))
      break

    case 'movie-to-person':
      handleMovieToPersonTransition(
        navigateEvent,
        getPathId(fromPath),
        getPathId(toPath)
      )
      break

    case 'person-to-movie':
    case 'person-to-show':
      handlePersonToMovieTransition(
        navigateEvent,
        getPathId(fromPath),
        getPathId(toPath)
      )
      break

    default:
      return
  }
})

/* =========================
   HOME → MOVIE
========================= */

function handleHomeToMovieTransition(navigateEvent, movieId) {
  navigateEvent.intercept({
    async handler() {
      const fragmentUrl = useTvFragment(navigateEvent)
        ? '/fragments/TvDetails'
        : '/fragments/MovieDetails'

      const response = await fetch(`${fragmentUrl}/${movieId}`)
      const data = await response.text()

      if (!document.startViewTransition) {
        updateTheDOMSomehow(data)
        return
      }

      const thumbnail = document.getElementById(`movie-poster-${movieId}`)

      if (thumbnail) {
        thumbnail.style.viewTransitionName = 'movie-poster'
      }

      const transition = document.startViewTransition(() => {
        requestAnimationFrame(() => {
          updateTheDOMSomehow(data)

          document.getElementById('container')?.scrollTo(0, 0)

          if (thumbnail) {
            thumbnail.style.viewTransitionName = ''
          }
        })
      })

      await transition.finished
    },
  })
}

/* =========================
   MOVIE → HOME
========================= */

function handleMovieToHomeTransition(navigateEvent, movieId) {
  navigateEvent.intercept({
    scroll: 'manual',
    async handler() {
      const fragmentUrl = useTvFragment(navigateEvent)
        ? '/fragments/TvList'
        : '/fragments/MovieList'

      const response = await fetch(fragmentUrl)
      const data = await response.text()

      if (!document.startViewTransition) {
        updateTheDOMSomehow(data)
        return
      }

      const temp = document.createElement('div')
      temp.innerHTML = data

      const exists = temp.querySelector(`#movie-poster-${movieId}`)
      const moviePoster = document.getElementById(`movie-poster`)

      if (!exists && moviePoster) {
        moviePoster.classList.remove('movie-poster')
      }

      const transition = document.startViewTransition(() => {
        updateTheDOMSomehow(data)

        const thumbnail = document.getElementById(`movie-poster-${movieId}`)

        if (thumbnail) {
          setTimeout(() => {
            thumbnail.scrollIntoView({ block: 'center' })
          }, 0)

          thumbnail.style.viewTransitionName = 'movie-poster'
        }
      })

      await transition.finished
    },
  })
}

/* =========================
   MOVIE → PERSON
========================= */

function handleMovieToPersonTransition(navigateEvent, movieId, personId) {
  const isBack = isBackNavigation(navigateEvent)

  navigateEvent.intercept({
    async handler() {
      const response = await fetch(`/fragments/PersonDetails/${personId}`)
      const data = await response.text()

      if (!document.startViewTransition) {
        updateTheDOMSomehow(data)
        return
      }

      let personThumb

      if (!isBack) {
        personThumb = document.getElementById(`person-photo-${personId}`)
        if (personThumb) {
          personThumb.style.viewTransitionName = 'person-photo'
        }
      }

      const transition = document.startViewTransition(() => {
        requestAnimationFrame(() => {
          updateTheDOMSomehow(data)

          document.getElementById('container')?.scrollTo(0, 0)

          if (personThumb) {
            personThumb.style.viewTransitionName = ''
          }
        })
      })

      await transition.finished
    },
  })
}

/* =========================
   PERSON → MOVIE
========================= */

function handlePersonToMovieTransition(navigateEvent, personId, movieId) {
  const isBack = isBackNavigation(navigateEvent)

  navigateEvent.intercept({
    scroll: 'manual',
    async handler() {
      const fragmentUrl = useTvFragment(navigateEvent)
        ? '/fragments/TvDetails'
        : '/fragments/MovieDetails'

      const response = await fetch(`${fragmentUrl}/${movieId}`)
      const data = await response.text()

      if (!document.startViewTransition) {
        updateTheDOMSomehow(data)
        return
      }

      let movieThumb

      if (!isBack) {
        movieThumb = document.getElementById(`movie-poster-${movieId}`)
        if (movieThumb) {
          movieThumb.style.viewTransitionName = 'movie-poster'
        }
      }

      const transition = document.startViewTransition(() => {
        requestAnimationFrame(() => {
          updateTheDOMSomehow(data)

          document.getElementById('container')?.scrollTo(0, 0)

          if (movieThumb) {
            movieThumb.style.viewTransitionName = ''
          }
        })
      })

      await transition.finished
    },
  })
}
