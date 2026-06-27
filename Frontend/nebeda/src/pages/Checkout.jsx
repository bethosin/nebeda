import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import { useCart } from '../context/cartContextValue'
import { useToast } from '../components/ui/toastContext'
import { createOrder } from '../services/orderService'
import { subscribeNewsletter } from '../services/newsletterService'
import { getStoredUser, isUserAuthenticated } from '../services/userAuthService'
import logEmailWarning from '../utils/emailDiagnostics'

const shippingCountries = ['United Kingdom', 'Nigeria', 'Other']
const shippingMethods = {
  'United Kingdom': ['UK Standard Delivery', 'UK Express Delivery'],
  Nigeria: ['Nigeria Standard Delivery', 'Nigeria Express Delivery'],
  Other: ['Worldwide Delivery Enquiry'],
}

function formatAmount(value) {
  return `£${Number(value || 0).toFixed(2)}`
}

function getInitialForm() {
  const user = getStoredUser()
  return {
    fullName: user?.fullName || '',
    email: user?.email || '',
    whatsappNumber: user?.whatsappNumber || '',
    shippingCountry: 'United Kingdom',
    shippingMethod: 'UK Standard Delivery',
    addressLine1: '',
    addressLine2: '',
    city: '',
    stateCounty: '',
    postcode: '',
    country: 'United Kingdom',
  }
}

