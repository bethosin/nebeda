function SectionTitle({ eyebrow, title, text, align = 'center' }) {
  const alignment = align === 'left' ? 'items-start text-left' : 'items-center text-center'

  return (
    <div className={`flex max-w-3xl flex-col gap-4 ${alignment}`}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--color-gold)]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-serif text-3xl leading-tight text-white md:text-5xl">{title}</h2>
      {text ? <p className="text-base leading-8 text-[var(--color-muted)]">{text}</p> : null}
    </div>
  )
}

export default SectionTitle
