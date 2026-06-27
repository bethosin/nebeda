import { AnimatePresence, motion } from 'framer-motion'
import Button from '../ui/Button'

function ConfirmModal({
  confirmLabel,
  isOpen,
  isWorking,
  onCancel,
  onConfirm,
  text,
  title,
  tone = 'warning',
}) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[90] grid place-items-center px-4 py-8">
          <motion.button
            aria-label="Close confirmation modal"
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            type="button"
          />
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-lg rounded-[1.5rem] border border-[rgba(190,151,83,0.45)] bg-black p-6 text-white shadow-[0_30px_90px_rgba(0,0,0,0.58)] sm:p-8"
            exit={{ opacity: 0, scale: 0.98, y: 12 }}
            initial={{ opacity: 0, scale: 0.98, y: 12 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-gold)]">
              Confirm Action
            </p>
            <h3 className="mt-3 font-serif text-3xl text-white">{title}</h3>
            <p className="mt-4 text-sm leading-7 text-white/68">{text}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button disabled={isWorking} onClick={onCancel} variant="outline">
                Cancel
              </Button>
              <Button
                className={
                  tone === 'danger'
                    ? 'border-red-400 bg-red-400 text-black hover:border-red-300 hover:bg-red-300'
                    : ''
                }
                disabled={isWorking}
                onClick={onConfirm}
                variant={tone === 'danger' ? 'primary' : 'primary'}
              >
                {isWorking ? 'Processing...' : confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}

export default ConfirmModal
