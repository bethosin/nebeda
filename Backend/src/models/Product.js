import mongoose from "mongoose";

const storedCategories = ["Men", "Women", "Ready to Wear", "Bespoke", "Wedding"];
const displayCategories = ["All", ...storedCategories];
const genders = ["Men", "Women", "Couple", "Unisex"];
const currencies = ["GBP", "EUR", "Custom"];
const badges = ["Ready to Wear", "Bespoke", "Wedding"];
const stockTypes = ["Ready to Wear", "Made to Order", "Bespoke"];

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    publicId: {
      type: String,
      required: true,
      trim: true,
    },
    alt: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const slugify = (value) =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [120, "Product name cannot exceed 120 characters"],
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },
    shortDescription: {
      type: String,
      required: [true, "Product short description is required"],
      trim: true,
      maxlength: [220, "Short description cannot exceed 220 characters"],
    },
    categories: {
      type: [String],
      required: [true, "At least one category is required"],
      validate: [
        {
          validator(value) {
            return Array.isArray(value) && value.length > 0;
          },
          message: "At least one category is required",
        },
        {
          validator(value) {
            return value.every((category) => storedCategories.includes(category));
          },
          message:
            "Categories can only include Men, Women, Ready to Wear, Bespoke, or Wedding",
        },
      ],
    },
    displayCategory: {
      type: String,
      required: [true, "Display category is required"],
      trim: true,
    },
    gender: {
      type: String,
      enum: genders,
      required: [true, "Gender is required"],
    },
    price: {
      type: String,
      required: [true, "Product price is required"],
      trim: true,
    },
    numericPrice: {
      type: Number,
      min: [0, "Numeric price cannot be negative"],
    },
    currency: {
      type: String,
      enum: currencies,
      required: [true, "Currency is required"],
    },
    badge: {
      type: String,
      enum: badges,
      required: [true, "Product badge is required"],
    },
    images: {
      type: [imageSchema],
      default: [],
    },
    mainImage: {
      type: imageSchema,
    },
    stockType: {
      type: String,
      enum: stockTypes,
      required: [true, "Stock type is required"],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    inventory: {
      type: Number,
      default: 0,
      min: [0, "Inventory cannot be negative"],
    },
    sizes: {
      type: [String],
      default: [],
    },
    colors: {
      type: [String],
      default: [],
    },
    fabric: {
      type: String,
      trim: true,
    },
    careInstructions: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ name: "text" });
productSchema.index({ categories: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });

productSchema.pre("validate", function generateSlug() {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name);
  }

  if (this.slug) {
    this.slug = slugify(this.slug);
  }
});

const Product = mongoose.model("Product", productSchema);

export { badges, currencies, displayCategories, genders, stockTypes, storedCategories };
export default Product;
