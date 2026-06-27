import { useEffect, useState } from 'react'

function FloatingScrollButton() {
  const [isAwayFromTop, setIsAwayFromTop] = useState(false)

  useEffect(() => {
    const updateScrollState = () => {
      setIsAwayFromTop(window.scrollY > window.innerHeight * 0.35)
    }

    const timer = window.setTimeout(updateScrollState, 0)
    window.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [])

  const handleScroll = () => {
    if (isAwayFromTop) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    window.scrollBy({ top: window.innerHeight * 0.9, behavior: 'smooth' })
  }

  return (
    <button
      aria-label={isAwayFromTop ? 'Scroll to top' : 'Scroll down'}
      className="fixed bottom-5 right-5 z-40 grid size-11 place-items-center rounded-full border border-[rgba(190,151,83,0.62)] bg-black/82 text-xl leading-none text-[var(--color-gold)] shadow-[0_18px_50px_rgba(0,0,0,0.42)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[var(--color-gold)] hover:bg-black sm:bottom-6 sm:right-6 sm:size-12"
      onClick={handleScroll}
      type="button"
    >
      <span className="block transition duration-300">{isAwayFromTop ? '\u2191' : '\u2193'}</span>
    </button>
  )
}

export default FloatingScrollButton
