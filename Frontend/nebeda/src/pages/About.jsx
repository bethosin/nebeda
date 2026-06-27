import { motion } from 'framer-motion'
import Button from '../components/ui/Button'
import craftImage from '../assets/images/about-craft.jpg'
import founderImage from '../assets/images/about-founder.jpg'

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
}

const offers = [
  'Bespoke African fashion for men and women',
  'Ready to wear collections',
  'Senator wear and traditional attire',
  'Ankara and Aso Oke designs',
  'Wedding and special occasion outfits',
  'Fashion consultation and styling services',
]

function ImageFrame({ image, alt, className = '', imagePosition = 'object-[center_18%]' }) {
  return (
    <motion.div
      className={`relative overflow-hidden rounded-[1.75rem] border border-[rgba(190,151,83,0.42)] bg-black p-3 shadow-[0_30px_100px_rgba(0,0,0,0.38)] ${className}`}
      initial={{ opacity: 0, y: 28 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      viewport={{ once: true, amount: 0.28 }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <div className="group relative h-full min-h-[420px] overflow-hidden rounded-[1.25rem] border border-white/10 sm:min-h-[520px] lg:min-h-[640px]">
        <img
          alt={alt}
          className={`absolute inset-0 h-full w-full object-cover ${imagePosition} transition duration-700 ease-out group-hover:scale-[1.025]`}
          loading="lazy"
          src={image}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.52),rgba(0,0,0,0.08)_58%,rgba(0,0,0,0.02))]" />
      </div>
    </motion.div>
  )
}

