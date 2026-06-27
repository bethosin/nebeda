function AdminTopbar({ onMenuClick, subtitle = 'Connected admin area for Nebeda Threads.' }) {
  return (
    <header className="border-b border-white/10 bg-black/72 px-5 py-5 text-white backdrop-blur-xl sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <button
            aria-label="Open admin menu"
            className="mt-1 grid size-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white transition hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] lg:hidden"
            onClick={onMenuClick}
            type="button"
          >
            ☰
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-gold)]">
              Admin Dashboard
            </p>
            <h1 className="mt-2 font-serif text-2xl leading-tight text-white sm:text-3xl">
              Nebeda Threads Management
            </h1>
          </div>
        </div>
        <p className="max-w-md text-sm leading-6 text-[var(--color-muted)] sm:text-right">
          {subtitle}
        </p>
      </div>
    </header>
  )
}

export default AdminTopbar
