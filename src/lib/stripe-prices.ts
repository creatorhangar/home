// Stripe Price IDs for all supported currencies and billing periods

export type Currency = 'BRL' | 'USD' | 'JPY' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'MXN' | 'KRW' | 'AED' | 'SAR' | 'CHF' | 'SGD' | 'SEK';
export type BillingPeriod = 'monthly' | 'yearly';

export interface PriceInfo {
    priceId: string;
    amount: number;
    currency: Currency;
    period: BillingPeriod;
    displayPrice: string;
}

// Monthly Price IDs
const MONTHLY_PRICES: Record<Currency, string> = {
    BRL: 'price_1ST12pLXTAG6PTSpjh8Ejpzr',
    USD: 'price_1ST5FBLXTAG6PTSpByCvCXWt',
    JPY: 'price_1ST5GcLXTAG6PTSpdS7NynSJ',
    EUR: 'price_1ST5GsLXTAG6PTSpttTgXADu',
    GBP: 'price_1ST5HFLXTAG6PTSpSXmQ7WUa',
    CAD: 'price_1ST5HVLXTAG6PTSpCXXMUs3k',
    AUD: 'price_1ST5HnLXTAG6PTSpKy6o49qS',
    MXN: 'price_1ST5I7LXTAG6PTSp4KcNvncO',
    KRW: 'price_1ST5IeLXTAG6PTSpdQ7RxmDr',
    AED: 'price_1ST5J0LXTAG6PTSpxdzhIEvK',
    SAR: 'price_1ST5JQLXTAG6PTSpxtvmnqYx',
    CHF: 'price_1ST5TtLXTAG6PTSpbCa8sMs7',
    SGD: 'price_1ST5JtLXTAG6PTSpjz1RCzsz',
    SEK: 'price_1ST5KGLXTAG6PTSp0wksF8k5',
};

// Yearly Price IDs
const YEARLY_PRICES: Record<Currency, string> = {
    BRL: 'price_1ST5V6LXTAG6PTSpPVtya9xV',
    USD: 'price_1ST5WfLXTAG6PTSpkgYhAcTn',
    JPY: 'price_1ST5X6LXTAG6PTSpQh5Az3gB',
    EUR: 'price_1ST5XjLXTAG6PTSpZojd3mKb',
    GBP: 'price_1ST5eOLXTAG6PTSpxkPPY4Ov',
    CAD: 'price_1ST5fmLXTAG6PTSpeHd4utLP',
    AUD: 'price_1ST5j4LXTAG6PTSpskBl4KFs',
    MXN: 'price_1ST5oOLXTAG6PTSplNZJcPFQ',
    KRW: 'price_1ST5qpLXTAG6PTSpjzNyk6xC',
    AED: 'price_1ST6VpLXTAG6PTSpOCPjGGeC',
    SAR: 'price_1ST5ypLXTAG6PTSpNoGQDMYr',
    CHF: 'price_1ST6cHLXTAG6PTSptyhKpVRl',
    SGD: 'price_1ST6cHLXTAG6PTSptyhKpVRl',
    SEK: 'price_1ST6crLXTAG6PTSpmGOQwwsC',
};

// Display prices for UI
const MONTHLY_DISPLAY_PRICES: Record<Currency, string> = {
    BRL: 'R$ 29,90',
    USD: '$19.00',
    JPY: '¥2,980',
    EUR: '€17.00',
    GBP: '£15.00',
    CAD: 'CA$25.00',
    AUD: 'AU$29.00',
    MXN: 'MX$99.00',
    KRW: '₩25,000',
    AED: 'AED 70.00',
    SAR: 'SAR 75.00',
    CHF: 'CHF 19.00',
    SGD: 'SGD 25.00',
    SEK: 'SEK 199.00',
};

const YEARLY_DISPLAY_PRICES: Record<Currency, string> = {
    BRL: 'R$ 239,00',
    USD: '$149.00',
    JPY: '¥23,800',
    EUR: '€139.00',
    GBP: '£119.00',
    CAD: 'CA$199.00',
    AUD: 'AU$229.00',
    MXN: 'MX$799.00',
    KRW: '₩199,000',
    AED: 'AED 559.00',
    SAR: 'SAR 599.00',
    CHF: 'CHF 149.00',
    SGD: 'SGD 199.00',
    SEK: 'SEK 1,599.00',
};

// Numeric amounts (in smallest currency unit)
const MONTHLY_AMOUNTS: Record<Currency, number> = {
    BRL: 2990,
    USD: 1900,
    JPY: 2980,
    EUR: 1700,
    GBP: 1500,
    CAD: 2500,
    AUD: 2900,
    MXN: 9900,
    KRW: 25000,
    AED: 7000,
    SAR: 7500,
    CHF: 1900,
    SGD: 2500,
    SEK: 19900,
};

const YEARLY_AMOUNTS: Record<Currency, number> = {
    BRL: 23900,
    USD: 14900,
    JPY: 23800,
    EUR: 13900,
    GBP: 11900,
    CAD: 19900,
    AUD: 22900,
    MXN: 79900,
    KRW: 199000,
    AED: 55900,
    SAR: 59900,
    CHF: 14900,
    SGD: 19900,
    SEK: 159900,
};

export function getPriceId(currency: Currency, period: BillingPeriod): string {
    return period === 'monthly' ? MONTHLY_PRICES[currency] : YEARLY_PRICES[currency];
}

export function getPriceInfo(currency: Currency, period: BillingPeriod): PriceInfo {
    const priceId = getPriceId(currency, period);
    const amount = period === 'monthly' ? MONTHLY_AMOUNTS[currency] : YEARLY_AMOUNTS[currency];
    const displayPrice = period === 'monthly' ? MONTHLY_DISPLAY_PRICES[currency] : YEARLY_DISPLAY_PRICES[currency];

    return {
        priceId,
        amount,
        currency,
        period,
        displayPrice,
    };
}

export function getAllPriceIds(): string[] {
    return [...Object.values(MONTHLY_PRICES), ...Object.values(YEARLY_PRICES)];
}
