import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { useToast } from '../../components/ui/toastContext'
import { createCheckoutSession, createCustomOrderCheckoutSession } from '../../services/paymentService'

function PaymentCancel() {
  const [searchParams] = useSearchParams()
  const { showToast } = useToast()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const orderId = searchParams.get('orderId')
  const customOrderId = searchParams.get('customOrderId')

  const completePayment = async () => {
    if (!orderId && !customOrderId) return
    setIsRedirecting(true)

    try {
      const data = customOrderId
        ? await createCustomOrderCheckoutSession(customOrderId)
        : await createCheckoutSession(orderId)
      if (!data.checkoutUrl) throw new Error('Stripe Checkout URL is unavailable.')
      window.location.assign(data.checkoutUrl)
    } catch (error) {
      showToast({ message: error.message || 'Unable to restart payment.', type: 'error' })
      setIsRedirecting(false)
    }
  }

  return (
    <main className="flex min-h-[calc(100svh-80px)] items-center bg-black px-5 py-16 text-white sm:px-8 lg:px-10">
      <section className="mx-auto w-full max-w-3xl rounded-[1.5rem] border border-[rgba(190,151,83,0.42)] bg-white/[0.045] p-6 text-center shadow-[0_28px_90px_rgba(0,0,0,0.34)] sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-gold)]">
          Payment Pending
        </p>
        <h1 className="mt-4 font-serif text-4xl text-white sm:text-5xl">Payment Cancelled</h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[var(--color-muted)] sm:text-base">
          Your payment was not completed. Your order is still pending.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row sm:flex-wrap">
          {orderId || customOrderId ? (
            <Button disabled={isRedirecting} onClick={completePayment} variant="primary">
              {isRedirecting ? 'Opening Secure Payment...' : 'Complete Payment'}
            </Button>
          ) : null}
          <Button to={customOrderId ? '/account/custom-orders' : '/account/orders'} variant="outline">View My Orders</Button>
          <Button to="/shop" variant="outline">Continue Shopping</Button>
        </div>
      </section>
    </main>
  )
}

export default PaymentCancel