function ValueCard({ title, text }) {
  return (
    <motion.article
      className="rounded-[1.5rem] border border-white/10 bg-[rgba(255,255,255,0.045)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-md transition duration-500 hover:-translate-y-1 hover:border-[rgba(190,151,83,0.62)] hover:bg-[rgba(243,234,217,0.08)] sm:p-8"
      initial={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      viewport={{ once: true, amount: 0.3 }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <div className="mb-7 h-px w-16 bg-[var(--color-gold)]" />
      <h3 className="font-serif text-3xl leading-tight text-white">{title}</h3>
      <p className="mt-5 text-base leading-8 text-[var(--color-muted)]">{text}</p>
    </motion.article>
  )
}

function About() {
  return (
    <main className="overflow-hidden bg-black text-white">
      <section className="relative px-5 py-20 sm:px-8 md:py-24 lg:px-10 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(190,151,83,0.16),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.035),transparent_34%)]" />
        <motion.div
          className="relative mx-auto max-w-7xl 2xl:max-w-[1500px]"
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.8, ease: 'easeOut', staggerChildren: 0.1 }}
        >
          <motion.div className="mb-7 h-px w-20 bg-[var(--color-gold)]" variants={fadeUp} />
          <motion.p
            className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--color-gold)]"
            variants={fadeUp}
          >
            ABOUT NEBEDA THREADS
          </motion.p>
          <motion.h1
            className="mt-5 max-w-4xl font-serif text-5xl leading-tight text-[var(--color-soft-white)] sm:text-6xl lg:text-7xl"
            variants={fadeUp}
          >
            Elevate Your Essence
          </motion.h1>
          <motion.p
            className="mt-7 max-w-3xl text-base leading-8 text-[var(--color-muted)] sm:text-lg"
            variants={fadeUp}
          >
            Nebeda Threads is a luxury African fashion brand founded by Benjamen Oyekan,
            dedicated to creating elegant, high quality garments that celebrate African heritage
            while embracing modern fashion.
          </motion.p>
        </motion.div>
      </section>

      <section className="px-5 py-20 sm:px-8 md:py-24 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16 2xl:max-w-[1500px]">
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            viewport={{ once: true, amount: 0.3 }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--color-gold)]">
              Brand Story
            </p>
            <h2 className="mt-5 font-serif text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">
              A Brand Built on Culture, Confidence, and Craftsmanship
            </h2>
            <div className="mt-8 space-y-6 text-base leading-8 text-[var(--color-muted)] sm:text-lg">
              <p>
                Based in the United Kingdom and serving customers worldwide, Nebeda Threads was
                established with a vision to showcase the beauty, sophistication, and richness of
                African fashion on a global stage.
              </p>
              <p>
                Our designs combine traditional craftsmanship with contemporary styling, creating
                unique pieces that inspire confidence and individuality.
              </p>
            </div>
          </motion.div>

          <ImageFrame alt="Nebeda Threads craft editorial" image={craftImage} />
        </div>
      </section>

      <section className="relative px-5 py-20 sm:px-8 md:py-24 lg:px-10 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(190,151,83,0.11),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-6 lg:grid-cols-2 2xl:max-w-[1500px]">
          <ValueCard
            title="Mission"
            text="To provide exceptional African fashion that empowers individuals to embrace their culture, express their uniqueness, and elevate their essence through timeless style."
          />
          <ValueCard
            title="Vision"
            text="To become one of the leading African luxury fashion brands, recognised globally for quality, creativity, and cultural excellence."
          />
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 md:py-24 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl 2xl:max-w-[1500px]">
          <motion.div
            className="mb-12 max-w-3xl"
            initial={{ opacity: 0, y: 28 }}
            transition={{ duration: 0.75, ease: 'easeOut' }}
            viewport={{ once: true, amount: 0.35 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--color-gold)]">
              What We Offer
            </p>
            <h2 className="mt-5 font-serif text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">
              Designed for Every Expression of Presence
            </h2>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer, index) => (
              <motion.div
                className="rounded-[1.25rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.24)] transition duration-500 hover:border-[rgba(190,151,83,0.55)] hover:bg-[rgba(243,234,217,0.07)]"
                initial={{ opacity: 0, y: 22 }}
                key={offer}
                transition={{ duration: 0.65, ease: 'easeOut', delay: index * 0.05 }}
                viewport={{ once: true, amount: 0.25 }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-gold)]">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <p className="mt-5 text-base leading-7 text-white/84">{offer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 md:py-24 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 2xl:max-w-[1500px]">
          <ImageFrame
            alt="Benjamen Oyekan founder of Nebeda Threads"
            image={founderImage}
            imagePosition="object-[center_16%]"
          />

          <motion.div
            initial={{ opacity: 0, x: 28 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            viewport={{ once: true, amount: 0.3 }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--color-gold)]">
              Founder
            </p>
            <h2 className="mt-5 font-serif text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">
              Meet the Founder
            </h2>
            <div className="mt-8 space-y-6 text-base leading-8 text-[var(--color-muted)] sm:text-lg">
              <p>
                Benjamen Oyekan is an entrepreneur, fashion visionary, and founder of Nebeda
                Threads. Driven by a passion for creativity and excellence, he created the brand to
                bridge African tradition with contemporary luxury fashion.
              </p>
              <p>
                His goal is to create clothing that looks exceptional, feels personal, and
                celebrates the culture, confidence, and individuality of every customer.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-8 lg:px-10 lg:pb-28">
        <motion.div
          className="relative mx-auto max-w-7xl overflow-hidden rounded-[1.75rem] border border-[rgba(190,151,83,0.38)] bg-[linear-gradient(135deg,rgba(243,234,217,0.1),rgba(255,255,255,0.035))] px-6 py-12 shadow-[0_30px_100px_rgba(0,0,0,0.34)] sm:px-10 lg:px-14 2xl:max-w-[1500px]"
          initial={{ opacity: 0, y: 28 }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
          viewport={{ once: true, amount: 0.35 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_20%,rgba(190,151,83,0.18),transparent_30%)]" />
          <div className="relative max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-gold)]">
              Nebeda Threads
            </p>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-white sm:text-5xl">
              Every Piece Is Designed with Purpose
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--color-muted)] sm:text-lg">
              At Nebeda Threads, every garment is crafted with care and made to leave a lasting
              impression.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button to="/shop" variant="primary">
                Shop Collection
              </Button>
              <Button to="/custom-order" variant="outline">
                Start Custom Order
              </Button>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  )
}

export default About
