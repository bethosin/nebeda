import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import AdminSidebar from './AdminSidebar'
import AdminTopbar from './AdminTopbar'

function AdminLayout({ children, subtitle }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white lg:flex">
      <div className="hidden lg:block lg:min-h-screen lg:w-72 lg:shrink-0">
        <AdminSidebar />
      </div>

      <AnimatePresence>
        {isSidebarOpen ? (
          <>
            <motion.button
              aria-label="Close admin menu"
              className="fixed inset-0 z-40 bg-black/70 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              type="button"
            />
            <motion.div
              className="fixed inset-y-0 left-0 z-50 w-[min(82vw,20rem)] lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              <AdminSidebar onNavigate={() => setIsSidebarOpen(false)} />
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      <div className="min-w-0 flex-1">
        <AdminTopbar onMenuClick={() => setIsSidebarOpen(true)} subtitle={subtitle} />
        <section className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-7xl 2xl:max-w-[1500px]">{children}</div>
        </section>
      </div>
    </main>
  )
}

export default AdminLayout
