import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Button from '../components/ui/Button'
import { useToast } from '../components/ui/toastContext'
import { createCustomOrder } from '../services/customOrderService'
import logEmailWarning from '../utils/emailDiagnostics'
import { getWhatsAppMessageLink } from '../data/contactDetails'

const processSteps = [
  {
    number: '01',
    title: 'Share Your Style',
    text: 'Tell us the outfit type, fabric, and occasion.',
  },
  {
    number: '02',
    title: 'Submit Measurements',
    text: 'Provide your size details or request measurement guidance.',
  },
  {
    number: '03',
    title: 'Confirm Design',
    text: 'Nebeda Threads reviews your request and confirms details.',
  },
  {
    number: '04',
    title: 'Secure Payment',
    text: 'Proceed with payment once your order details are agreed.',
  },
]

const selectOptions = {
  gender: ['Men', 'Women', 'Couple'],
  outfitType: [
    'Senator Wear',
    'Agbada',
    'Kaftan',
    'Two Pieces',
    'Bubu',
    'Ankara Dress',
    'Aso Oke',
    'Wedding Outfit',
    'Other',
  ],
  orderType: ['Ready to Wear', 'Bespoke', 'Wedding'],
  fabricPreference: ['Ankara', 'Aso Oke', 'Lace', 'Senator Fabric', 'Plain Fabric', 'I need guidance'],
  occasion: ['Wedding', 'Birthday', 'Church', 'Engagement', 'Graduation', 'Casual Luxury', 'Other'],
  shippingCountry: ['United Kingdom', 'Nigeria', 'Other'],
}

const shippingMethods = {
  'United Kingdom': ['UK Standard Delivery', 'UK Express Delivery'],
  Nigeria: ['Nigeria Standard Delivery', 'Nigeria Express Delivery'],
  Other: ['Worldwide Delivery Enquiry'],
}

const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const maxInspirationImages = 3
const maxImageSize = 5 * 1024 * 1024
const whatsappHelpLink = getWhatsAppMessageLink(
  'Hello Nebeda Threads, I need help with a custom order.',
)

const requiredFields = [
  'fullName',
  'email',
  'whatsappNumber',
  'gender',
  'outfitType',
  'orderType',
  'shippingCountry',
  'addressLine1',
  'city',
  'country',
]

const initialFormData = {
  fullName: '',
  email: '',
  whatsappNumber: '',
  gender: '',
  outfitType: '',
  orderType: '',
  fabricPreference: '',
  occasion: '',
  chestBust: '',
  waist: '',
  hip: '',
  shoulder: '',
  sleeveLength: '',
  topLength: '',
  trouserSkirtLength: '',
  height: '',
  additionalNotes: '',
  shippingCountry: '',
  shippingMethod: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  stateCounty: '',
  postcode: '',
  country: '',
  inspirationImages: [],
  styleNotes: '',
}

const fieldLabels = {
  fullName: 'Full Name',
  email: 'Email Address',
  whatsappNumber: 'WhatsApp Number',
  gender: 'Gender',
  outfitType: 'Outfit Type',
  orderType: 'Order Type',
  shippingCountry: 'Shipping Country',
  addressLine1: 'Address Line 1',
  city: 'City',
  country: 'Country',
}

function TextField({
  error,
  label,
  name,
  onChange,
  placeholder,
  required = false,
  type = 'text',
  value,
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-gold)]">
        {label}
        {required ? ' *' : ''}
      </span>
      <input
        className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition placeholder:text-white/32 focus:border-[var(--color-gold)]"
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        value={value}
      />
      {error ? <p className="mt-2 text-sm text-[var(--color-gold-light)]">{error}</p> : null}
    </label>
  )
}

function SelectField({ error, label, name, onChange, options, required = false, value }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-gold)]">
        {label}
        {required ? ' *' : ''}
      </span>
      <select
        className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition focus:border-[var(--color-gold)]"
        name={name}
        onChange={onChange}
        value={value}
      >
        <option className="bg-black text-white" value="">
          Select {label.toLowerCase()}
        </option>
        {options.map((option) => (
          <option className="bg-black text-white" key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error ? <p className="mt-2 text-sm text-[var(--color-gold-light)]">{error}</p> : null}
    </label>
  )
}

