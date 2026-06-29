const orderSteps = [
  { status: 'Pending', label: 'Order Placed', dateField: 'createdAt' },
  { status: 'Confirmed', label: 'Payment Confirmed', dateField: 'paidAt' },
  { status: 'Processing', label: 'Processing', dateField: 'processingAt' },
  { status: 'Shipped', label: 'Shipped', dateField: 'shippedAt' },
  { status: 'Delivered', label: 'Delivered', dateField: 'deliveredAt' },
]
const customSteps = ['New', 'Reviewed', 'In Progress', 'Awaiting Payment', 'Paid', 'Completed']

function formatDate(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(value))
}

function OrderStatusTimeline({
  status,
  type = 'order',
  statusHistory = [],
  createdAt,
  paidAt,
  processingAt,
  shippedAt,
  deliveredAt,
  cancelledAt,
}) {
  const isCancelled = status === 'Cancelled'

  if (isCancelled) {
    return (
      <div className="rounded-2xl border border-[rgba(190,151,83,0.38)] bg-[rgba(190,151,83,0.08)] p-5 text-sm text-[var(--color-cream)]">
        <p>This order is currently marked as Cancelled.</p>
        {cancelledAt ? <p className="mt-2 text-white/58">{formatDate(cancelledAt)}</p> : null}
      </div>
    )
  }

  const steps = type === 'custom'
    ? customSteps.map((step) => ({ status: step, label: step }))
    : orderSteps
  const activeIndex = steps.findIndex((step) => step.status === status)
  const milestoneDates = { createdAt, paidAt, processingAt, shippedAt, deliveredAt }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {steps.map((step, index) => {
        const isActive = index <= activeIndex
        const historyEntry = statusHistory.find((entry) => entry.status === step.status)
        const milestoneDate = historyEntry?.changedAt || milestoneDates[step.dateField]

        return (
          <div
            className={[
              'rounded-2xl border p-4 transition',
              isActive
                ? 'border-[rgba(190,151,83,0.58)] bg-[rgba(190,151,83,0.12)] text-white'
                : 'border-white/10 bg-white/[0.035] text-white/45',
            ].join(' ')}
            key={step.status}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">
              {String(index + 1).padStart(2, '0')}
            </p>
            <p className="mt-2 text-sm font-semibold">{step.label}</p>
            {milestoneDate ? <p className="mt-2 text-xs text-white/52">{formatDate(milestoneDate)}</p> : null}
          </div>
        )
      })}
    </div>
  )
}

export default OrderStatusTimeline
