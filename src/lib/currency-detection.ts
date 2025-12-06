import { Currency } from './stripe-prices';

// Map country codes to currencies
const COUNTRY_TO_CURRENCY: Record<string, Currency> = {
    // Brazil
    BR: 'BRL',

    // United States
    US: 'USD',

    // Japan
    JP: 'JPY',

    // Eurozone countries
    AT: 'EUR', BE: 'EUR', CY: 'EUR', EE: 'EUR', FI: 'EUR',
    FR: 'EUR', DE: 'EUR', GR: 'EUR', IE: 'EUR', IT: 'EUR',
    LV: 'EUR', LT: 'EUR', LU: 'EUR', MT: 'EUR', NL: 'EUR',
    PT: 'EUR', SK: 'EUR', SI: 'EUR', ES: 'EUR',

    // United Kingdom
    GB: 'GBP',

    // Canada
    CA: 'CAD',

    // Australia
    AU: 'AUD',

    // Mexico
    MX: 'MXN',

    // South Korea
    KR: 'KRW',

    // UAE
    AE: 'AED',

    // Saudi Arabia
    SA: 'SAR',

    // Switzerland
    CH: 'CHF',

    // Singapore
    SG: 'SGD',

    // Sweden
    SE: 'SEK',
};

export function detectCurrency(countryCode?: string): Currency {
    if (!countryCode) {
        return 'USD'; // Default to USD
    }

    return COUNTRY_TO_CURRENCY[countryCode.toUpperCase()] || 'USD';
}

export async function getCurrencyFromRequest(request: Request): Promise<Currency> {
    // Try to get country from Vercel geo headers
    const country = request.headers.get('x-vercel-ip-country');

    if (country) {
        return detectCurrency(country);
    }

    // Fallback to USD
    return 'USD';
}

export function getCurrencySymbol(currency: Currency): string {
    const symbols: Record<Currency, string> = {
        BRL: 'R$',
        USD: '$',
        JPY: '¥',
        EUR: '€',
        GBP: '£',
        CAD: 'CA$',
        AUD: 'AU$',
        MXN: 'MX$',
        KRW: '₩',
        AED: 'AED',
        SAR: 'SAR',
        CHF: 'CHF',
        SGD: 'SGD',
        SEK: 'SEK',
    };

    return symbols[currency];
}
