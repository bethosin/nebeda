import { useEffect, useState } from 'react'
import Button from '../../components/ui/Button'
import AccountLayout from '../../components/account/AccountLayout'
import { getMyOrders } from '../../services/accountService'
import formatOrderReference from '../../utils/orderReference'

function formatAmount(value, currency = 'GBP') {
  return new Intl.NumberFormat(currency === 'EUR' ? 'en-IE' : 'en-GB', {
    style: 'currency',
    currency: currency === 'EUR' ? 'EUR' : 'GBP',
  }).format(Number(value || 0))
}

function formatDate(value) {
  return value ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(value)) : 'Not set'
}

function MyOrders() {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getMyOrders()
      .then((data) => { if (active) setOrders(data.orders || []) })
      .catch((apiError) => { if (active) setError(apiError.message || 'Unable to load your orders.') })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [])

  return (
    <AccountLayout>
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-gold)]">My Orders</p>
        <h1 className="mt-3 font-serif text-4xl text-white">Orders and Delivery</h1>
      </section>
      {isLoading ? <p className="text-[var(--color-muted)]">Loading your orders...</p> : null}
      {error ? <p className="rounded-2xl border border-red-300/25 bg-red-950/20 px-5 py-4 text-sm text-red-100">{error}</p> : null}
      {!isLoading && !orders.length ? (
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-8 text-center">
          <h2 className="font-serif text-3xl">No orders yet</h2>
          <p className="mt-4 text-[var(--color-muted)]">Your purchases and delivery updates will appear here.</p>
          <Button className="mt-7" to="/shop">Continue Shopping</Button>
        </div>
      ) : null}
      <div className="grid gap-5">
        {orders.map((order) => (
          <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-5 sm:p-7" key={order._id}>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-gold)]">{formatOrderReference(order._id)}</p>
                <h2 className="mt-3 font-serif text-2xl">{formatDate(order.createdAt)}</h2>
                <p className="mt-2 text-sm text-[var(--color-muted)]">{order.items?.length || 0} item(s) · {order.orderStatus} · Payment {order.paymentStatus}</p>
                {order.shipping?.trackingNumber ? <p className="mt-2 break-all text-xs text-[var(--color-gold)]">Tracking: {order.shipping.trackingNumber}</p> : null}
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <p className="text-lg font-semibold text-[var(--color-gold)]">{formatAmount(order.totals?.total, order.currency)}</p>
                <Button to={`/account/orders/${order._id}`} variant="outline">View Details</Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </AccountLayout>
  )
}

export default MyOrders
