import { motion } from 'framer-motion'

function DashboardCard({ label, value, index }) {
  return (
    <motion.article
      className="rounded-[1.25rem] border border-white/10 bg-[rgba(255,255,255,0.045)] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.28)] transition duration-500 hover:-translate-y-1 hover:border-[rgba(190,151,83,0.58)] hover:bg-[rgba(243,234,217,0.075)] sm:p-6"
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.55, ease: 'easeOut', delay: index * 0.05 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-gold)]">
        {label}
      </p>
      <p className="mt-5 font-serif text-4xl leading-none text-white">{value}</p>
    </motion.article>
  )
}

export default DashboardCard
