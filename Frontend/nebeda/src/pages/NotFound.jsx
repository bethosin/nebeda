import Button from '../components/ui/Button'

function NotFound() {
  return (
    <main className="grid min-h-[70vh] place-items-center bg-black px-5 py-20 text-white sm:px-8">
      <section className="w-full max-w-3xl rounded-[1.5rem] border border-[rgba(190,151,83,0.4)] bg-white/[0.045] p-7 text-center shadow-[0_28px_90px_rgba(0,0,0,0.35)] sm:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-gold)]">404</p>
        <h1 className="mt-5 font-serif text-4xl sm:text-6xl">Page Not Found</h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-[var(--color-muted)]">
          The page you are looking for may have moved or does not exist.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Button to="/" variant="primary">Back Home</Button>
          <Button to="/shop" variant="outline">Shop Collection</Button>
        </div>
      </section>
    </main>
  )
}

export default NotFound
