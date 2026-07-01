import { useState } from 'react'

function PasswordField({ error, label, name, onChange, value, autoComplete = 'current-password' }) {
  const [visible, setVisible] = useState(false)

  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-gold)]">{label}</span>
      <span className="relative mt-3 block">
        <input
          autoComplete={autoComplete}
          className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 pr-20 text-white outline-none focus:border-[var(--color-gold)]"
          name={name}
          onChange={onChange}
          type={visible ? 'text' : 'password'}
          value={value}
        />
        <button
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          className="absolute inset-y-0 right-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)]"
          onClick={() => setVisible((current) => !current)}
          type="button"
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </span>
      {error ? <p className="mt-2 text-sm text-[var(--color-gold-light)]">{error}</p> : null}
    </label>
  )
}

export default PasswordField
