import { useEffect, useState } from 'react'
import Button from '../components/ui/Button'
import { email, instagramHandle, instagramUrl, whatsappLink } from '../data/contactDetails'
import { getShippingOptions } from '../services/shippingService'

function formatPrice(value) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value)
}

function ShippingInformation() {
  const [catalog, setCatalog] = useState(null)

  useEffect(() => {
    let active = true
    getShippingOptions()
      .then((data) => {
        if (active) setCatalog(data)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  const rules = catalog?.rules || {}

  return (
    <main className="overflow-hidden bg-black text-white">
      <section className="border-b border-white/10 px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl 2xl:max-w-[1500px]">
          <div className="h-px w-16 bg-[var(--color-gold)]" />
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-gold)]">
            Delivery Guide
          </p>
          <h1 className="mt-4 max-w-4xl font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">
            Shipping Information
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--color-muted)]">
            Clear delivery options for Nebeda Threads orders across the United Kingdom and selected international destinations.
          </p>
        </div>
      </section>

      <section className="bg-[var(--color-cream)] px-5 py-16 text-black sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl 2xl:max-w-[1500px]">
          <h2 className="font-serif text-3xl sm:text-4xl">UK Delivery Options</h2>
          <div className="mt-8 overflow-x-auto rounded-lg border border-black/12">
            <table className="w-full min-w-[650px] border-collapse text-left">
              <thead className="bg-black text-white">
                <tr>
                  <th className="px-5 py-4 font-semibold">Delivery Option</th>
                  <th className="px-5 py-4 text-right font-semibold">Price</th>
                  <th className="px-5 py-4 font-semibold">Delivery Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                <tr><td className="px-5 py-4">UK Standard Delivery</td><td className="px-5 py-4 text-right">{formatPrice(rules.UK_STANDARD?.shippingCost ?? 4.99)}</td><td className="px-5 py-4">2 to 4 working days</td></tr>
                <tr><td className="px-5 py-4">UK Express Delivery</td><td className="px-5 py-4 text-right">{formatPrice(rules.UK_EXPRESS?.shippingCost ?? 8.99)}</td><td className="px-5 py-4">1 to 2 working days</td></tr>
                <tr><td className="px-5 py-4">Free UK Delivery</td><td className="px-5 py-4 text-right">Orders over £150</td><td className="px-5 py-4">Automatically applied</td></tr>
              </tbody>
            </table>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <article className="rounded-lg border border-black/10 bg-white p-6 shadow-sm sm:p-8">
              <h3 className="font-serif text-2xl">Recommended carriers</h3>
              <p className="mt-5 leading-8 text-black/68">Royal Mail Tracked 48</p>
              <p className="leading-8 text-black/68">Evri</p>
              <p className="mt-5 leading-8 text-black/68">
                Tracking information will be emailed once the order is dispatched.
              </p>
            </article>
            <article className="rounded-lg border border-[rgba(190,151,83,0.45)] bg-black p-6 text-white shadow-xl sm:p-8">
              <h3 className="font-serif text-2xl">International</h3>
              <div className="mt-5 space-y-4 text-[var(--color-muted)]">
                <p className="flex justify-between gap-4"><span>Europe</span><span className="text-[var(--color-gold)]">£14.99</span></p>
                <p className="flex justify-between gap-4"><span>USA / Canada</span><span className="text-[var(--color-gold)]">£24.99</span></p>
              </div>
              <p className="mt-6 leading-7 text-[var(--color-muted)]">
                Other countries: Please contact Nebeda Threads for a custom shipping quotation.
              </p>
            </article>
          </div>

          <div className="mt-12 border-t border-black/12 pt-8">
            <h3 className="font-serif text-2xl">Need delivery help?</h3>
            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <Button href={`mailto:${email}`} variant="primary">Email {email}</Button>
              <Button href={whatsappLink} rel="noreferrer" target="_blank" variant="outline">WhatsApp +44 7448 668759</Button>
              <Button href={instagramUrl} rel="noreferrer" target="_blank" variant="outline">Instagram {instagramHandle}</Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default ShippingInformation
