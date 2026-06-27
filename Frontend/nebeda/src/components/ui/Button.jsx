import { Link } from 'react-router-dom'

const variants = {
  primary:
    'border border-[var(--color-gold)] bg-[var(--color-gold)] text-black shadow-[0_18px_45px_rgba(190,151,83,0.18)] hover:bg-[var(--color-gold-light)] hover:border-[var(--color-gold-light)]',
  outline:
    'border border-[rgba(190,151,83,0.72)] bg-transparent text-[var(--color-cream)] hover:border-[var(--color-gold)] hover:bg-[rgba(190,151,83,0.1)] hover:text-white',
  white:
    'border border-white bg-white text-black hover:border-[var(--color-cream)] hover:bg-[var(--color-cream)]',
}

function Button({
  children,
  variant = 'primary',
  to,
  href,
  className = '',
  type = 'button',
  ...props
}) {
  const classes = [
    'inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-gold)]',
    variants[variant],
    className,
  ].join(' ')

  if (to) {
    return (
      <Link className={classes} to={to} {...props}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a className={classes} href={href} {...props}>
        {children}
      </a>
    )
  }

  return (
    <button className={classes} type={type} {...props}>
      {children}
    </button>
  )
}

export default Button
