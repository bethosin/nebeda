import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import AccountLayout from '../../components/account/AccountLayout'
import OrderStatusTimeline from '../../components/account/OrderStatusTimeline'
import Button from '../../components/ui/Button'
import { getMyCustomOrderById } from '../../services/accountService'

function formatDate(value) {
  if (!value) return 'Not set'
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(value))
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">{label}</p>
      <p className="mt-2 text-sm leading-6 text-white/78">{value || 'Not provided'}</p>
    </div>
  )
}

function CustomOrderDetails() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    getMyCustomOrderById(id)
      .then((data) => {
        if (isMounted) setOrder(data.order)
      })
      .catch((apiError) => {
        if (isMounted) setError(apiError.message || 'Unable to load custom order details.')
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
      <Button to="/account/custom-orders" variant="outline">Back to Custom Orders</Button>
      {isLoading ? <p className="text-[var(--color-muted)]">Loading custom order...</p> : null}
      {error ? <p className="rounded-2xl border border-[rgba(190,151,83,0.42)] bg-[rgba(190,151,83,0.1)] px-5 py-4 text-sm text-[var(--color-cream)]">{error}</p> : null}
      {order ? (
        <>
          <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-6">
            <p className="break-all text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-gold)]">
              Custom Order {order._id}
            </p>
            <h2 className="mt-3 font-serif text-4xl text-white">{order.outfitType}</h2>
            <p className="mt-3 text-sm text-[var(--color-muted)]">
              Created {formatDate(order.createdAt)} · {order.orderStatus} · Payment {order.paymentStatus}
            </p>
          </section>
          <OrderStatusTimeline status={order.orderStatus} type="custom" />
          <section className="grid gap-5 xl:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-6">
              <h3 className="font-serif text-2xl text-white">Request Details</h3>
              <div className="mt-6 grid gap-5">
                <Field label="Gender" value={order.gender} />
                <Field label="Order Type" value={order.orderType} />
                <Field label="Fabric" value={order.fabricPreference} />
                <Field label="Occasion" value={order.occasion} />
                <Field label="Estimated Price" value={order.estimatedPrice} />
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-6">
              <h3 className="font-serif text-2xl text-white">Measurements</h3>
              <div className="mt-6 grid gap-5">
                {Object.entries(order.measurements || {}).map(([key, value]) => (
                  <Field key={key} label={key.replace(/([A-Z])/g, ' $1')} value={value} />
                ))}
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-6">
              <h3 className="font-serif text-2xl text-white">Shipping</h3>
              <div className="mt-6 grid gap-5">
                <Field label="Country" value={order.shipping?.shippingCountry} />
                <Field label="Method" value={order.shipping?.shippingMethod} />
                <Field label="Address" value={`${order.shipping?.addressLine1 || ''} ${order.shipping?.addressLine2 || ''}`} />
                <Field label="City" value={order.shipping?.city} />
                <Field label="Postcode" value={order.shipping?.postcode} />
              </div>
            </div>
          </section>
          <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-6">
            <h3 className="font-serif text-2xl text-white">Notes</h3>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Field label="Style Notes" value={order.styleNotes} />
              <Field label="Admin Notes" value={order.adminNotes} />
            </div>
          </section>
          {order.inspirationImages?.length ? (
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {order.inspirationImages.map((image) => (
                <img alt={image.alt} className="h-64 w-full rounded-2xl object-cover" key={image.publicId} src={image.url} />
              ))}
            </section>
          ) : null}
        </>
      ) : null}
    </AccountLayout>
  )
}

export default CustomOrderDetails
