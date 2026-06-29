const SHIPPING_CURRENCY = "GBP";
const FREE_UK_THRESHOLD = 150;

const EUROPE_COUNTRIES = [
  "Albania",
  "Andorra",
  "Austria",
  "Belgium",
  "Bosnia and Herzegovina",
  "Bulgaria",
  "Croatia",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Estonia",
  "Finland",
  "France",
  "Germany",
  "Greece",
  "Hungary",
  "Iceland",
  "Ireland",
  "Italy",
  "Kosovo",
  "Latvia",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Malta",
  "Moldova",
  "Monaco",
  "Montenegro",
  "Netherlands",
  "North Macedonia",
  "Norway",
  "Poland",
  "Portugal",
  "Romania",
  "San Marino",
  "Serbia",
  "Slovakia",
  "Slovenia",
  "Spain",
  "Sweden",
  "Switzerland",
  "Ukraine",
  "Vatican City",
];

const SHIPPING_RULES = Object.freeze({
  UK_STANDARD: {
    code: "UK_STANDARD",
    label: "UK Standard Delivery",
    price: 4.99,
    region: "United Kingdom",
    carrier: "Royal Mail Tracked 48 or Evri",
    estimatedDelivery: "2 to 4 working days",
    description: "2 to 4 working days",
  },
  UK_EXPRESS: {
    code: "UK_EXPRESS",
    label: "UK Express Delivery",
    price: 8.99,
    region: "United Kingdom",
    carrier: "Royal Mail or Evri",
    estimatedDelivery: "1 to 2 working days",
    description: "Fast delivery",
  },
  FREE_UK: {
    code: "FREE_UK",
    label: "Free UK Delivery",
    price: 0,
    region: "United Kingdom",
    carrier: "Royal Mail Tracked 48 or Evri",
    estimatedDelivery: "2 to 4 working days",
    description: "Orders over £150",
  },
  EUROPE: {
    code: "EUROPE",
    label: "Europe Shipping",
    price: 14.99,
    region: "Europe",
    carrier: "International Tracked Delivery",
    estimatedDelivery: "5 to 10 working days",
    description: "Europe delivery",
  },
  USA_CANADA: {
    code: "USA_CANADA",
    label: "International Shipping",
    price: 24.99,
    region: "USA / Canada",
    carrier: "International Tracked Delivery",
    estimatedDelivery: "7 to 14 working days",
    description: "USA and Canada delivery",
  },
});

const normalizeCountry = (country = "") => String(country).trim();

const isUnitedKingdom = (country) =>
  ["united kingdom", "uk", "great britain", "gb"].includes(
    normalizeCountry(country).toLowerCase(),
  );

const isUnitedStates = (country) =>
  ["united states", "united states of america", "usa", "us"].includes(
    normalizeCountry(country).toLowerCase(),
  );

const isCanada = (country) => normalizeCountry(country).toLowerCase() === "canada";

const isEurope = (country) =>
  EUROPE_COUNTRIES.some(
    (europeCountry) => europeCountry.toLowerCase() === normalizeCountry(country).toLowerCase(),
  );

const serializeRule = (rule, currency = SHIPPING_CURRENCY) => ({
  methodCode: rule.code,
  shippingMethod: rule.label,
  shippingCarrier: rule.carrier,
  shippingCost: rule.price,
  shippingRegion: rule.region,
  estimatedDelivery: rule.estimatedDelivery,
  description: rule.description,
  currency,
});

const calculateShipping = ({ country, subtotal, requestedMethod, currency = SHIPPING_CURRENCY }) => {
  const normalizedCountry = normalizeCountry(country);
  const safeSubtotal = Number(subtotal);

  if (!normalizedCountry || !Number.isFinite(safeSubtotal) || safeSubtotal < 0) {
    throw new Error("A valid shipping country and order subtotal are required.");
  }

  if (isUnitedKingdom(normalizedCountry)) {
    if (safeSubtotal > FREE_UK_THRESHOLD) {
      return {
        supported: true,
        quoteRequired: false,
        automatic: true,
        quote: serializeRule(SHIPPING_RULES.FREE_UK, currency),
        options: [serializeRule(SHIPPING_RULES.FREE_UK, currency)],
      };
    }

    const options = [
      serializeRule(SHIPPING_RULES.UK_STANDARD, currency),
      serializeRule(SHIPPING_RULES.UK_EXPRESS, currency),
    ];
    const selected = options.find(
      (option) =>
        option.methodCode === requestedMethod || option.shippingMethod === requestedMethod,
    ) || options[0];

    return {
      supported: true,
      quoteRequired: false,
      automatic: false,
      quote: selected,
      options,
    };
  }

  if (isEurope(normalizedCountry)) {
    const quote = serializeRule(SHIPPING_RULES.EUROPE, currency);
    return { supported: true, quoteRequired: false, automatic: true, quote, options: [quote] };
  }

  if (isUnitedStates(normalizedCountry) || isCanada(normalizedCountry)) {
    const quote = serializeRule(SHIPPING_RULES.USA_CANADA, currency);
    return { supported: true, quoteRequired: false, automatic: true, quote, options: [quote] };
  }

  return {
    supported: false,
    quoteRequired: true,
    automatic: true,
    quote: null,
    options: [],
    message: "Shipping quote required.",
  };
};

const getShippingCatalog = () => ({
  currency: SHIPPING_CURRENCY,
  freeUkThreshold: FREE_UK_THRESHOLD,
  countries: ["United Kingdom", ...EUROPE_COUNTRIES, "United States", "Canada", "Other"],
  rules: Object.fromEntries(
    Object.entries(SHIPPING_RULES).map(([key, rule]) => [key, serializeRule(rule)]),
  ),
});

export {
  EUROPE_COUNTRIES,
  FREE_UK_THRESHOLD,
  SHIPPING_CURRENCY,
  SHIPPING_RULES,
  calculateShipping,
  getShippingCatalog,
};
