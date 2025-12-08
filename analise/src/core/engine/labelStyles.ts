import type { ModularLabelConfig } from '../../types';

export const DEFAULT_LABEL_CONFIG: ModularLabelConfig = {
    styleId: 'modern',
    variant: 'showcase', // Default variant
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    fontFamilyPrimary: 'Inter',
    fontFamilySecondary: 'Roboto',
    badge: {
        enabled: false,
        shape: 'circle',
        content: 'icon',
        position: 'top-left',
        colors: { background: '#000000', border: '#FFFFFF', icon: '#FFFFFF' }
    },
    textStrip: {
        enabled: true,
        style: 'solid',
        texts: { top: 'CATEGORY', center: 'MAIN TITLE', bottom: 'Subtitle' },
        showLines: { top: true, center: true, bottom: true },
        position: 'center',
        colors: { background: '#000000', text: '#FFFFFF' },
        fontFamily: 'Inter',
        opacity: 1
    },
    productName: {
        enabled: false,
        text: 'Product Name',
        position: 'card-below',
        fontSize: 32, // Increased from 24
        color: '#000000'
    },
    brand: {
        enabled: true,
        text: 'Brand Name',
        position: 'footer',
        style: 'discreet',
        color: '#666666'
    },
    infoLine: {
        enabled: true,
        text: 'INFO | SPECS',
        position: 'footer',
        color: '#999999',
        fontSize: 14 // Increased from 12
    },
    background: {
        type: 'solid',
        value: '#FFFFFF',
        opacity: 1,
        filter: 'none'
    }
};

export const LABEL_STYLES: Record<string, Partial<ModularLabelConfig>> = {
    'vintage': {
        styleId: 'vintage',
        fontFamilyPrimary: 'Georgia',
        fontFamilySecondary: 'Courier New',
        badge: {
            enabled: true,
            shape: 'tag',
            content: 'icon',
            position: 'top-left',
            colors: { background: '#a8c3bc', border: '#FFFFFF', icon: '#FFFFFF' }
        },
        textStrip: {
            enabled: true,
            style: 'ribbon',
            texts: { top: 'VINTAGE', center: 'COLLECTION', bottom: 'Est. 2024' },
            showLines: { top: true, center: true, bottom: true },
            position: 'center',
            colors: { background: '#8b5a3c', text: '#F9F5E9' },
            fontFamily: 'Georgia',
            opacity: 1
        },
        background: {
            type: 'texture',
            value: 'kraft', // Placeholder for texture logic
            opacity: 1,
            filter: 'vintage'
        }
    },
    'modern': {
        styleId: 'modern',
        fontFamilyPrimary: 'Inter',
        fontFamilySecondary: 'Roboto',
        badge: {
            enabled: true,
            shape: 'circle',
            content: 'empty',
            position: 'top-right',
            colors: { background: '#000000', border: '#FFFFFF', icon: '#FFFFFF' }
        },
        textStrip: {
            enabled: true,
            style: 'blur',
            texts: { top: 'NEW', center: 'ARRIVAL', bottom: 'Shop Now' },
            showLines: { top: true, center: true, bottom: false },
            position: 'bottom',
            colors: { background: '#000000', text: '#FFFFFF' }, // Solid color, opacity handled by prop
            fontFamily: 'Inter',
            opacity: 0.8
        }
    },
    'luxury': {
        styleId: 'luxury',
        fontFamilyPrimary: 'Cormorant Garamond',
        fontFamilySecondary: 'Montserrat',
        badge: {
            enabled: true,
            shape: 'shield',
            content: 'monogram',
            monogramText: 'L',
            position: 'top-left',
            colors: { background: '#1a2332', border: '#D4AF37', icon: '#D4AF37' }
        },
        textStrip: {
            enabled: true,
            style: 'double-border',
            texts: { top: 'PREMIUM', center: 'EDITION', bottom: 'Limited' },
            showLines: { top: true, center: true, bottom: true },
            position: 'center',
            colors: { background: '#1a2332', text: '#D4AF37' },
            fontFamily: 'Cormorant Garamond',
            opacity: 1
        }
    },
    'playful': {
        styleId: 'playful',
        fontFamilyPrimary: 'Quicksand',
        fontFamilySecondary: 'Fredoka One',
        badge: {
            enabled: true,
            shape: 'circle',
            content: 'icon',
            position: 'custom',
            customPosition: { x: 10, y: 10 },
            colors: { background: '#a8b5a0', border: '#d4a59a', icon: '#FFFFFF' }
        },
        textStrip: {
            enabled: true,
            style: 'solid',
            texts: { top: 'FUN', center: 'STUFF', bottom: 'For Kids' },
            showLines: { top: true, center: true, bottom: true },
            position: 'center',
            colors: { background: '#d4b896', text: '#FFFFFF' },
            fontFamily: 'Quicksand',
            opacity: 1
        }
    },
    'geometric': {
        styleId: 'geometric',
        fontFamilyPrimary: 'Montserrat',
        fontFamilySecondary: 'Arial',
        badge: {
            enabled: true,
            shape: 'hexagon',
            content: 'empty',
            position: 'top-right',
            colors: { background: '#FF0000', border: '#000000', icon: '#FFFFFF' }
        },
        textStrip: {
            enabled: true,
            style: 'outline',
            texts: { top: 'BOLD', center: 'DESIGN', bottom: '2024' },
            showLines: { top: true, center: true, bottom: false },
            position: 'center',
            colors: { background: '#FFFF00', text: '#000000' },
            fontFamily: 'Montserrat',
            opacity: 1
        }
    },
    'boho': {
        styleId: 'boho',
        fontFamilyPrimary: 'Playfair Display',
        fontFamilySecondary: 'Lato',
        badge: {
            enabled: false, // Clean look for cover
            shape: 'circle',
            content: 'empty',
            position: 'top-left',
            colors: { background: '#d4b896', border: '#FFFFFF', icon: '#FFFFFF' }
        },
        textStrip: {
            enabled: true,
            style: 'solid',
            shape: 'scalloped-oval', // Premium Shape
            texts: { top: 'The', center: 'Collection', bottom: 'Premium Quality' },
            showLines: { top: true, center: true, bottom: true },
            position: 'center',
            colors: { background: '#F9F5E9', text: '#5D4037' }, // Warm beige and brown
            fontFamily: 'Playfair Display',
            opacity: 1
        }
    }
};

export const getLabelConfig = (styleId: string): ModularLabelConfig => {
    const base = { ...DEFAULT_LABEL_CONFIG };
    const style = LABEL_STYLES[styleId];

    if (style) {
        // Deep merge logic would be better, but simple spread for top-level props works for now
        // For nested objects, we need to be careful.
        return {
            ...base,
            ...style,
            badge: { ...base.badge, ...(style.badge || {}) },
            textStrip: { ...base.textStrip, ...(style.textStrip || {}) },
            productName: { ...base.productName, ...(style.productName || {}) },
            brand: { ...base.brand, ...(style.brand || {}) },
            infoLine: { ...base.infoLine, ...(style.infoLine || {}) },
            background: { ...base.background, ...(style.background || {}) },
        };
    }

    return base;
};
