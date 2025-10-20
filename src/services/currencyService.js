// Currency Conversion Service
// Using exchangerate-api.com (free tier: 1,500 requests/month)

const API_KEY = import.meta.env.VITE_EXCHANGE_RATE_API_KEY || 'demo'; // Free API doesn't always require key
const BASE_URL = 'https://api.exchangerate-api.com/v4/latest';

// Popular currencies for travel
export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
];

class CurrencyService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 1000 * 60 * 60; // 1 hour cache
  }

  async getExchangeRates(baseCurrency = 'USD') {
    const cacheKey = `rates_${baseCurrency}`;
    const cached = this.cache.get(cacheKey);

    // Return cached rates if still valid
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    try {
      const response = await fetch(`${BASE_URL}/${baseCurrency}`);
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }

      const data = await response.json();
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: data.rates,
        timestamp: Date.now()
      });

      return data.rates;
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      
      // Return cached data even if expired, as fallback
      if (cached) {
        console.warn('Using expired cache due to API error');
        return cached.data;
      }
      
      throw error;
    }
  }

  async convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    try {
      const rates = await this.getExchangeRates(fromCurrency);
      const rate = rates[toCurrency];
      
      if (!rate) {
        throw new Error(`Exchange rate not found for ${toCurrency}`);
      }

      return amount * rate;
    } catch (error) {
      console.error('Error converting currency:', error);
      throw error;
    }
  }

  async getMultipleRates(baseCurrency, targetCurrencies) {
    try {
      const rates = await this.getExchangeRates(baseCurrency);
      const result = {};

      targetCurrencies.forEach(currency => {
        result[currency] = rates[currency] || null;
      });

      return result;
    } catch (error) {
      console.error('Error getting multiple rates:', error);
      throw error;
    }
  }

  getCurrencySymbol(currencyCode) {
    const currency = CURRENCIES.find(c => c.code === currencyCode);
    return currency ? currency.symbol : currencyCode;
  }

  getCurrencyName(currencyCode) {
    const currency = CURRENCIES.find(c => c.code === currencyCode);
    return currency ? currency.name : currencyCode;
  }

  formatAmount(amount, currencyCode) {
    const symbol = this.getCurrencySymbol(currencyCode);
    const formatted = Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // Handle different currency formatting styles
    if (currencyCode === 'EUR') {
      return `${formatted}${symbol}`;
    }
    return `${symbol}${formatted}`;
  }

  clearCache() {
    this.cache.clear();
  }
}

export const currencyService = new CurrencyService();
export default currencyService;
