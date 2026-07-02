import { normalizeMeasurements } from '../../data/measurementProfiles'

function MeasurementTable({ measurements, fallbackGender = '' }) {
  const profile = normalizeMeasurements(measurements, fallbackGender)

  if (!profile.fields.length) {
    return <p className="text-sm text-[var(--color-muted)]">No measurements provided.</p>
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-black/30 px-4 py-3">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-gold)]">
          {profile.gender || 'Garment'} measurements
        </span>
        <span className="text-xs text-white/55">Unit: {profile.unit}</span>
      </div>
      <dl className="divide-y divide-white/10">
        {profile.fields.map((field) => (
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 px-4 py-3" key={field.name}>
            <dt className="min-w-0 break-words text-sm text-white/65">{field.name}</dt>
            <dd className="whitespace-nowrap text-sm font-semibold text-white">
              {field.value} {profile.unit}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export default MeasurementTable
