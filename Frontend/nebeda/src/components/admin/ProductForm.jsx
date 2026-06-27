import Button from '../ui/Button'

const categoryOptions = ['Men', 'Women', 'Ready to Wear', 'Bespoke', 'Wedding']
const genderOptions = ['Men', 'Women', 'Couple', 'Unisex']
const currencyOptions = ['GBP', 'EUR', 'Custom']
const badgeOptions = ['Ready to Wear', 'Bespoke', 'Wedding']
const stockTypeOptions = ['Ready to Wear', 'Made to Order', 'Bespoke']

function TextField({ label, name, onChange, placeholder, required, type = 'text', value }) {
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
    </label>
  )
}

function SelectField({ label, name, onChange, options, required, value }) {
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
        <option className="bg-black" value="">Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option className="bg-black" key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  )
}

function ProductForm({
  cancelTo = '/admin/products',
  fieldErrors = {},
  form,
  onChange,
  onSubmit,
  submitLabel,
  submittingLabel,
  error,
  isSubmitting,
}) {
  return (
    <form
      className="mt-8 rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.3)] sm:p-8"
      onSubmit={onSubmit}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <TextField label="Product Name" name="name" onChange={onChange} required value={form.name} />
        <TextField label="Display Category" name="displayCategory" onChange={onChange} placeholder="Men's Ready to Wear" required value={form.displayCategory} />
        <TextField label="Price Text" name="price" onChange={onChange} placeholder="£75, €45, From £120" required value={form.price} />
        <TextField label="Numeric Price" name="numericPrice" onChange={onChange} placeholder="75" type="number" value={form.numericPrice} />
        <SelectField label="Gender" name="gender" onChange={onChange} options={genderOptions} required value={form.gender} />
        <SelectField label="Currency" name="currency" onChange={onChange} options={currencyOptions} required value={form.currency} />
        <SelectField label="Badge" name="badge" onChange={onChange} options={badgeOptions} required value={form.badge} />
        <SelectField label="Stock Type" name="stockType" onChange={onChange} options={stockTypeOptions} required value={form.stockType} />
        <TextField label="Inventory" name="inventory" onChange={onChange} type="number" value={form.inventory} />
        <TextField label="Fabric" name="fabric" onChange={onChange} value={form.fabric} />
        <TextField label="Sizes" name="sizes" onChange={onChange} placeholder="S, M, L" value={form.sizes} />
        <TextField label="Colours" name="colors" onChange={onChange} placeholder="Black, Gold" value={form.colors} />
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-gold)]">
          Categories *
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          {categoryOptions.map((category) => (
            <label className="rounded-full border border-white/10 bg-black/35 px-4 py-2 text-sm text-white/80" key={category}>
              <input
                checked={form.categories.includes(category)}
                className="mr-2 accent-[var(--color-gold)]"
                name="categories"
                onChange={onChange}
                type="checkbox"
                value={category}
              />
              {category}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-gold)]">
            Short Description *
          </span>
          <textarea className="mt-3 min-h-32 w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none focus:border-[var(--color-gold)]" name="shortDescription" onChange={onChange} value={form.shortDescription} />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-gold)]">
            Full Description *
          </span>
          <textarea className="mt-3 min-h-32 w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none focus:border-[var(--color-gold)]" name="description" onChange={onChange} value={form.description} />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-gold)]">
            Care Instructions
          </span>
          <textarea className="mt-3 min-h-32 w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none focus:border-[var(--color-gold)]" name="careInstructions" onChange={onChange} value={form.careInstructions} />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-gold)]">
            Product Images
          </span>
          <input
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-sm text-white file:mr-4 file:rounded-full file:border-0 file:bg-[var(--color-gold)] file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.14em] file:text-black"
            multiple
            name="images"
            onChange={onChange}
            type="file"
          />
          <p className="mt-2 text-sm text-white/42">Upload up to 6 images.</p>
        </label>
      </div>

      <div className="mt-6 flex flex-wrap gap-4">
        <label className="text-sm text-white/80">
          <input checked={form.isFeatured} className="mr-2 accent-[var(--color-gold)]" name="isFeatured" onChange={onChange} type="checkbox" />
          Featured product
        </label>
        <label className="text-sm text-white/80">
          <input checked={form.isActive} className="mr-2 accent-[var(--color-gold)]" name="isActive" onChange={onChange} type="checkbox" />
          Active product
        </label>
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-[rgba(190,151,83,0.42)] bg-[rgba(190,151,83,0.1)] px-5 py-4 text-sm text-[var(--color-cream)]">
          <p>{error}</p>
          {Object.keys(fieldErrors).length ? (
            <ul className="mt-3 list-inside list-disc space-y-1">
              {Object.entries(fieldErrors).map(([field, fieldError]) => (
                <li key={field}>
                  {field}: {fieldError}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <Button disabled={isSubmitting} type="submit" variant="primary">
          {isSubmitting ? submittingLabel : submitLabel}
        </Button>
        <Button to={cancelTo} variant="outline">Cancel</Button>
      </div>
    </form>
  )
}

export default ProductForm
