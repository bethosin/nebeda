import { NavLink, useNavigate } from 'react-router-dom'
import { useToast } from '../ui/toastContext'
import { logoutUser } from '../../services/userAuthService'

const links = [
  { label: 'Overview', to: '/account' },
  { label: 'My Orders', to: '/account/orders' },
  { label: 'Custom Orders', to: '/account/custom-orders' },
  { label: 'Profile', to: '/account/profile' },
  { label: 'Security', to: '/account/security' },
  { label: 'Shop', to: '/shop' },
]

function linkClass({ isActive }) {
  return [
    'rounded-2xl border px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] transition',
    isActive
      ? 'border-[rgba(190,151,83,0.58)] bg-[rgba(190,151,83,0.12)] text-[var(--color-gold)]'
      : 'border-white/10 bg-white/[0.03] text-white/70 hover:border-[rgba(190,151,83,0.5)] hover:text-[var(--color-gold)]',
  ].join(' ')
}

function AccountSidebar({ onNavigate }) {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const logout = () => {
    logoutUser()
    showToast({ message: 'Logged out successfully.', type: 'success' })
    navigate('/', { replace: true })
  }

  return (
    <aside className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 lg:sticky lg:top-28">
      <p className="px-2 font-serif text-2xl text-white">My Nebeda</p>
      <nav className="mt-5 grid gap-2">
        {links.map((link) => (
          <NavLink className={linkClass} end={link.to === '/account'} key={link.to} onClick={onNavigate} to={link.to}>
            {link.label}
          </NavLink>
        ))}
        <button
          className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-white/70 transition hover:border-[rgba(190,151,83,0.5)] hover:text-[var(--color-gold)]"
          onClick={logout}
          type="button"
        >
          Logout
        </button>
      </nav>
    </aside>
  )
}

export default AccountSidebar
