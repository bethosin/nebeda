import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { verifyEmail } from '../../services/userAuthService'

function VerifyEmail() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const [state, setState] = useState(() => ({
    loading: Boolean(token),
    error: token ? '' : 'This verification link is incomplete.',
  }))

  useEffect(() => {
    if (!token) return
    verifyEmail(token)
      .then(() => setState({ loading: false, error: '' }))
      .catch((error) => setState({ loading: false, error: error.message || 'Verification failed.' }))
  }, [token])

  return (
    <main className="bg-black px-5 py-20 text-white sm:px-8">
      <section className="mx-auto max-w-xl rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-7 text-center sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-gold)]">Nebeda Threads</p>
        <h1 className="mt-4 font-serif text-4xl">{state.loading ? 'Verifying Your Email' : state.error ? 'Verification Link Issue' : 'Email Verified'}</h1>
        <p className="mt-5 leading-7 text-[var(--color-muted)]">{state.loading ? 'Please wait while we secure your account.' : state.error || 'Your account is ready for secure checkout and order tracking.'}</p>
        {!state.loading && !state.error ? <Button className="mt-7" to="/account">Go to My Account</Button> : null}
        {!state.loading && state.error ? <Link className="mt-7 inline-block text-[var(--color-gold)]" to="/account/security">Request a new verification email</Link> : null}
      </section>
    </main>
  )
}

export default VerifyEmail
