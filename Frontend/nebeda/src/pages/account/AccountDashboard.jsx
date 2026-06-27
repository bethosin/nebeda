import { useEffect, useState } from 'react'
import Button from '../../components/ui/Button'
import AccountCard from '../../components/account/AccountCard'
import AccountLayout from '../../components/account/AccountLayout'
import { getAccountDashboard } from '../../services/accountService'

function AccountDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    getAccountDashboard()
      .then((data) => {
        if (isMounted) setDashboard(data.dashboard)
      })
      .catch((apiError) => {
        if (isMounted) setError(apiError.message || 'Unable to load account dashboard.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <AccountLayout>
      {isLoading ? <p className="text-[var(--color-muted)]">Loading your account...</p> : null}
      {error ? <p className="rounded-2xl border border-[rgba(190,151,83,0.42)] bg-[rgba(190,151,83,0.1)] px-5 py-4 text-sm text-[var(--color-cream)]">{error}</p> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AccountCard label="Total Orders" value={dashboard?.totalOrders || 0} />
        <AccountCard label="Pending Orders" value={dashboard?.pendingOrders || 0} />
        <AccountCard label="Paid Orders" value={dashboard?.paidOrders || 0} />
        <AccountCard label="Custom Orders" value={dashboard?.totalCustomOrders || 0} />
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-gold)]">
            Latest Order
          </p>
          <h2 className="mt-3 font-serif text-2xl text-white">
            {dashboard?.latestOrder?.orderStatus || 'No checkout orders yet'}
          </h2>
          <p className="mt-3 break-all text-sm leading-7 text-[var(--color-muted)]">
            {dashboard?.latestOrder?._id || 'Your shop checkout orders will appear here.'}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-gold)]">
            Newsletter
          </p>
          <h2 className="mt-3 font-serif text-2xl text-white">
            {dashboard?.newsletterSubscribed ? 'Subscribed' : 'Not subscribed'}
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
            Newsletter status is based on your account email.
          </p>
        </article>
      </section>

      <section className="rounded-[1.5rem] border border-[rgba(190,151,83,0.38)] bg-[rgba(190,151,83,0.08)] p-6">
        <h2 className="font-serif text-3xl text-white">Quick Actions</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Button to="/shop" variant="primary">Shop Collection</Button>
          <Button to="/account/orders" variant="outline">View Orders</Button>
          <Button to="/custom-order" variant="outline">Start Custom Order</Button>
          <Button to="/account/profile" variant="outline">Edit Profile</Button>
        </div>
      </section>
    </AccountLayout>
  )
}

export default AccountDashboard
