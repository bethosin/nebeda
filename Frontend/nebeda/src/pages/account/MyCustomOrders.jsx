import { useEffect, useState } from 'react'
import AccountLayout from '../../components/account/AccountLayout'
import Button from '../../components/ui/Button'
import { getMyCustomOrders } from '../../services/accountService'

function formatDate(value) {
  if (!value) return 'Not set'
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(value))
}

function MyCustomOrders() {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    getMyCustomOrders()
      .then((data) => {
        if (isMounted) setOrders(data.orders || [])
      })
      .catch((apiError) => {
        if (isMounted) setError(apiError.message || 'Unable to load your custom orders.')
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
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-gold)]">
          Custom Orders
        </p>
        <h2 className="mt-3 font-serif text-4xl text-white">Bespoke Requests</h2>
      </section>
      {isLoading ? <p className="text-[var(--color-muted)]">Loading custom orders...</p> : null}
      {error ? <p className="rounded-2xl border border-[rgba(190,151,83,0.42)] bg-[rgba(190,151,83,0.1)] px-5 py-4 text-sm text-[var(--color-cream)]">{error}</p> : null}
      {!isLoading && !orders.length ? (
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-8 text-center">
          <h3 className="font-serif text-3xl text-white">No custom orders yet</h3>
          <p className="mt-4 text-[var(--color-muted)]">Start a bespoke request and track it here.</p>
          <Button className="mt-7" to="/custom-order" variant="primary">Start Custom Order</Button>
        </div>
      ) : null}
      <div className="grid gap-5">
        {orders.map((order) => (
          <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-5 sm:p-7" key={order._id}>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-gold)]">
                  {order.orderType} · {order.shipping?.shippingCountry}
                </p>
                <h3 className="mt-3 font-serif text-2xl text-white">{order.outfitType}</h3>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  {order.occasion || 'No occasion set'} · {order.orderStatus} · Payment {order.paymentStatus}
                </p>
                <p className="mt-2 text-xs text-white/45">{formatDate(order.createdAt)}</p>
              </div>
              <Button to={`/account/custom-orders/${order._id}`} variant="outline">View Details</Button>
            </div>
          </article>
        ))}
      </div>
    </AccountLayout>
  )
}

export default MyCustomOrders
