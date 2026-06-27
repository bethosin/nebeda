import { Navigate, useLocation } from 'react-router-dom'
import AccountSidebar from './AccountSidebar'
import AccountTopbar from './AccountTopbar'
import { isUserAuthenticated } from '../../services/userAuthService'

function AccountLayout({ children }) {
  const location = useLocation()

  if (!isUserAuthenticated()) {
    return <Navigate replace to={`/login?redirect=${encodeURIComponent(location.pathname)}`} />
  }

  return (
    <main className="bg-black px-5 py-12 text-white sm:px-8 lg:px-10 lg:py-16">
      <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[17rem_1fr] 2xl:max-w-[1500px]">
        <AccountSidebar />
        <div className="min-w-0 space-y-6">
          <AccountTopbar />
          {children}
        </div>
      </section>
    </main>
  )
}

export default AccountLayout
