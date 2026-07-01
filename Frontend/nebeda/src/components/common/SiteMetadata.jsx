import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SITE_URL = 'https://nebedathreads.co.uk'

const pageMetadata = {
  '/': {
    title: 'Nebeda Threads | Luxury African Fashion',
    description: 'Discover luxury African fashion for men and women, crafted in the United Kingdom and delivered worldwide.',
  },
  '/shop': {
    title: 'Shop Luxury African Fashion | Nebeda Threads',
    description: 'Shop Nebeda Threads ready-to-wear, bespoke, and wedding collections for men and women.',
  },
  '/custom-order': {
    title: 'Custom African Fashion Orders | Nebeda Threads',
    description: 'Request a bespoke Nebeda Threads garment designed around your style, measurements, and occasion.',
  },
  '/about': {
    title: 'About Nebeda Threads',
    description: 'Learn about Nebeda Threads, a UK-based luxury African fashion brand founded by Benjamen Oyekan.',
  },
  '/contact': {
    title: 'Contact Nebeda Threads',
    description: 'Contact Nebeda Threads about orders, delivery, collaborations, and styling enquiries.',
  },
  '/shipping-information': {
    title: 'Shipping Information | Nebeda Threads',
    description: 'Review Nebeda Threads UK, European, USA, Canada, and worldwide delivery information.',
  },
  '/privacy-policy': {
    title: 'Privacy Policy | Nebeda Threads',
    description: 'Read the Nebeda Threads privacy policy.',
  },
  '/terms': {
    title: 'Terms | Nebeda Threads',
    description: 'Read the Nebeda Threads website and order terms.',
  },
  '/shipping-returns': {
    title: 'Shipping and Returns | Nebeda Threads',
    description: 'Review Nebeda Threads shipping and returns guidance.',
  },
}

function setMeta(selector, attribute, value, content) {
  let element = document.head.querySelector(selector)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, value)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function SiteMetadata() {
  const { pathname } = useLocation()

  useEffect(() => {
    const normalizedPath = pathname !== '/' ? pathname.replace(/\/$/, '') : '/'
    const metadata = pageMetadata[normalizedPath]
    const canonicalUrl = new URL(metadata ? normalizedPath : '/', SITE_URL).toString()
    const title = metadata?.title || 'Nebeda Threads'
    const description = metadata?.description || 'Luxury African fashion crafted for identity, elegance, and confidence.'
    const shouldIndex = Boolean(metadata)

    document.title = title

    let canonical = document.head.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', canonicalUrl)

    setMeta('meta[name="description"]', 'name', 'description', description)
    setMeta('meta[name="robots"]', 'name', 'robots', shouldIndex ? 'index, follow' : 'noindex, nofollow')
    setMeta('meta[property="og:title"]', 'property', 'og:title', title)
    setMeta('meta[property="og:description"]', 'property', 'og:description', description)
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl)
    setMeta('meta[property="og:type"]', 'property', 'og:type', 'website')
    setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', 'Nebeda Threads')
    setMeta('meta[property="og:image"]', 'property', 'og:image', `${SITE_URL}/logo.png`)
    setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image')
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title)
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description)
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', `${SITE_URL}/logo.png`)
  }, [pathname])

  return null
}

export { SITE_URL }
export default SiteMetadata
