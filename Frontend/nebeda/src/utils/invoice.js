import logoUrl from '../assets/images/logo.png'
import formatOrderReference from './orderReference'

const website = 'https://nebedathreads.co.uk'
const supportEmail = 'support@nebedathreads.co.uk'
const whatsapp = '+447448668759'

function formatAmount(value, currency = 'GBP') {
  return new Intl.NumberFormat(currency === 'EUR' ? 'en-IE' : 'en-GB', {
    style: 'currency',
    currency: currency === 'EUR' ? 'EUR' : 'GBP',
  }).format(Number(value || 0))
}

function formatDate(value) {
  return value ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' }).format(new Date(value)) : 'Not set'
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character])
}

function getVariation(item) {
  return [item.selectedColour && `Colour: ${item.selectedColour}`, item.selectedSize && `Size: ${item.selectedSize}`].filter(Boolean).join(' / ')
}

function getAddress(shipping = {}) {
  return [shipping.addressLine1, shipping.addressLine2, shipping.city, shipping.stateCounty, shipping.postcode, shipping.country].filter(Boolean).join(' / ')
}

function getInvoiceRows(order) {
  return (order.items || []).map((item) => ({
    name: item.name,
    variation: getVariation(item),
    quantity: item.quantity,
    unitPrice: item.priceAmount ?? item.numericPrice,
    subtotal: item.subtotal,
  }))
}

function printInvoice(order, { admin = false } = {}) {
  const printWindow = window.open('', '_blank')
  if (!printWindow) throw new Error('Allow pop-ups to open the printable invoice.')
  printWindow.opener = null
  const reference = formatOrderReference(order._id)
  const rows = getInvoiceRows(order).map((item) => `<tr><td><strong>${escapeHtml(item.name)}</strong>${item.variation ? `<small>${escapeHtml(item.variation)}</small>` : ''}</td><td>${item.quantity}</td><td>${formatAmount(item.unitPrice, order.currency)}</td><td>${formatAmount(item.subtotal, order.currency)}</td></tr>`).join('')
  const adminPayment = admin ? `<section><h2>Payment Reference</h2><p>Stripe session: ${escapeHtml(order.stripeSessionId || 'Not set')}<br>Payment intent: ${escapeHtml(order.paymentIntentId || 'Not set')}</p></section>` : ''

  printWindow.document.write(`<!doctype html><html><head><title>${reference} Invoice</title><style>
  body{font-family:Arial,sans-serif;color:#17130d;margin:36px;line-height:1.5}header{display:flex;justify-content:space-between;gap:24px;border-bottom:2px solid #b89450;padding-bottom:20px}header img{width:100px;object-fit:contain}h1,h2{font-family:Georgia,serif}h1{margin:0}.muted,small{color:#665f54}small{display:block;margin-top:3px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin:24px 0}table{border-collapse:collapse;width:100%}th,td{border-bottom:1px solid #ddd;padding:12px 6px;text-align:left}th:nth-child(n+2),td:nth-child(n+2){text-align:right}.totals{margin:24px 0 0 auto;max-width:330px}.totals p{display:flex;justify-content:space-between;border-bottom:1px solid #eee;padding:8px 0}.total{font-size:18px;font-weight:700}footer{border-top:1px solid #ddd;margin-top:36px;padding-top:18px;font-size:12px;color:#665f54}@media(max-width:650px){body{margin:18px}.grid{grid-template-columns:1fr}table{font-size:12px}}@media print{body{margin:12mm}}
  </style></head><body><header><div><img src="${logoUrl}" alt="Nebeda Threads"><p class="muted">${website}<br>${supportEmail}<br>${whatsapp}</p></div><div><h1>Invoice</h1><p><strong>${reference}</strong><br>${formatDate(order.createdAt)}</p></div></header><div class="grid"><section><h2>Customer</h2><p>${escapeHtml(order.customer?.fullName)}<br>${escapeHtml(order.customer?.email)}</p></section><section><h2>Delivery</h2><p>${escapeHtml(getAddress(order.shipping))}<br>${escapeHtml(order.shipping?.shippingMethod || 'Not set')}</p></section></div><p><strong>Payment:</strong> ${escapeHtml(order.paymentStatus)} &nbsp; <strong>Order:</strong> ${escapeHtml(order.orderStatus)}</p><table><thead><tr><th>Item</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table><div class="totals"><p><span>Subtotal</span><strong>${formatAmount(order.totals?.subtotal, order.currency)}</strong></p><p><span>Shipping</span><strong>${formatAmount(order.totals?.deliveryFee, order.currency)}</strong></p><p class="total"><span>${order.paymentStatus === 'Paid' ? 'Total paid' : 'Order total'}</span><strong>${formatAmount(order.totals?.total, order.currency)}</strong></p></div>${adminPayment}<footer>Thank you for choosing Nebeda Threads. For order support, contact ${supportEmail} or WhatsApp ${whatsapp}.</footer><script>window.onload=()=>window.print()</script></body></html>`)
  printWindow.document.close()
}

