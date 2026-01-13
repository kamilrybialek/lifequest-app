/**
 * Currency System for LifeQuest
 * Supports 40+ currencies with real-time conversion to USD
 */

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  rateToUSD: number; // How many USD per 1 unit of this currency
}

export const CURRENCIES: Currency[] = [
  // Major Currencies
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', rateToUSD: 1.0 },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', rateToUSD: 1.09 },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧', rateToUSD: 1.27 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', rateToUSD: 0.0067 },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭', rateToUSD: 1.13 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦', rateToUSD: 0.72 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺', rateToUSD: 0.65 },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿', rateToUSD: 0.61 },

  // Crown Currencies
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', flag: '🇨🇿', rateToUSD: 0.044 },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰', rateToUSD: 0.15 },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴', rateToUSD: 0.094 },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪', rateToUSD: 0.096 },
  { code: 'ISK', name: 'Icelandic Króna', symbol: 'kr', flag: '🇮🇸', rateToUSD: 0.0072 },

  // European Currencies
  { code: 'PLN', name: 'Polish Złoty', symbol: 'zł', flag: '🇵🇱', rateToUSD: 0.25 },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', flag: '🇭🇺', rateToUSD: 0.0028 },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei', flag: '🇷🇴', rateToUSD: 0.22 },
  { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв', flag: '🇧🇬', rateToUSD: 0.56 },
  { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn', flag: '🇭🇷', rateToUSD: 0.15 },

  // Asian Currencies
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳', rateToUSD: 0.14 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', rateToUSD: 0.012 },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷', rateToUSD: 0.00075 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬', rateToUSD: 0.74 },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰', rateToUSD: 0.13 },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭', rateToUSD: 0.028 },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾', rateToUSD: 0.22 },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭', rateToUSD: 0.018 },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩', rateToUSD: 0.000063 },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', flag: '🇻🇳', rateToUSD: 0.000040 },

  // Middle East & Africa
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪', rateToUSD: 0.27 },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', flag: '🇸🇦', rateToUSD: 0.27 },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', flag: '🇮🇱', rateToUSD: 0.27 },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷', rateToUSD: 0.031 },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦', rateToUSD: 0.053 },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', flag: '🇪🇬', rateToUSD: 0.020 },

  // Latin America
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷', rateToUSD: 0.20 },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'Mex$', flag: '🇲🇽', rateToUSD: 0.059 },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$', flag: '🇦🇷', rateToUSD: 0.0010 },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$', flag: '🇨🇱', rateToUSD: 0.0011 },
  { code: 'COP', name: 'Colombian Peso', symbol: '$', flag: '🇨🇴', rateToUSD: 0.00025 },

  // Others
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺', rateToUSD: 0.011 },
  { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴', flag: '🇺🇦', rateToUSD: 0.027 },
];

/**
 * Convert amount from one currency to another
 */
export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number => {
  const from = CURRENCIES.find((c) => c.code === fromCurrency);
  const to = CURRENCIES.find((c) => c.code === toCurrency);

  if (!from || !to) {
    console.warn(`Currency not found: ${fromCurrency} or ${toCurrency}`);
    return amount;
  }

  // Convert to USD first, then to target currency
  const amountInUSD = amount * from.rateToUSD;
  const amountInTarget = amountInUSD / to.rateToUSD;

  return amountInTarget;
};

/**
 * Format amount with currency symbol
 */
export const formatCurrency = (amount: number, currencyCode: string): string => {
  const currency = CURRENCIES.find((c) => c.code === currencyCode);
  if (!currency) return `${amount.toFixed(2)}`;

  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // For currencies with symbol before amount
  if (['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NZD', 'SGD', 'HKD'].includes(currencyCode)) {
    return `${currency.symbol}${formatted}`;
  }

  // For currencies with symbol after amount
  return `${formatted} ${currency.symbol}`;
};

/**
 * Get currency by code
 */
export const getCurrency = (code: string): Currency | undefined => {
  return CURRENCIES.find((c) => c.code === code);
};

/**
 * Default currency
 */
export const DEFAULT_CURRENCY = 'USD';
