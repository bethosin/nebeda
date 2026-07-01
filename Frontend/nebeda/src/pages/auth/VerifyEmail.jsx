import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { useToast } from '../../components/ui/toastContext'
import {
  isUserAuthenticated,
  resendVerificationEmail,
  verifyEmail,
} from '../../services/userAuthService'

function VerifyEmail() {
  const [params] = useSearchParams()
  const { showToast } = useToast()
  const token = params.get('token')
  const [state, setState] = useState(() => ({
    loading: Boolean(token),
    error: token ? '' : 'This verification link is incomplete.',
  }))
  const [resending, setResending] = useState(false)
  const authenticated = isUserAuthenticated()

  useEffect(() => {
    if (!token) return
    verifyEmail(token)
      .then(() => setState({ loading: false, error: '' }))
      .catch((error) => setState({
        loading: false,
        error: error.message || 'This verification link is invalid or has expired.',
      }))
  }, [token])

  const resend = async () => {
    setResending(true)
    try {
      const response = await resendVerificationEmail()
      showToast({ message: response.message, type: 'success' })
    } catch (error) {
      showToast({ message: error.message || 'Unable to resend verification email.', type: 'error' })
    } finally {
      setResending(false)
    }
  }

  return (
    <main className="bg-black px-5 py-20 text-white sm:px-8">
      <section className="mx-auto max-w-xl rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-7 text-center sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-gold)]">Nebeda Threads</p>
        <h1 className="mt-4 font-serif text-4xl">
          {state.loading ? 'Verifying Your Email' : state.error ? 'Verification Link Issue' : 'Email Verified'}
        </h1>
        <p className="mt-5 leading-7 text-[var(--color-muted)]">
          {state.loading ? 'Please wait while we secure your account.' : state.error || 'Your account is ready for secure checkout and order tracking.'}
        </p>
        {!state.loading && !state.error ? (
          <Button className="mt-7" to={authenticated ? '/account' : '/login'}>Continue</Button>
        ) : null}
        {!state.loading && state.error ? (
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            {authenticated ? (
              <Button disabled={resending} onClick={resend} type="button">
                {resending ? 'Sending...' : 'Resend Verification Email'}
              </Button>
            ) : (
              <Button to="/login">Login to Resend</Button>
            )}
            <Button to="/contact" variant="outline">Contact Support</Button>
          </div>
        ) : null}
      </section>
    </main>
  )
}

export default VerifyEmail
