import { useEffect } from 'react'

let locks = 0
let savedY = 0

/**
 * Freezes page scroll while mounted. `overflow: hidden` on body is ignored by
 * iOS Safari, so the body is pinned with `position: fixed` at the current
 * offset and the scroll position is restored on release. Counted so nested
 * dialogs do not unlock each other.
 */
export function useScrollLock() {
  useEffect(() => {
    const { body, documentElement } = document
    if (locks++ === 0) {
      savedY = window.scrollY
      const gap = window.innerWidth - documentElement.clientWidth
      Object.assign(body.style, {
        position: 'fixed',
        top: `-${savedY}px`,
        left: '0',
        right: '0',
        overflow: 'hidden',
        paddingRight: gap > 0 ? `${gap}px` : '',
      })
    }
    return () => {
      if (--locks > 0) return
      for (const prop of ['position', 'top', 'left', 'right', 'overflow', 'paddingRight'] as const) body.style[prop] = ''
      window.scrollTo(0, savedY)
    }
  }, [])
}
