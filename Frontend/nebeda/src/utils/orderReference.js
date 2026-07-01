function formatOrderReference(id, prefix = 'NT') {
  if (!id) return `${prefix}-PENDING`
  return `${prefix}-${String(id).slice(-8).toUpperCase()}`
}

export default formatOrderReference
