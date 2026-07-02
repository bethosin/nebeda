const supportedCurrencies = ["GBP", "EUR"];

const inferCurrency = (product) => {
  if (supportedCurrencies.includes(product.currency)) return product.currency;
  const price = String(product.price || product.displayPrice || "");
  return price.includes(String.fromCharCode(0x20ac)) ? "EUR" : "GBP";
};

const parseLegacyPrice = (product) => {
  const candidates = [product.priceAmount, product.numericPrice];
  for (const candidate of candidates) {
    const amount = Number(candidate);
    if (Number.isFinite(amount) && amount > 0) return amount;
  }

  const priceText = String(product.price || product.displayPrice || "");
  const match = priceText.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  const amount = match ? Number(match[1]) : 0;
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
};

const formatDisplayPrice = (amount, currency) =>
  new Intl.NumberFormat(currency === "EUR" ? "en-IE" : "en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);

const normalizeProductPricing = (product) => {
  const amount = parseLegacyPrice(product);
  const currency = inferCurrency(product);
  const explicitQuoteOnly = product.isQuoteOnly === true;
  const legacyQuoteOnly = !amount && /custom quote|request quote|price on request/i.test(
    String(product.price || product.displayPrice || ""),
  );
  const isQuoteOnly = explicitQuoteOnly || legacyQuoteOnly;

  if (isQuoteOnly) {
    product.isQuoteOnly = true;
    product.priceAmount = undefined;
    product.numericPrice = undefined;
    product.currency = currency;
    product.displayPrice = "Request Quote";
    product.price = "Request Quote";
    return { amount: 0, currency, isQuoteOnly: true };
  }

  if (!amount) return { amount: 0, currency, isQuoteOnly: false };

  const displayPrice = formatDisplayPrice(amount, currency);
  product.isQuoteOnly = false;
  product.priceAmount = amount;
  product.numericPrice = amount;
  product.currency = currency;
  product.displayPrice = displayPrice;
  product.price = displayPrice;
  return { amount, currency, isQuoteOnly: false };
};

const ensureCheckoutPrice = async (product, { persist = true } = {}) => {
  const before = JSON.stringify({
    priceAmount: product.priceAmount,
    numericPrice: product.numericPrice,
    currency: product.currency,
    displayPrice: product.displayPrice,
    price: product.price,
    isQuoteOnly: product.isQuoteOnly,
  });
  const result = normalizeProductPricing(product);
  const after = JSON.stringify({
    priceAmount: product.priceAmount,
    numericPrice: product.numericPrice,
    currency: product.currency,
    displayPrice: product.displayPrice,
    price: product.price,
    isQuoteOnly: product.isQuoteOnly,
  });

  if (persist && before !== after && product._id && product.constructor?.updateOne) {
    const update = {
      $set: {
        currency: product.currency,
        displayPrice: product.displayPrice,
        price: product.price,
        isQuoteOnly: product.isQuoteOnly,
      },
    };
    if (result.isQuoteOnly) {
      update.$unset = { priceAmount: 1, numericPrice: 1 };
    } else {
      update.$set.priceAmount = product.priceAmount;
      update.$set.numericPrice = product.numericPrice;
    }
    await product.constructor.updateOne({ _id: product._id }, update);
  }
  return result;
};

export {
  ensureCheckoutPrice,
  formatDisplayPrice,
  inferCurrency,
  normalizeProductPricing,
  parseLegacyPrice,
  supportedCurrencies,
};
