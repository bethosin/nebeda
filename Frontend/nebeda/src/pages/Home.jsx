import { motion } from 'framer-motion'
import NewsletterSignup from '../components/common/NewsletterSignup'
import InstagramFeed from '../components/home/InstagramFeed'
import Button from '../components/ui/Button'
import brandStoryImage from '../assets/images/brand-story.jpg'
import bespokeImage from '../assets/images/female01.png'
import heritageImage from '../assets/images/male01.png'
import menswearImage from '../assets/images/male02.png'
import presenceImage from '../assets/images/female01.png'
import readyToWearImage from '../assets/images/male03.png'
import womenswearImage from '../assets/images/female02.png'
import { instagramHandle, instagramUrl } from '../data/contactDetails'

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
}

const collections = [
  {
    title: "Men's Wear",
    description: 'Refined senator wear, traditional attire, and contemporary African menswear.',
    image: menswearImage,
    imagePosition: 'object-[center_18%]',
    className: 'lg:col-span-7 lg:min-h-[620px]',
  },
  {
    title: "Women's Wear",
    description: 'Elegant dresses, Ankara designs, bubu styles, and statement pieces.',
    image: womenswearImage,
    imagePosition: 'object-[center_16%]',
    className: 'lg:col-span-5 lg:min-h-[420px]',
  },
  {
    title: 'Bespoke Designs',
    description: 'Tailored creations designed around your measurements, vision, and occasion.',
    image: bespokeImage,
    imagePosition: 'object-[center_34%]',
    className: 'lg:col-span-5 lg:min-h-[420px]',
  },
  {
    title: 'Ready To Wear',
    description: 'Premium pieces available for immediate order and worldwide delivery.',
    image: readyToWearImage,
    imagePosition: 'object-[center_32%]',
    className: 'lg:col-span-7 lg:min-h-[520px]',
  },
]

const sectionVariants = {
  hidden: { opacity: 0, y: 34 },
  visible: { opacity: 1, y: 0 },
}

const storyStats = [
  { number: '01', label: 'UK Based' },
  { number: '02', label: 'Worldwide Delivery' },
  { number: '03', label: 'Premium Craftsmanship' },
  { number: '04', label: 'Bespoke Excellence' },
]

const nebedaFeatures = [
  {
    icon: 'PF',
    title: 'Premium Fabrics',
    text: 'Carefully selected Ankara, Aso Oke, lace, senator fabrics, and luxury materials.',
    className: 'lg:col-span-4',
  },
  {
    icon: 'BC',
    title: 'Bespoke Craftsmanship',
    text: 'Every custom piece is made with attention to measurements, fit, finishing, and personal style.',
    className: 'lg:col-span-4',
  },
  {
    icon: 'MW',
    title: 'Men & Women Designs',
    text: 'Elegant African fashion for both men and women, from everyday luxury to special occasions.',
    className: 'lg:col-span-4',
  },
  {
    icon: 'WD',
    title: 'UK Based, Worldwide Delivery',
    text: 'Serving customers across the United Kingdom, Nigeria, and worldwide.',
    className: 'lg:col-span-5 lg:col-start-2',
  },
  {
    icon: 'PS',
    title: 'Personal Service',
    text: 'Direct communication, styling guidance, and support from order enquiry to delivery.',
    className: 'lg:col-span-5',
  },
]