function TextAreaField({ label, name, onChange, placeholder, value }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-gold)]">
        {label}
      </span>
      <textarea
        className="mt-3 min-h-36 w-full resize-y rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition placeholder:text-white/32 focus:border-[var(--color-gold)]"
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        value={value}
      />
    </label>
  )
}

function ProcessCard({ step, index }) {
  return (
    <motion.article
      className="rounded-[1.5rem] border border-white/10 bg-[rgba(255,255,255,0.045)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] transition duration-500 hover:-translate-y-1 hover:border-[rgba(190,151,83,0.62)] hover:bg-[rgba(243,234,217,0.08)]"
      initial={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.65, ease: 'easeOut', delay: index * 0.07 }}
      viewport={{ once: true, amount: 0.25 }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <div className="grid size-14 place-items-center rounded-full border border-[rgba(190,151,83,0.55)] bg-[rgba(190,151,83,0.1)] text-sm font-semibold tracking-[0.18em] text-[var(--color-gold)]">
        {step.number}
      </div>
      <h3 className="mt-8 font-serif text-2xl leading-tight text-white">{step.title}</h3>
      <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">{step.text}</p>
    </motion.article>
  )
}

function CustomOrder() {
  const { showToast } = useToast()
  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState({})
  const [successOrder, setSuccessOrder] = useState(null)
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const availableShippingMethods = useMemo(() => {
    if (!formData.shippingCountry) return []
    return shippingMethods[formData.shippingCountry] || shippingMethods.Other
  }, [formData.shippingCountry])

  const imagePreviews = useMemo(
    () =>
      formData.inspirationImages.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    [formData.inspirationImages],
  )

  useEffect(
    () => () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url))
    },
    [imagePreviews],
  )

  const updateField = (event) => {
    const { name, value, files } = event.target

    if (name === 'inspirationImages') {
      const selectedFiles = Array.from(files || [])
      event.target.value = ''

      if (!selectedFiles.length) return

      if (formData.inspirationImages.length + selectedFiles.length > maxInspirationImages) {
        showToast({ message: 'You can upload up to 3 inspiration images.', type: 'error' })
        return
      }

      const invalidFile = selectedFiles.find((file) => !allowedImageTypes.includes(file.type))
      if (invalidFile) {
        showToast({ message: 'Only JPG, PNG, and WebP inspiration images are allowed.', type: 'error' })
        return
      }

      const oversizedFile = selectedFiles.find((file) => file.size > maxImageSize)
      if (oversizedFile) {
        showToast({ message: 'Each inspiration image must be 5MB or smaller.', type: 'error' })
        return
      }

      setFormData((current) => ({
        ...current,
        inspirationImages: [...current.inspirationImages, ...selectedFiles],
      }))
      setSubmitError('')
      setSuccessOrder(null)
      return
    }

    setFormData((current) => {
      const next = { ...current, [name]: value }

      if (name === 'shippingCountry') {
        next.shippingMethod = shippingMethods[value]?.[0] || ''
        if (value === 'United Kingdom') next.country = 'United Kingdom'
        if (value === 'Nigeria') next.country = 'Nigeria'
      }

      return next
    })

    setErrors((current) => ({ ...current, [name]: '' }))
    setSuccessOrder(null)
    setSubmitError('')
  }

  const removeInspirationImage = (indexToRemove) => {
    setFormData((current) => ({
      ...current,
      inspirationImages: current.inspirationImages.filter((_, index) => index !== indexToRemove),
    }))
  }

  const validateForm = () => {
    const nextErrors = {}

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        nextErrors[field] = `${fieldLabels[field]} is required.`
      }
    })

    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      nextErrors.email = 'Please enter a valid email address.'
    }

    setErrors(nextErrors)
    const isValid = Object.keys(nextErrors).length === 0

    if (!isValid) {
      showToast({ message: 'Please complete the required fields before submitting.', type: 'error' })
    }

    return isValid
  }

  const buildCustomOrderFormData = () => {
    const requestData = new FormData()
    const measurements = {
      chestBust: formData.chestBust,
      waist: formData.waist,
      hip: formData.hip,
      shoulder: formData.shoulder,
      sleeveLength: formData.sleeveLength,
      topLength: formData.topLength,
      trouserSkirtLength: formData.trouserSkirtLength,
      height: formData.height,
      additionalNotes: formData.additionalNotes,
    }
    const shipping = {
      shippingCountry: formData.shippingCountry,
      shippingMethod: formData.shippingMethod,
      addressLine1: formData.addressLine1,
      addressLine2: formData.addressLine2,
      city: formData.city,
      stateCounty: formData.stateCounty,
      postcode: formData.postcode,
      country: formData.country,
    }

    requestData.append('fullName', formData.fullName)
    requestData.append('email', formData.email)
    requestData.append('whatsappNumber', formData.whatsappNumber)
    requestData.append('gender', formData.gender)
    requestData.append('outfitType', formData.outfitType)
    requestData.append('orderType', formData.orderType)
    requestData.append('fabricPreference', formData.fabricPreference)
    requestData.append('occasion', formData.occasion)
    requestData.append('styleNotes', formData.styleNotes)
    requestData.append('measurements', JSON.stringify(measurements))
    requestData.append('shipping', JSON.stringify(shipping))

    formData.inspirationImages.forEach((file) => {
      requestData.append('inspirationImages', file)
    })

    return requestData
  }

  const handleSubmitCustomOrder = async (event) => {
    event.preventDefault()

    if (!validateForm()) {
      setSuccessOrder(null)
      setSubmitError('')
      return
    }

    setIsSubmitting(true)
    setSubmitError('')
    setSuccessOrder(null)

    try {
      const data = await createCustomOrder(buildCustomOrderFormData())
      setSuccessOrder(data.order || data.data || null)
      showToast({ message: 'Your custom order request has been submitted.', type: 'success' })
      logEmailWarning(data, 'Custom order')
      setFormData(initialFormData)
    } catch (apiError) {
      const errorMessage = apiError.message || 'Unable to submit your custom order request.'
      setSubmitError(errorMessage)
      showToast({ message: errorMessage, type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const showPaymentComingSoon = () => {
    showToast({
      message: 'Payment will be available after your custom order is reviewed.',
      type: 'info',
    })
  }

  return (
    <main className="overflow-hidden bg-black text-white">
      <section className="relative px-5 py-20 sm:px-8 md:py-24 lg:px-10 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(190,151,83,0.16),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.035),transparent_34%)]" />
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="relative mx-auto max-w-7xl 2xl:max-w-[1500px]"
          initial={{ opacity: 0, y: 28 }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
        >
          <div className="mb-7 h-px w-20 bg-[var(--color-gold)]" />
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--color-gold)]">
            CUSTOM ORDER
          </p>
          <h1 className="mt-5 max-w-4xl font-serif text-5xl leading-tight text-[var(--color-soft-white)] sm:text-6xl lg:text-7xl">
            Create a Piece Made for You
          </h1>
          <p className="mt-7 max-w-3xl text-base leading-8 text-[var(--color-muted)] sm:text-lg">
            Share your style, measurements, fabric preference, occasion, and delivery location.
            Nebeda Threads will guide you through creating a garment that feels personal, elegant,
            and timeless.
          </p>
        </motion.div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-4 2xl:max-w-[1500px]">
          {processSteps.map((step, index) => (
            <ProcessCard index={index} key={step.number} step={step} />
          ))}
        </div>
      </section>

      <section className="relative px-5 py-20 sm:px-8 md:py-24 lg:px-10 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(190,151,83,0.12),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-start 2xl:max-w-[1500px]">
          <motion.form
            className="rounded-[1.75rem] border border-white/10 bg-[rgba(255,255,255,0.045)] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.3)] backdrop-blur-md sm:p-8"
            initial={{ opacity: 0, y: 28 }}
            onSubmit={handleSubmitCustomOrder}
            transition={{ duration: 0.75, ease: 'easeOut' }}
            viewport={{ once: true, amount: 0.2 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-gold)]">
                Customer Details
              </p>
              <div className="mt-6 grid gap-5 md:grid-cols-3">
                <TextField
                  error={errors.fullName}
                  label="Full Name"
                  name="fullName"
                  onChange={updateField}
                  placeholder="Your full name"
                  required
                  value={formData.fullName}
                />
                <TextField
                  error={errors.email}
                  label="Email Address"
                  name="email"
                  onChange={updateField}
                  placeholder="you@example.com"
                  required
                  type="email"
                  value={formData.email}
                />
                <TextField
                  error={errors.whatsappNumber}
                  label="WhatsApp Number"
                  name="whatsappNumber"
                  onChange={updateField}
                  placeholder="+44..."
                  required
                  type="tel"
                  value={formData.whatsappNumber}
                />
              </div>
            </div>

            <div className="border-t border-white/10 pt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-gold)]">
                Order Details
              </p>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <SelectField
                  error={errors.gender}
                  label="Gender"
                  name="gender"
                  onChange={updateField}
                  options={selectOptions.gender}
                  required
                  value={formData.gender}
                />
                <SelectField
                  error={errors.outfitType}
                  label="Outfit Type"
                  name="outfitType"
                  onChange={updateField}
                  options={selectOptions.outfitType}
                  required
                  value={formData.outfitType}
                />
                <SelectField
                  error={errors.orderType}
                  label="Order Type"
                  name="orderType"
                  onChange={updateField}
                  options={selectOptions.orderType}
                  required
                  value={formData.orderType}
                />
                <SelectField
                  label="Fabric Preference"
                  name="fabricPreference"
                  onChange={updateField}
                  options={selectOptions.fabricPreference}
                  value={formData.fabricPreference}
                />
                <SelectField
                  label="Occasion"
                  name="occasion"
                  onChange={updateField}
                  options={selectOptions.occasion}
                  value={formData.occasion}
                />
              </div>
            </div>

            <div className="mt-8 border-t border-white/10 pt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-gold)]">
                Measurements
              </p>
              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {[
                  ['chestBust', 'Chest/Bust'],
                  ['waist', 'Waist'],
                  ['hip', 'Hip'],
                  ['shoulder', 'Shoulder'],
                  ['sleeveLength', 'Sleeve Length'],
                  ['topLength', 'Top Length'],
                  ['trouserSkirtLength', 'Trouser/Skirt Length'],
                  ['height', 'Height'],
                ].map(([name, label]) => (
                  <TextField
                    key={name}
                    label={label}
                    name={name}
                    onChange={updateField}
                    placeholder="cm / inches"
                    value={formData[name]}
                  />
                ))}
              </div>
              <div className="mt-5">
                <TextAreaField
                  label="Additional Notes"
                  name="additionalNotes"
                  onChange={updateField}
                  placeholder="Add size context, preferred fit, or request measurement guidance."
                  value={formData.additionalNotes}
                />
              </div>
            </div>

            <div className="mt-8 border-t border-white/10 pt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-gold)]">
                Shipping
              </p>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <SelectField
                  error={errors.shippingCountry}
                  label="Shipping Country"
                  name="shippingCountry"
                  onChange={updateField}
                  options={selectOptions.shippingCountry}
                  required
                  value={formData.shippingCountry}
                />
                <SelectField
                  label="Shipping Method"
                  name="shippingMethod"
                  onChange={updateField}
                  options={availableShippingMethods}
                  value={formData.shippingMethod}
                />
                <TextField
                  error={errors.addressLine1}
                  label="Address Line 1"
                  name="addressLine1"
                  onChange={updateField}
                  placeholder="Street address"
                  required
                  value={formData.addressLine1}
                />
                <TextField
                  label="Address Line 2"
                  name="addressLine2"
                  onChange={updateField}
                  placeholder="Apartment, suite, unit"
                  value={formData.addressLine2}
                />
                <TextField
                  error={errors.city}
                  label="City"
                  name="city"
                  onChange={updateField}
                  placeholder="City"
                  required
                  value={formData.city}
                />
                <TextField
                  label="State/County"
                  name="stateCounty"
                  onChange={updateField}
                  placeholder="State or county"
                  value={formData.stateCounty}
                />
                <TextField
                  label="Postcode"
                  name="postcode"
                  onChange={updateField}
                  placeholder="Postcode"
                  value={formData.postcode}
                />
                <TextField
                  error={errors.country}
                  label="Country"
                  name="country"
                  onChange={updateField}
                  placeholder="Country"
                  required
                  value={formData.country}
                />
              </div>
            </div>

            <div className="mt-8 border-t border-white/10 pt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-gold)]">
                Inspiration
              </p>
              <div className="mt-6 grid gap-5 md:grid-cols-[0.85fr_1.15fr]">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-gold)]">
                    Upload Inspiration Images
                  </span>
                  <input
                    className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-sm text-white file:mr-4 file:rounded-full file:border-0 file:bg-[var(--color-gold)] file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.14em] file:text-black"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    name="inspirationImages"
                    onChange={updateField}
                    type="file"
                  />
                  <p className="mt-2 text-sm text-white/42">
                    Optional. Upload up to 3 JPG, PNG, or WebP images. Max 5MB each.
                  </p>
                  {imagePreviews.length ? (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {imagePreviews.map((preview, index) => (
                        <div
                          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/50"
                          key={`${preview.name}-${preview.url}`}
                        >
                          <img
                            alt={`Inspiration preview ${index + 1}`}
                            className="h-32 w-full object-cover"
                            src={preview.url}
                          />
                          <button
                            className="absolute right-2 top-2 rounded-full border border-[rgba(190,151,83,0.5)] bg-black/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-gold)] transition hover:bg-[var(--color-gold)] hover:text-black"
                            onClick={() => removeInspirationImage(index)}
                            type="button"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </label>
                <TextAreaField
                  label="Style Notes"
                  name="styleNotes"
                  onChange={updateField}
                  placeholder="Describe colours, fit, reference styles, fabric ideas, and deadline."
                  value={formData.styleNotes}
                />
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row">
              <Button disabled={isSubmitting} type="submit" variant="primary">
                {isSubmitting ? 'Submitting Request...' : 'Submit Custom Order Request'}
              </Button>
              <Button href={whatsappHelpLink} rel="noreferrer" target="_blank" variant="outline">
                Chat on WhatsApp
              </Button>
            </div>
          </motion.form>

          <motion.aside
            className="sticky top-28 rounded-[1.75rem] border border-[rgba(190,151,83,0.42)] bg-[rgba(255,255,255,0.055)] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.34)] backdrop-blur-md lg:p-7"
            initial={{ opacity: 0, y: 28 }}
            transition={{ duration: 0.75, ease: 'easeOut', delay: 0.08 }}
            viewport={{ once: true, amount: 0.25 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-gold)]">
              Payment Summary
            </p>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-white">Order Review</h2>
            <div className="mt-7 space-y-5 border-y border-white/10 py-6">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/42">Order Type</p>
                <p className="mt-2 text-white">{formData.orderType || 'Not selected'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/42">Shipping Country</p>
                <p className="mt-2 text-white">{formData.shippingCountry || 'Not selected'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/42">Estimated Payment Status</p>
                <p className="mt-2 text-white">Pending Confirmation</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/42">Payment Provider</p>
                <p className="mt-2 text-white">Stripe, coming next</p>
              </div>
            </div>

            {successOrder ? (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 rounded-2xl border border-[rgba(190,151,83,0.42)] bg-[rgba(190,151,83,0.1)] px-5 py-5 text-sm leading-6 text-[var(--color-cream)]"
                initial={{ opacity: 0, y: 10 }}
              >
                <p className="font-serif text-2xl leading-tight text-white">
                  Custom Order Request Received
                </p>
                <p className="mt-3">
                  Thank you. Nebeda Threads will review your request and contact you on WhatsApp or
                  email to confirm your design, measurements, delivery, and payment details.
                </p>
                <p className="mt-4 text-xs uppercase tracking-[0.18em] text-white/52">
                  Order Reference
                </p>
                <p className="mt-2 break-all text-white">{successOrder._id || 'Pending'}</p>
                <div className="mt-5 flex flex-col gap-3">
                  <Button to="/shop" variant="primary">
                    Back to Shop
                  </Button>
                  <Button href={whatsappHelpLink} rel="noreferrer" target="_blank" variant="outline">
                    Chat on WhatsApp
                  </Button>
                </div>
              </motion.div>
            ) : null}

            {submitError ? (
              <motion.p
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 rounded-2xl border border-[rgba(190,151,83,0.42)] bg-[rgba(190,151,83,0.1)] px-5 py-4 text-sm leading-6 text-[var(--color-cream)]"
                initial={{ opacity: 0, y: 10 }}
              >
                {submitError}
              </motion.p>
            ) : null}

            <Button
              className="mt-7 w-full"
              onClick={showPaymentComingSoon}
              type="button"
              variant="outline"
            >
              Proceed to Payment
            </Button>
          </motion.aside>
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
              Measurement Support
            </p>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-white sm:text-5xl">
              Need Help With Measurements?
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--color-muted)] sm:text-lg">
              Contact Nebeda Threads on WhatsApp and we will guide you through the custom order
              process.
            </p>
            <Button
              className="mt-8"
              href={whatsappHelpLink}
              rel="noreferrer"
              target="_blank"
              variant="primary"
            >
              Chat on WhatsApp
            </Button>
          </div>
        </motion.div>
      </section>
    </main>
  )
}

export default CustomOrder