function Checkout() {
  const { cartItems, clearCart, subtotal, totalItems } = useCart()
  const { showToast } = useToast()
  const [formData, setFormData] = useState(getInitialForm)
  const [errors, setErrors] = useState({})
  const [newsletterOptIn, setNewsletterOptIn] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdOrder, setCreatedOrder] = useState(null)
  const userLoggedIn = isUserAuthenticated()

  const availableShippingMethods = useMemo(
    () => shippingMethods[formData.shippingCountry] || shippingMethods.Other,
    [formData.shippingCountry],
  )

  if (!cartItems.length && !createdOrder) {
    return <Navigate replace to="/cart" />
  }

  const updateField = (event) => {
    const { name, value } = event.target
    setFormData((current) => {
      const next = { ...current, [name]: value }
      if (name === 'shippingCountry') {
        next.shippingMethod = shippingMethods[value]?.[0] || ''
        if (value === 'United Kingdom') next.country = 'United Kingdom'
        if (value === 'Nigeria') next.country = 'Nigeria'
        if (value === 'Other') next.country = ''
      }
      return next
    })
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  const validateForm = () => {
    const required = ['fullName', 'email', 'shippingCountry', 'addressLine1', 'city', 'country']
    const labels = {
      fullName: 'Full Name',
      email: 'Email',
      shippingCountry: 'Shipping Country',
      addressLine1: 'Address Line 1',
      city: 'City',
      country: 'Country',
    }
    const nextErrors = {}

    required.forEach((field) => {
      if (!formData[field].trim()) nextErrors[field] = `${labels[field]} is required.`
    })

    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      nextErrors.email = 'Please enter a valid email address.'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      showToast({ message: 'Please complete the required checkout fields.', type: 'error' })
      return false
    }
    return true
  }

  const handleCreateOrder = async (event) => {
    event.preventDefault()
    if (!userLoggedIn) {
      showToast({
        message: 'Please login or create an account to complete your order.',
        type: 'error',
      })
      return
    }
    if (!validateForm()) return
    setIsSubmitting(true)

    try {
      const payload = {
        customer: {
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          whatsappNumber: formData.whatsappNumber.trim(),
        },
        shipping: {
          shippingCountry: formData.shippingCountry,
          shippingMethod: formData.shippingMethod,
          addressLine1: formData.addressLine1.trim(),
          addressLine2: formData.addressLine2.trim(),
          city: formData.city.trim(),
          stateCounty: formData.stateCounty.trim(),
          postcode: formData.postcode.trim(),
          country: formData.country.trim(),
        },
        items: cartItems,
        totals: {
          subtotal,
          deliveryFee: 0,
          total: subtotal,
        },
      }
      const data = await createOrder(payload)

      if (newsletterOptIn) {
        subscribeNewsletter({
          email: formData.email.trim(),
          fullName: formData.fullName.trim(),
          source: 'Checkout',
        })
          .then((response) => {
            logEmailWarning(response, 'Checkout newsletter signup')
          })
          .catch(() => {
            showToast({
              message: 'Order created. Newsletter signup could not be completed right now.',
              type: 'info',
            })
          })
      }

      setCreatedOrder(data.order)
      clearCart()
      showToast({ message: 'Your order has been created.', type: 'success' })
      logEmailWarning(data, 'Checkout order')
    } catch (apiError) {
      showToast({ message: apiError.message || 'Unable to create order.', type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const showPaymentComingSoon = () => {
    showToast({ message: 'Payment will be available when Stripe is connected.', type: 'info' })
  }

  return (
    <main className="bg-black px-5 py-16 text-white sm:px-8 lg:px-10 lg:py-24">
      <section className="mx-auto max-w-7xl 2xl:max-w-[1500px]">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-gold)]">
            Checkout
          </p>
          <h1 className="mt-4 font-serif text-4xl text-white sm:text-5xl">
            Review Before Secure Payment
          </h1>
          <p className="mt-5 text-base leading-8 text-[var(--color-muted)]">
            Create your order now. Stripe payment remains disabled until the payment phase is built.
          </p>
          {userLoggedIn ? (
            <p className="mt-4 rounded-2xl border border-[rgba(190,151,83,0.32)] bg-white/[0.04] px-5 py-4 text-sm text-[var(--color-muted)]">
              Checking out as {formData.fullName || formData.email}. Your order will be saved to
              your customer account.
            </p>
          ) : null}
        </div>

        {createdOrder ? (
          <div className="mt-10 rounded-[1.5rem] border border-[rgba(190,151,83,0.42)] bg-[rgba(190,151,83,0.1)] p-6 sm:p-8">
            <h2 className="font-serif text-3xl text-white">Order Created</h2>
            <p className="mt-4 text-[var(--color-muted)]">
              Your order has been received. Nebeda Threads will confirm availability and payment next steps.
            </p>
            <p className="mt-4 break-all text-sm uppercase tracking-[0.18em] text-[var(--color-gold)]">
              Order Reference: {createdOrder._id}
            </p>
            <div className="mt-7 flex flex-col gap-4 sm:flex-row">
              <Button to="/shop" variant="primary">Continue Shopping</Button>
              {userLoggedIn ? <Button to="/account/orders" variant="outline">View My Orders</Button> : null}
            </div>
          </div>
        ) : !userLoggedIn ? (
          <section className="mt-10 rounded-[1.5rem] border border-[rgba(190,151,83,0.42)] bg-white/[0.045] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.3)] sm:p-8 lg:max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-gold)]">
              Account Required
            </p>
            <h2 className="mt-4 font-serif text-3xl text-white sm:text-4xl">
              Sign in to Continue
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--color-muted)] sm:text-base">
              Create an account or log in to complete your order, track your purchase, and receive
              Nebeda Threads updates.
            </p>
            <p className="mt-5 rounded-2xl border border-white/10 bg-black/35 px-5 py-4 text-sm leading-7 text-white/72">
              Your cart is saved and will remain here while you sign in.
            </p>
            <div className="mt-7 flex flex-col gap-4 sm:flex-row">
              <Button to="/login?redirect=/checkout" variant="primary">
                Login
              </Button>
              <Button to="/signup?redirect=/checkout" variant="outline">
                Create Account
              </Button>
            </div>
          </section>
        ) : (
          <form className="mt-10 grid gap-8 lg:grid-cols-[1fr_24rem]" onSubmit={handleCreateOrder}>
            <div className="space-y-8">
              <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-5 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-gold)]">
                  Customer Details
                </p>
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  {[
                    ['fullName', 'Full Name', 'text'],
                    ['email', 'Email', 'email'],
                    ['whatsappNumber', 'WhatsApp Number', 'tel'],
                  ].map(([name, label, type]) => (
                    <label className="block" key={name}>
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/58">
                        {label}
                      </span>
                      <input
                        className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none focus:border-[var(--color-gold)]"
                        name={name}
                        onChange={updateField}
                        type={type}
                        value={formData[name]}
                      />
                      {errors[name] ? <p className="mt-2 text-sm text-[var(--color-gold-light)]">{errors[name]}</p> : null}
                    </label>
                  ))}
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/58">
                      Shipping Country
                    </span>
                    <select
                      className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none focus:border-[var(--color-gold)]"
                      name="shippingCountry"
                      onChange={updateField}
                      value={formData.shippingCountry}
                    >
                      {shippingCountries.map((country) => (
                        <option className="bg-black" key={country}>{country}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/58">
                      Shipping Method
                    </span>
                    <select
                      className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none focus:border-[var(--color-gold)]"
                      name="shippingMethod"
                      onChange={updateField}
                      value={formData.shippingMethod}
                    >
                      {availableShippingMethods.map((method) => (
                        <option className="bg-black" key={method}>{method}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </section>

              <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-5 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-gold)]">
                  Shipping Address
                </p>
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  {[
                    ['addressLine1', 'Address Line 1', 'md:col-span-2'],
                    ['addressLine2', 'Address Line 2', 'md:col-span-2'],
                    ['city', 'City', ''],
                    ['stateCounty', 'State/County', ''],
                    ['postcode', 'Postcode', ''],
                    ['country', 'Country', ''],
                  ].map(([name, placeholder, className]) => (
                    <label className={`block ${className}`} key={name}>
                      <input
                        className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none focus:border-[var(--color-gold)]"
                        name={name}
                        onChange={updateField}
                        placeholder={placeholder}
                        value={formData[name]}
                      />
                      {errors[name] ? <p className="mt-2 text-sm text-[var(--color-gold-light)]">{errors[name]}</p> : null}
                    </label>
                  ))}
                </div>
              </section>

              <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-5 sm:p-8">
                <label className="flex items-start gap-3 text-sm leading-7 text-[var(--color-muted)]">
                  <input
                    checked={newsletterOptIn}
                    className="mt-1 size-4 accent-[var(--color-gold)]"
                    onChange={(event) => setNewsletterOptIn(event.target.checked)}
                    type="checkbox"
                  />
                  <span>Send me Nebeda Threads updates and new collection alerts.</span>
                </label>
              </section>
            </div>

            <aside className="h-fit rounded-[1.5rem] border border-[rgba(190,151,83,0.38)] bg-white/[0.055] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.3)] lg:sticky lg:top-28">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-gold)]">
                Order Summary
              </p>
              <div className="mt-6 space-y-4">
                {cartItems.map((item) => (
                  <div className="flex gap-3 border-b border-white/10 pb-4 last:border-b-0" key={item.productId}>
                    <img alt={item.name} className="size-16 rounded-xl object-cover" src={item.image} />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-semibold text-white">{item.name}</p>
                      <p className="mt-1 text-xs text-white/52">Quantity: {item.quantity}</p>
                      <p className="mt-1 text-xs text-[var(--color-gold)]">
                        {formatAmount(item.numericPrice * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 space-y-4 border-t border-white/10 pt-6">
                <div className="flex justify-between text-sm"><span className="text-white/58">Products</span><span>{totalItems}</span></div>
                <div className="flex justify-between text-sm"><span className="text-white/58">Subtotal</span><span>{formatAmount(subtotal)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-white/58">Delivery</span><span>Calculated later</span></div>
                <div className="flex justify-between text-base font-semibold"><span>Total</span><span className="text-[var(--color-gold)]">{formatAmount(subtotal)}</span></div>
              </div>
              <Button className="mt-7 w-full" disabled={isSubmitting} type="submit" variant="primary">
                {isSubmitting ? 'Creating Order...' : 'Create Order'}
              </Button>
              <Button className="mt-3 w-full" onClick={showPaymentComingSoon} type="button" variant="outline">
                Payment Coming Soon
              </Button>
            </aside>
          </form>
        )}
      </section>
    </main>
  )
}

export default Checkout