function CollectionCard({ collection, index }) {
  return (
    <motion.article
      className={`group relative min-h-[360px] cursor-pointer overflow-hidden rounded-[1.75rem] border border-white/10 bg-black shadow-[0_28px_90px_rgba(0,0,0,0.36)] transition duration-500 hover:border-[rgba(190,151,83,0.78)] hover:shadow-[0_30px_100px_rgba(190,151,83,0.16)] sm:min-h-[430px] ${collection.className}`}
      initial="hidden"
      transition={{ duration: 0.75, ease: 'easeOut', delay: index * 0.08 }}
      variants={sectionVariants}
      viewport={{ once: true, amount: 0.25 }}
      whileInView="visible"
    >
      <img
        alt={`${collection.title} collection`}
        className={`absolute inset-0 h-full w-full object-cover ${collection.imagePosition} transition duration-700 ease-out group-hover:scale-[1.025]`}
        loading="lazy"
        src={collection.image}
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.78),rgba(0,0,0,0.22)_54%,rgba(0,0,0,0.04))]" />
      <div className="absolute inset-x-5 top-5 flex items-center justify-between border-t border-[rgba(190,151,83,0.45)] pt-4 text-[10px] uppercase tracking-[0.3em] text-[var(--color-gold)] sm:inset-x-7">
        <span>Collection</span>
        <span>{String(index + 1).padStart(2, '0')}</span>
      </div>
      <div className="absolute inset-x-5 bottom-5 z-10 rounded-[1.25rem] border border-white/10 bg-black/32 p-5 backdrop-blur-md transition duration-500 group-hover:-translate-y-1 group-hover:border-[rgba(190,151,83,0.42)] sm:inset-x-7 sm:bottom-7 sm:p-6">
        <h3 className="font-serif text-3xl leading-tight text-white sm:text-4xl">
          {collection.title}
        </h3>
        <p className="mt-3 max-w-xl text-sm leading-7 text-white/72">{collection.description}</p>
        <Button className="mt-6 px-5 py-2.5 text-xs" to="/shop" variant="outline">
          View Collection
        </Button>
      </div>
    </motion.article>
  )
}

function StoryStat({ stat }) {
  return (
    <div className="border-t border-[rgba(190,151,83,0.38)] pt-4">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-gold)]">
        {stat.number}
      </p>
      <p className="mt-3 text-sm font-medium uppercase tracking-[0.16em] text-white/82">
        {stat.label}
      </p>
    </div>
  )
}

function FeatureCard({ feature, index }) {
  return (
    <motion.article
      className={`group relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-[rgba(255,255,255,0.045)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-md transition duration-500 hover:-translate-y-1 hover:border-[rgba(190,151,83,0.62)] hover:bg-[rgba(243,234,217,0.08)] hover:shadow-[0_28px_90px_rgba(190,151,83,0.13)] sm:p-7 ${feature.className}`}
      initial={{ opacity: 0, y: 26 }}
      transition={{ duration: 0.7, ease: 'easeOut', delay: index * 0.07 }}
      viewport={{ once: true, amount: 0.25 }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(190,151,83,0.55)] to-transparent opacity-60" />
      <div className="flex size-14 items-center justify-center rounded-full border border-[rgba(190,151,83,0.5)] bg-[rgba(190,151,83,0.1)] text-sm font-semibold tracking-[0.18em] text-[var(--color-gold)] transition duration-500 group-hover:border-[rgba(215,179,107,0.9)] group-hover:bg-[rgba(190,151,83,0.16)]">
        {feature.icon}
      </div>
      <h3 className="mt-8 font-serif text-2xl leading-tight text-white sm:text-3xl">
        {feature.title}
      </h3>
      <p className="mt-4 text-sm leading-7 text-[var(--color-muted)] sm:text-base">
        {feature.text}
      </p>
    </motion.article>
  )
}

