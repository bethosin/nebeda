function AccountCard({ label, value, text }) {
  return (
    <article className="rounded-[1.35rem] border border-white/10 bg-white/[0.045] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.24)]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-gold)]">
        {label}
      </p>
      <p className="mt-3 font-serif text-3xl text-white">{value}</p>
      {text ? <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{text}</p> : null}
    </article>
  )
}

export default AccountCard
