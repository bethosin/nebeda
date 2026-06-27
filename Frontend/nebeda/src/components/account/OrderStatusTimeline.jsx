const defaultSteps = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered']
const customSteps = ['New', 'Reviewed', 'In Progress', 'Awaiting Payment', 'Paid', 'Completed']

function OrderStatusTimeline({ status, type = 'order' }) {
  const isCancelled = status === 'Cancelled'
  const steps = type === 'custom' ? customSteps : defaultSteps
  const activeIndex = steps.indexOf(status)

  if (isCancelled) {
    return (
      <div className="rounded-2xl border border-[rgba(190,151,83,0.38)] bg-[rgba(190,151,83,0.08)] p-5 text-sm text-[var(--color-cream)]">
        This order is currently marked as Cancelled.
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {steps.map((step, index) => {
        const isActive = index <= activeIndex
        return (
          <div
            className={[
              'rounded-2xl border p-4 transition',
              isActive
                ? 'border-[rgba(190,151,83,0.58)] bg-[rgba(190,151,83,0.12)] text-white'
                : 'border-white/10 bg-white/[0.035] text-white/45',
            ].join(' ')}
            key={step}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">
              {String(index + 1).padStart(2, '0')}
            </p>
            <p className="mt-2 text-sm font-semibold">{step}</p>
          </div>
        )
      })}
    </div>
  )
}

export default OrderStatusTimeline
