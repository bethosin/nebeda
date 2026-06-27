import { getStoredUser } from '../../services/userAuthService'

function AccountTopbar() {
  const user = getStoredUser()

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-gold)]">
        Customer Dashboard
      </p>
      <h1 className="mt-3 font-serif text-3xl text-white sm:text-4xl">
        Welcome{user?.fullName ? `, ${user.fullName}` : ''}
      </h1>
    </div>
  )
}

export default AccountTopbar
