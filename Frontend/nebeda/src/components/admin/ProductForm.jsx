import { useState } from 'react'
import Button from '../ui/Button'

const categoryOptions = ['Men', 'Women', 'Ready to Wear', 'Bespoke', 'Wedding']
const genderOptions = ['Men', 'Women', 'Couple', 'Unisex']
const currencyOptions = ['GBP', 'EUR']
const badgeOptions = ['Ready to Wear', 'Bespoke', 'Wedding']
const stockTypeOptions = ['Ready to Wear', 'Made to Order', 'Bespoke']
const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']
const colorOptions = ['Black', 'White', 'Gold', 'Green', 'Blue', 'Red', 'Cream', 'Brown', 'Purple']

function TextField({ label, name, onChange, placeholder, required, step, type = 'text', value }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-gold)]">{label}{required ? ' *' : ''}</span>
      <input className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition placeholder:text-white/32 focus:border-[var(--color-gold)]" min={type === 'number' ? '0' : undefined} name={name} onChange={onChange} placeholder={placeholder} required={required} step={step} type={type} value={value} />
    </label>
  )
}

function SelectField({ label, name, onChange, options, required, value }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-gold)]">{label}{required ? ' *' : ''}</span>
      <select className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition focus:border-[var(--color-gold)]" name={name} onChange={onChange} required={required} value={value}>
        <option className="bg-black" value="">Select {label.toLowerCase()}</option>
        {options.map((option) => <option className="bg-black" key={option} value={option}>{option}</option>)}
      </select>
    </label>
  )
}

function OptionPicker({ label, name, onChange, options, selected }) {
  const [customValue, setCustomValue] = useState('')
  const addCustom = () => {
    const value = customValue.trim()
    if (!value || selected.includes(value)) return
    onChange({ target: { checked: true, name, type: 'checkbox', value } })
    setCustomValue('')
  }

  return (
    <fieldset className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <legend className="px-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-gold)]">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {[...new Set([...options, ...selected])].map((option) => (
          <label className={`rounded-full border px-3 py-2 text-sm transition ${selected.includes(option) ? 'border-[var(--color-gold)] bg-[rgba(190,151,83,.14)] text-white' : 'border-white/10 text-white/65'}`} key={option}>
            <input checked={selected.includes(option)} className="mr-2 accent-[var(--color-gold)]" name={name} onChange={onChange} type="checkbox" value={option} />
            {option}
          </label>
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[var(--color-gold)]" onChange={(event) => setCustomValue(event.target.value)} placeholder={`Custom ${label.toLowerCase()}`} value={customValue} />
        <button className="rounded-xl border border-[var(--color-gold)] px-4 py-3 text-xs font-semibold uppercase tracking-[.14em] text-[var(--color-gold)]" onClick={addCustom} type="button">Add Custom</button>
      </div>
    </fieldset>
  )
}

function ProductForm({ cancelTo = '/admin/products', fieldErrors = {}, form, onChange, onSubmit, submitLabel, submittingLabel, error, isSubmitting, requireImages = false }) {
  return (
    <form className="mt-8 rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.3)] sm:p-8" onSubmit={onSubmit}>
      <div className="grid gap-5 md:grid-cols-2">
        <TextField label="Product Name" name="name" onChange={onChange} required value={form.name} />
        <TextField label="Display Category" name="displayCategory" onChange={onChange} placeholder="Women's Ready to Wear" required value={form.displayCategory} />
        <SelectField label="Gender" name="gender" onChange={onChange} options={genderOptions} required value={form.gender} />
        <SelectField label="Currency" name="currency" onChange={onChange} options={currencyOptions} required value={form.currency} />
        {!form.isQuoteOnly ? <TextField label="Checkout Price" name="priceAmount" onChange={onChange} placeholder="75.00" required step="0.01" type="number" value={form.priceAmount} /> : <div className="rounded-2xl border border-[rgba(190,151,83,.35)] bg-[rgba(190,151,83,.08)] p-5 text-sm leading-6 text-[var(--color-cream)]">This product will use Request Quote instead of Add to Cart.</div>}
        <SelectField label="Badge" name="badge" onChange={onChange} options={badgeOptions} required value={form.badge} />
        <SelectField label="Stock Type" name="stockType" onChange={onChange} options={stockTypeOptions} required value={form.stockType} />
        <TextField label="Inventory" name="inventory" onChange={onChange} required={form.trackInventory} type="number" value={form.inventory} />
        <TextField label="Fabric" name="fabric" onChange={onChange} value={form.fabric} />
      </div>

      <div className="mt-6 flex flex-wrap gap-5">
        <label className="text-sm text-white/80"><input checked={form.isQuoteOnly} className="mr-2 accent-[var(--color-gold)]" name="isQuoteOnly" onChange={onChange} type="checkbox" />Quote-only product</label>
        <label className="text-sm text-white/80"><input checked={form.trackInventory} className="mr-2 accent-[var(--color-gold)]" name="trackInventory" onChange={onChange} type="checkbox" />Track inventory</label>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <OptionPicker label="Sizes" name="sizes" onChange={onChange} options={sizeOptions} selected={form.sizes} />
        <OptionPicker label="Colours" name="colors" onChange={onChange} options={colorOptions} selected={form.colors} />
      </div>
      <p className="mt-3 text-sm text-white/42">All selected variations use the same checkout price. Stock-per-variation is supported by the data model for later use.</p>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-gold)]">Categories *</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {categoryOptions.map((category) => <label className="rounded-full border border-white/10 bg-black/35 px-4 py-2 text-sm text-white/80" key={category}><input checked={form.categories.includes(category)} className="mr-2 accent-[var(--color-gold)]" name="categories" onChange={onChange} type="checkbox" value={category} />{category}</label>)}
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <label className="block"><span className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-gold)]">Short Description *</span><textarea className="mt-3 min-h-32 w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none focus:border-[var(--color-gold)]" name="shortDescription" onChange={onChange} required value={form.shortDescription} /></label>
        <label className="block"><span className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-gold)]">Product Images{requireImages ? ' *' : ''}</span><input accept="image/jpeg,image/jpg,image/png,image/webp" className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-sm text-white file:mr-4 file:rounded-full file:border-0 file:bg-[var(--color-gold)] file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.14em] file:text-black" multiple name="images" onChange={onChange} required={requireImages} type="file" /><p className="mt-2 text-sm text-white/42">Upload up to 6 images.</p></label>
      </div>

      <div className="mt-6 flex flex-wrap gap-4">
        <label className="text-sm text-white/80"><input checked={form.isFeatured} className="mr-2 accent-[var(--color-gold)]" name="isFeatured" onChange={onChange} type="checkbox" />Featured product</label>
        <label className="text-sm text-white/80"><input checked={form.isActive} className="mr-2 accent-[var(--color-gold)]" name="isActive" onChange={onChange} type="checkbox" />Active product</label>
      </div>

      {error ? <div className="mt-6 rounded-2xl border border-[rgba(190,151,83,0.42)] bg-[rgba(190,151,83,0.1)] px-5 py-4 text-sm text-[var(--color-cream)]"><p>{error}</p>{Object.keys(fieldErrors).length ? <ul className="mt-3 list-inside list-disc space-y-1">{Object.entries(fieldErrors).map(([field, fieldError]) => <li key={field}>{field}: {fieldError}</li>)}</ul> : null}</div> : null}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row"><Button disabled={isSubmitting} type="submit" variant="primary">{isSubmitting ? submittingLabel : submitLabel}</Button><Button to={cancelTo} variant="outline">Cancel</Button></div>
    </form>
  )
}

export default ProductForm