async function imageToDataUrl(url) {
  const response = await fetch(url)
  const blob = await response.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

async function downloadInvoicePdf(order, { admin = false } = {}) {
  const { jsPDF } = await import('jspdf')
  const document = new jsPDF({ unit: 'mm', format: 'a4' })
  const width = document.internal.pageSize.getWidth()
  const reference = formatOrderReference(order._id)
  let y = 18
  try {
    document.addImage(await imageToDataUrl(logoUrl), 'PNG', 18, y, 28, 15, undefined, 'FAST')
  } catch {
    document.setFont('helvetica', 'bold'); document.text('NEBEDA THREADS', 18, y + 8)
  }
  document.setFont('helvetica', 'bold'); document.setFontSize(20); document.text('Invoice', width - 18, y + 7, { align: 'right' })
  document.setFont('helvetica', 'normal'); document.setFontSize(9); document.text([website, supportEmail, whatsapp], 18, y + 22); document.text([reference, formatDate(order.createdAt)], width - 18, y + 22, { align: 'right' })
  y += 42; document.setDrawColor(184, 148, 80); document.line(18, y, width - 18, y); y += 9
  document.setFont('helvetica', 'bold'); document.text('Customer', 18, y); document.text('Delivery', 106, y)
  document.setFont('helvetica', 'normal'); y += 6
  document.text(document.splitTextToSize(`${order.customer?.fullName || ''}\n${order.customer?.email || ''}`, 75), 18, y)
  document.text(document.splitTextToSize(`${getAddress(order.shipping)}\n${order.shipping?.shippingMethod || 'Not set'}`, 82), 106, y)
  y += 25; document.setFont('helvetica', 'bold'); document.text('Items', 18, y); y += 7
  document.setFontSize(9)
  for (const item of getInvoiceRows(order)) {
    if (y > 260) { document.addPage(); y = 18 }
    document.setFont('helvetica', 'bold'); document.text(item.name, 18, y)
    document.setFont('helvetica', 'normal'); if (item.variation) document.text(item.variation, 18, y + 4)
    document.text(String(item.quantity), 120, y, { align: 'right' })
    document.text(formatAmount(item.unitPrice, order.currency), 150, y, { align: 'right' })
    document.text(formatAmount(item.subtotal, order.currency), width - 18, y, { align: 'right' })
    y += item.variation ? 11 : 8
  }
  y += 4; document.line(110, y, width - 18, y); y += 7
  const totals = [['Subtotal', order.totals?.subtotal], ['Shipping', order.totals?.deliveryFee], [order.paymentStatus === 'Paid' ? 'Total paid' : 'Order total', order.totals?.total]]
  totals.forEach(([label, value]) => { document.text(label, 120, y); document.text(formatAmount(value, order.currency), width - 18, y, { align: 'right' }); y += 7 })
  if (admin) { y += 5; document.setFont('helvetica', 'bold'); document.text('Admin payment reference', 18, y); y += 6; document.setFont('helvetica', 'normal'); document.text(document.splitTextToSize(`Stripe session: ${order.stripeSessionId || 'Not set'}\nPayment intent: ${order.paymentIntentId || 'Not set'}`, width - 36), 18, y) }
  document.setFontSize(8); document.text(`Thank you for choosing Nebeda Threads. Support: ${supportEmail} | ${whatsapp}`, 18, 288)
  document.save(`${reference}-invoice.pdf`)
}

export { downloadInvoicePdf, printInvoice }
