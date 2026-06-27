import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import AccountLayout from '../../components/account/AccountLayout'
import OrderStatusTimeline from '../../components/account/OrderStatusTimeline'
import Button from '../../components/ui/Button'
import { getMyOrderById } from '../../services/accountService'

function formatAmount(value) {
  return `£${Number(value || 0).toFixed(2)}`
}

function formatDate(value) {
  if (!value) return 'Not set'
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(value))
}

function OrderDetails() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    getMyOrderById(id)
      .then((data) => {
        if (isMounted) setOrder(data.order)
      })
      .catch((apiError) => {
        if (isMounted) setError(apiError.message || 'Unable to load order details.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [id])

  return (
    <AccountLayout>
      <Button to="/account/orders" variant="outline">Back to Orders</Button>
      {isLoading ? <p className="text-[var(--color-muted)]">Loading order...</p> : null}
      {error ? <p className="rounded-2xl border border-[rgba(190,151,83,0.42)] bg-[rgba(190,151,83,0.1)] px-5 py-4 text-sm text-[var(--color-cream)]">{error}</p> : null}
      {order ? (
        <>
          <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-6">
            <p className="break-all text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-gold)]">
              Order {order._id}
            </p>
            <h2 className="mt-3 font-serif text-4xl text-white">{order.orderStatus}</h2>
            <p className="mt-3 text-sm text-[var(--color-muted)]">
              Created {formatDate(order.createdAt)} · Payment {order.paymentStatus}
            </p>
          </section>

          <OrderStatusTimeline status={order.orderStatus} />

          <section className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-6">
              <h3 className="font-serif text-2xl text-white">Items Ordered</h3>
              <div className="mt-6 space-y-4">
                {order.items?.map((item) => (
                  <div className="flex gap-4 border-b border-white/10 pb-4 last:border-b-0" key={`${item.name}-${item.product}`}>
                    {item.image ? <img alt={item.name} className="size-20 rounded-2xl object-cover" src={item.image} /> : null}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white">{item.name}</p>
                      <p className="mt-1 text-sm text-[var(--color-muted)]">Quantity {item.quantity} · {item.price}</p>
                    </div>
                    <p className="text-sm font-semibold text-[var(--color-gold)]">{formatAmount(item.subtotal)}</p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="space-y-5">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-6">
                <h3 className="font-serif text-2xl text-white">Shipping</h3>
                <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
                  {order.shipping?.addressLine1}<br />
                  {order.shipping?.addressLine2 ? <>{order.shipping.addressLine2}<br /></> : null}
                  {order.shipping?.city}, {order.shipping?.stateCounty}<br />
                  {order.shipping?.postcode}<br />
                  {order.shipping?.country}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-6">
                <h3 className="font-serif text-2xl text-white">Totals</h3>
                <div className="mt-5 space-y-3 text-sm">
                  <p className="flex justify-between"><span className="text-[var(--color-muted)]">Subtotal</span><span>{formatAmount(order.totals?.subtotal)}</span></p>
                  <p className="flex justify-between"><span className="text-[var(--color-muted)]">Delivery</span><span>{formatAmount(order.totals?.deliveryFee)}</span></p>
                  <p className="flex justify-between font-semibold"><span>Total</span><span className="text-[var(--color-gold)]">{formatAmount(order.totals?.total)}</span></p>
                </div>
              </div>
            </aside>
          </section>
        </>
      ) : null}
    </AccountLayout>
  )
}

export default OrderDetails