function Home() {
  return (
    <>
    <section className="relative isolate min-h-[calc(100svh-81px)] overflow-hidden bg-black px-5 py-14 text-white sm:px-8 sm:py-16 lg:px-10 lg:py-5">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_20%,rgba(190,151,83,0.18),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.06),transparent_34%)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-[rgba(190,151,83,0.12)] to-transparent" />

      <div className="mx-auto grid min-h-[calc(100svh-210px)] max-w-7xl items-center gap-14 lg:grid-cols-[1.02fr_0.98fr]">
        <motion.div
          animate="visible"
          className="max-w-3xl"
          initial="hidden"
          transition={{ duration: 0.8, ease: 'easeOut', staggerChildren: 0.12 }}
        >
          <motion.p
            className="mb-6 text-xs font-semibold uppercase tracking-[0.36em] text-[var(--color-gold)]"
            variants={fadeUp}
          >
            UK Based &bull; Worldwide Delivery &bull; Bespoke & Ready to Wear
          </motion.p>

          <motion.h1
            className="font-serif text-4xl leading-[1.02] tracking-[-0.03em] text-[var(--color-soft-white)] sm:text-6xl lg:text-7xl xl:text-8xl"
            variants={fadeUp}
          >
            <span className="block">Luxury African Fashion.</span>
          </motion.h1>

          <motion.p
            className="mt-7 max-w-2xl text-base leading-8 text-[var(--color-muted)] sm:text-lg"
            variants={fadeUp}
          >
            Nebeda Threads creates elegant men&rsquo;s and women&rsquo;s garments that celebrate African
            heritage with a modern luxury finish.
          </motion.p>

          <motion.div className="mt-9 flex flex-col gap-4 sm:flex-row" variants={fadeUp}>
            <Button to="/shop" variant="primary">
              Shop Collection
            </Button>
            <Button to="/custom-order" variant="outline">
              Start Custom Order
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          animate={{ opacity: 1, x: 0 }}
          className="relative mx-auto h-[440px] w-full max-w-[560px] sm:h-[520px] lg:h-[620px]"
          initial={{ opacity: 0, x: 34 }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: 0.18 }}
        >
          <div className="group absolute left-4 top-8 h-[72%] w-[58%] overflow-hidden rounded-t-full rounded-b-[1.75rem] border border-[rgba(190,151,83,0.48)] bg-black p-3 shadow-[0_34px_90px_rgba(0,0,0,0.42)] transition duration-500 hover:border-[rgba(215,179,107,0.84)] hover:shadow-[0_34px_95px_rgba(190,151,83,0.22)]">
            <div className="relative flex h-full items-end overflow-hidden rounded-t-full rounded-b-[1.25rem] border border-white/10 p-5">
              <img
                alt="Nebeda Threads heritage silhouette fashion editorial"
                className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
                loading="lazy"
                src={heritageImage}
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.75),rgba(0,0,0,0.15))]" />
              <div className="relative z-10">
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-gold)]">Editorial</p>
                <p className="mt-2 font-serif text-3xl leading-tight text-white">Heritage Essence</p>
                <p className="mt-3 max-w-[15rem] text-sm leading-6 text-white/72">
                  African luxury, redefined.
                </p>
              </div>
            </div>
          </div>

          <div className="group absolute bottom-6 right-0 h-[64%] w-[54%] overflow-hidden rounded-[1.5rem] border border-white/12 bg-[var(--color-cream)] p-3 text-white shadow-[0_28px_80px_rgba(0,0,0,0.38)] transition duration-500 hover:border-[rgba(215,179,107,0.72)] hover:shadow-[0_30px_90px_rgba(190,151,83,0.24)]">
            <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[1rem] border border-[rgba(190,151,83,0.28)] p-5">
              <img
                alt="Nebeda Threads made for presence fashion editorial"
                className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
                loading="lazy"
                src={presenceImage}
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.75),rgba(0,0,0,0.15))]" />
              <p className="relative z-10 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-gold)]">
                Bespoke
              </p>
              <div className="relative z-10">
                <p className="font-serif text-4xl leading-none">Made for Presence</p>
                <p className="mt-4 text-sm leading-6 text-white/72">
                  Designed to command attention with elegance and confidence.
                </p>
              </div>
            </div>
          </div>

        </motion.div>
      </div>
    </section>

    <section id="signature-collections" className="relative overflow-hidden bg-black px-5 py-20 text-white sm:px-8 lg:px-10 lg:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_12%,rgba(190,151,83,0.14),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.035),transparent_28%)]" />
      <div className="relative mx-auto max-w-7xl">
        <motion.div
          className="mb-12 flex max-w-4xl flex-col gap-5 lg:mb-16"
          initial="hidden"
          transition={{ duration: 0.75, ease: 'easeOut' }}
          variants={sectionVariants}
          viewport={{ once: true, amount: 0.35 }}
          whileInView="visible"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--color-gold)]">
            Nebeda Threads
          </p>
          <h2 className="font-serif text-4xl leading-tight text-[var(--color-soft-white)] sm:text-5xl lg:text-6xl">
            Signature Collections
          </h2>
          <p className="max-w-2xl text-base leading-8 text-[var(--color-muted)] sm:text-lg">
            Discover luxury African fashion designed for modern elegance, cultural pride, and
            timeless confidence.
          </p>
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-12 lg:items-stretch">
          {collections.map((collection, index) => (
            <CollectionCard collection={collection} index={index} key={collection.title} />
          ))}
        </div>
      </div>
    </section>

    <section className="relative overflow-hidden bg-[var(--color-black)] px-5 py-20 text-white sm:px-8 md:py-24 lg:px-10 lg:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_22%,rgba(190,151,83,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.025),transparent_36%)]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 2xl:max-w-[1500px]">
        <motion.div
          className="max-w-3xl"
          initial={{ opacity: 0, x: -28 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          viewport={{ once: true, amount: 0.3 }}
          whileInView={{ opacity: 1, x: 0 }}
        >
          <div className="mb-7 h-px w-20 bg-[var(--color-gold)]" />
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--color-gold)]">
            OUR STORY
          </p>
          <h2 className="mt-5 max-w-3xl font-serif text-4xl leading-tight text-[var(--color-soft-white)] sm:text-5xl lg:text-6xl">
            Designed with Purpose. Crafted with Excellence.
          </h2>

          <div className="mt-8 space-y-6 text-base leading-8 text-[var(--color-muted)] sm:text-lg">
            <p>
              Nebeda Threads was founded to celebrate the richness of African heritage through
              modern luxury fashion.
            </p>
            <p>
              Every garment represents culture, confidence, craftsmanship, and individuality. We
              believe clothing should do more than look beautiful. It should tell a story, create
              presence, and leave a lasting impression.
            </p>
            <p>
              From bespoke creations to ready-to-wear collections, every piece is designed with
              attention to detail, premium fabrics, and a commitment to excellence.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {storyStats.map((stat) => (
              <StoryStat key={stat.number} stat={stat} />
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button to="/about" variant="primary">
              About Nebeda
            </Button>
            <Button to="/custom-order" variant="outline">
              Custom Order
            </Button>
          </div>
        </motion.div>

        <motion.div
          className="relative min-h-[420px] overflow-hidden rounded-[1.75rem] border border-[rgba(190,151,83,0.42)] bg-black p-3 shadow-[0_30px_100px_rgba(0,0,0,0.42)] sm:min-h-[520px] lg:min-h-[680px]"
          initial={{ opacity: 0, x: 30 }}
          transition={{ duration: 0.85, ease: 'easeOut', delay: 0.08 }}
          viewport={{ once: true, amount: 0.25 }}
          whileInView={{ opacity: 1, x: 0 }}
        >
          <div className="group relative h-full min-h-[396px] overflow-hidden rounded-[1.25rem] border border-white/10 sm:min-h-[496px] lg:min-h-[656px]">
            <img
              alt="Nebeda Threads brand story editorial"
              className="absolute inset-0 h-full w-full object-cover object-[center_18%] transition duration-700 ease-out group-hover:scale-[1.025]"
              loading="lazy"
              src={brandStoryImage}
            />
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.56),rgba(0,0,0,0.08)_58%,rgba(0,0,0,0.02))]" />
            <div className="absolute bottom-5 left-5 right-5 border-t border-[rgba(190,151,83,0.48)] pt-4 sm:bottom-7 sm:left-7 sm:right-7">
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-gold)]">
                Culture. Confidence. Craft.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>

    <section className="relative overflow-hidden bg-black px-5 py-20 text-white sm:px-8 md:py-24 lg:px-10 lg:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(190,151,83,0.13),transparent_30%),linear-gradient(180deg,rgba(243,234,217,0.035),transparent_34%)]" />
      <div className="relative mx-auto max-w-7xl 2xl:max-w-[1500px]">
        <motion.div
          className="mx-auto mb-12 max-w-4xl text-center lg:mb-16"
          initial={{ opacity: 0, y: 28 }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
          viewport={{ once: true, amount: 0.35 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--color-gold)]">
            WHY NEBEDA
          </p>
          <h2 className="mt-5 font-serif text-4xl leading-tight text-[var(--color-soft-white)] sm:text-5xl lg:text-6xl">
            Luxury Is in the Details
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-[var(--color-muted)] sm:text-lg">
            From fabric selection to final delivery, every Nebeda Threads piece is handled with
            care, precision, and a commitment to excellence.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-12 lg:gap-6">
          {nebedaFeatures.map((feature, index) => (
            <FeatureCard feature={feature} index={index} key={feature.title} />
          ))}
        </div>
      </div>
    </section>

    <section className="relative overflow-hidden bg-black px-5 py-20 text-white sm:px-8 md:py-24 lg:px-10 lg:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(190,151,83,0.12),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.026),transparent_34%)]" />
      <div className="relative mx-auto max-w-7xl 2xl:max-w-[1500px]">
        <motion.div
          className="mb-12 flex flex-col gap-6 lg:mb-16 lg:flex-row lg:items-end lg:justify-between"
          initial={{ opacity: 0, y: 28 }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
          viewport={{ once: true, amount: 0.35 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--color-gold)]">
              FOLLOW THE STYLE
            </p>
            <h2 className="mt-5 font-serif text-4xl leading-tight text-[var(--color-soft-white)] sm:text-5xl lg:text-6xl">
              Follow Our Journey
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--color-muted)] sm:text-lg">
              See the latest Nebeda Threads collections, bespoke creations, customer styles, and
              behind the scenes craftsmanship.
            </p>
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-gold)]">
              {instagramHandle}
            </p>
          </div>
          <Button
            className="w-full sm:w-fit"
            href={instagramUrl}
            rel="noreferrer"
            target="_blank"
            variant="outline"
          >
            Follow on Instagram
          </Button>
        </motion.div>

        <InstagramFeed />
      </div>
    </section>

    <section className="relative overflow-hidden bg-black px-5 pb-20 text-white sm:px-8 md:pb-24 lg:px-10 lg:pb-32">
      <div className="mx-auto mb-12 max-w-7xl 2xl:max-w-[1500px]">
        <NewsletterSignup source="Home" />
      </div>
      <motion.div
        className="relative mx-auto max-w-7xl overflow-hidden rounded-[1.75rem] border border-[rgba(190,151,83,0.4)] bg-[linear-gradient(135deg,rgba(243,234,217,0.1),rgba(255,255,255,0.035))] px-6 py-12 shadow-[0_30px_100px_rgba(0,0,0,0.34)] sm:px-10 lg:px-14 2xl:max-w-[1500px]"
        initial={{ opacity: 0, y: 28 }}
        transition={{ duration: 0.75, ease: 'easeOut' }}
        viewport={{ once: true, amount: 0.35 }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_20%,rgba(190,151,83,0.18),transparent_30%)]" />
        <div className="relative max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-gold)]">
            Bespoke Service
          </p>
          <h2 className="mt-4 font-serif text-3xl leading-tight text-white sm:text-5xl">
            Ready to Create Your Nebeda Piece?
          </h2>
          <p className="mt-5 text-base leading-8 text-[var(--color-muted)] sm:text-lg">
            Start a custom order and let Nebeda Threads design a garment around your style,
            measurements, fabric choice, and occasion.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Button to="/custom-order" variant="primary">
              Start Custom Order
            </Button>
            <Button to="/shop" variant="outline">
              Shop Collection
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
    </>
  )
}

export default Home
