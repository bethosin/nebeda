import { useCallback, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ToastContext } from './toastContext'

const styles = {
  success: 'border-[rgba(190,151,83,0.72)] bg-black text-[var(--color-cream)]',
  error: 'border-red-400/50 bg-black text-red-100',
  warning: 'border-yellow-500/60 bg-black text-yellow-50',
  info: 'border-white/20 bg-black text-white',
}

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    ({ message, title, type = 'info', duration = 4200 }) => {
      const id = crypto.randomUUID()
      setToasts((current) => [...current, { id, message, title, type }])
      window.setTimeout(() => removeToast(id), duration)
      return id
    },
    [removeToast]
  )

  const value = useMemo(() => ({ removeToast, showToast }), [removeToast, showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className={[
                'pointer-events-auto rounded-2xl border px-5 py-4 shadow-[0_24px_70px_rgba(0,0,0,0.42)] backdrop-blur-xl',
                styles[toast.type] || styles.info,
              ].join(' ')}
              exit={{ opacity: 0, y: -12 }}
              initial={{ opacity: 0, y: -12 }}
              key={toast.id}
              layout
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  {toast.title ? (
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">
                      {toast.title}
                    </p>
                  ) : null}
                  <p className="text-sm leading-relaxed">{toast.message}</p>
                </div>
                <button
                  aria-label="Dismiss notification"
                  className="shrink-0 text-lg leading-none text-white/50 transition hover:text-[var(--color-gold)]"
                  onClick={() => removeToast(toast.id)}
                  type="button"
                >
                  ×
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export { ToastProvider }
