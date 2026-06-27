import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Button from '../ui/Button'
import { instagramHandle, instagramUrl } from '../../data/contactDetails'

const ELFSIGHT_SCRIPT_SRC = 'https://elfsightcdn.com/platform.js'
const ELFSIGHT_WIDGET_CLASS = 'elfsight-app-bb4e42b0-45ce-4f6d-83bc-f20cec888b2a'
const ELFSIGHT_SCRIPT_ID = 'elfsight-platform-script'

function ensureElfsightScript() {
  const existingScript = document.querySelector(`script[src="${ELFSIGHT_SCRIPT_SRC}"]`)

  if (existingScript) {
    return existingScript
  }

  const script = document.createElement('script')
  script.id = ELFSIGHT_SCRIPT_ID
  script.src = ELFSIGHT_SCRIPT_SRC
  script.async = true
  document.body.appendChild(script)

  return script
}

function InstagramFallback() {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[1.5rem] border border-[rgba(190,151,83,0.42)] bg-black/70 px-6 py-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.3)] sm:px-8"
      initial={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <div className="mx-auto grid size-14 place-items-center rounded-full border border-[rgba(190,151,83,0.58)] bg-[rgba(190,151,83,0.1)] text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">
        IG
      </div>
      <h3 className="mt-6 font-serif text-3xl leading-tight text-white">
        Follow Us on Instagram
      </h3>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--color-muted)] sm:text-base">
        Visit our Instagram page to see our latest collections.
      </p>
      <Button
        className="mt-7"
        href={instagramUrl}
        rel="noreferrer"
        target="_blank"
        variant="primary"
      >
        Follow on Instagram
      </Button>
    </motion.div>
  )
}

function InstagramFeed() {
  const widgetRef = useRef(null)
  const [hasFailed, setHasFailed] = useState(false)

  useEffect(() => {
    let isMounted = true
    const script = ensureElfsightScript()

    const markFailedIfEmpty = window.setTimeout(() => {
      if (!isMounted) return

      const widgetHasRendered = Boolean(widgetRef.current?.children.length)
      if (!widgetHasRendered) {
        setHasFailed(true)
      }
    }, 9000)

    const handleScriptError = () => {
      if (isMounted) setHasFailed(true)
    }

    script.addEventListener('error', handleScriptError)

    return () => {
      isMounted = false
      window.clearTimeout(markFailedIfEmpty)
      script.removeEventListener('error', handleScriptError)
    }
  }, [])

  if (hasFailed) {
    return <InstagramFallback />
  }

  return (
    <motion.div
      className="overflow-hidden rounded-[1.75rem] border border-[rgba(190,151,83,0.36)] bg-black p-3 shadow-[0_24px_80px_rgba(0,0,0,0.3)] sm:p-4"
      initial={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      viewport={{ once: true, amount: 0.22 }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <div className="rounded-[1.25rem] border border-white/10 bg-[rgba(255,255,255,0.035)] p-3 sm:p-4">
        <div className="mb-4 flex flex-col gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="break-all text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">
            {instagramHandle}
          </p>
          <p className="text-xs uppercase tracking-[0.18em] text-white/42">Latest Instagram Posts</p>
        </div>
        <div
          className={ELFSIGHT_WIDGET_CLASS}
          data-elfsight-app-lazy
          ref={widgetRef}
        />
      </div>
    </motion.div>
  )
}

export default InstagramFeed
