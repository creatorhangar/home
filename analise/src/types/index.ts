// ===== CORE TYPES =====

export interface ImageFile {
    id: string;
    file: File;
    url: string;
    thumbnail?: string;
    width: number;
    height: number;
}

export interface ProductInfo {
    name: string;
    subtitle?: string;
    price?: string;
    description?: string;
    tags?: string[];
}

// ===== TEMPLATE TYPES =====

export type LayoutStyle = 'elegant' | 'minimal' | 'vintage' | 'modern' | 'playful';
export type EtiquetaPosition = 'center' | 'top' | 'bottom' | 'floating' | 'corner';

export interface CapaTemplate {
    id: string;
    name: string;
    description: string;
    minImages: number;
    maxImages: number;
    style: LayoutStyle;
    etiquetaPosition: EtiquetaPosition;
    preview: string; // URL da preview
    layoutFn: (images: ImageFile[], count: number, productInfo: ProductInfo, width: number, height: number, options?: LayoutOptions) => CanvasLayout;
}

export interface LayoutOptions {
    spacing?: number; // 0 to 1 (or more) - Controls spread/gap
    chaos?: number;   // 0 to 1 - Controls randomness
    rotation?: number; // Base rotation
    seed?: number; // Seed for deterministic randomness
    showText?: boolean; // Whether to show text label
}

export interface CanvasLayout {
    width: number;
    height: number;
    background: BackgroundConfig;
    elements: CanvasElement[];
    etiqueta?: EtiquetaConfig;
}

export interface CanvasElement {
    type: 'image' | 'text' | 'shape' | 'decoration' | 'washi-tape' | 'pin';
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
    opacity?: number;
    zIndex?: number;
    // Image specific
    imageUrl?: string;
    crop?: { x: number; y: number; w: number; h: number };
    fit?: 'cover' | 'contain' | 'fill'; // Default: cover
    // Text specific
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    align?: 'left' | 'center' | 'right';
    // Shape specific
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    rx?: number; // Rounded corners X
    ry?: number; // Rounded corners Y
    shadow?: ShadowConfig;
    svgContent?: string; // SVG code or path data
}

export interface BackgroundConfig {
    type: 'solid' | 'gradient' | 'image' | 'pattern';
    color?: string;
    gradient?: {
        type: 'linear' | 'radial';
        colors: string[];
        angle?: number;
    };
    imageUrl?: string;
    opacity?: number;
}

export interface ShadowConfig {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
}

// ===== ETIQUETA TYPES =====

// ===== MODULAR LABEL TYPES =====

export type LabelStyleId = 'vintage' | 'modern' | 'luxury' | 'playful' | 'geometric';
export type EtiquetaStyle = LabelStyleId | string;

export interface LabelComponentConfig {
    enabled: boolean;
}

export interface BadgeConfig extends LabelComponentConfig {
    shape: 'circle' | 'shield' | 'tag' | 'hexagon' | 'ribbon';
    content: 'logo' | 'monogram' | 'icon' | 'empty';
    icon?: string;
    uploadedLogoUrl?: string;
    monogramText?: string;
    position: 'top-left' | 'top-right' | 'custom';
    customPosition?: { x: number, y: number };
    colors: { background: string; border: string; icon: string };
}

export interface TextStripConfig extends LabelComponentConfig {
    style: 'solid' | 'ribbon' | 'double-border' | 'blur' | 'outline';
    shape?: string; // Key from LABEL_SHAPES
    texts: {
        top: string;
        center: string;
        bottom: string;
    };
    showLines: { top: boolean; center: boolean; bottom: boolean };
    position: 'top' | 'center' | 'bottom' | 'custom';
    customY?: number;
    colors: { background: string; text: string };
    fontFamily: string;
    opacity?: number;
}

export interface ProductNameConfig extends LabelComponentConfig {
    text: string;
    position: 'strip-center' | 'card-below' | 'overlay-bottom';
    fontSize: number;
    color: string;
}

export interface BrandConfig extends LabelComponentConfig {
    text: string;
    position: 'footer' | 'badge' | 'opposite-corner';
    style: 'discreet' | 'highlight';
    color: string;
}

export interface InfoLineConfig extends LabelComponentConfig {
    text: string;
    position: 'footer' | 'below-strip';
    color: string;
    fontSize: number;
}

export interface LabelBackgroundConfig {
    type: 'photo' | 'texture' | 'solid' | 'pattern';
    value: string; // url or color code
    opacity: number;
    filter: 'none' | 'vintage' | 'sepia';
}

export interface ModularLabelConfig {
    styleId: LabelStyleId;
    variant?: 'cover' | 'showcase'; // New property
    // Dimensions relative to the canvas
    x: number;
    y: number;
    width: number;
    height: number;

    badge: BadgeConfig;
    textStrip: TextStripConfig;
    productName: ProductNameConfig;
    brand: BrandConfig;
    infoLine: InfoLineConfig;
    background: LabelBackgroundConfig;

    // Global overrides
    fontFamilyPrimary: string;
    fontFamilySecondary: string;
}

// Legacy support
export interface LegacyLabelConfig {
    style: string;
    mainText: string;
    subText?: string;
    x: number;
    y: number;
    width: number;
    height: number;
    colors?: {
        bg: string;
        text: string;
        border: string;
        accent: string;
    };
    fontFamily?: string;
}

export type EtiquetaConfig = ModularLabelConfig | LegacyLabelConfig;

// ===== MOCKUP TYPES =====

export interface MockupTemplate {
    id: string;
    name: string;
    category: 'home-decor' | 'tech' | 'lifestyle' | 'stationery' | 'flat-lay';
    baseImage: string;
    maskRegions: MockupRegion[];
    preview: string;
}

export interface MockupRegion {
    id: string;
    name: string;
    // Perspectiva/transformação para aplicar a imagem
    transform: {
        points: [number, number][]; // 4 pontos para perspectiva
    };
    width: number;
    height: number;
    // Sombra/blend mode
    blendMode?: 'normal' | 'multiply' | 'overlay' | 'soft-light';
    opacity?: number;
    shadow?: ShadowConfig;
}

// ===== OUTPUT TYPES =====

export interface GeneratedOutput {
    id: string;
    type: 'showcase' | 'mockup' | 'hero' | 'social';
    name: string;
    templateId: string;
    blob: Blob;
    url: string;
    width: number;
    height: number;
    format: 'png' | 'jpg' | 'webp';
}

export interface BatchProgress {
    total: number;
    completed: number;
    current: string;
    percentage: number;
}

// ===== GENERATOR OPTIONS =====

export type AspectRatio = '1:1' | '4:5' | '3:4' | '9:16' | 'landscape';

export interface GeneratorOptions {
    mode: 'quick' | 'advanced';
    aspectRatio: AspectRatio; // Global aspect ratio
    // Quick mode
    quickOptions?: {
        generateAll: boolean; // Gera todos os templates compatíveis
        randomMockups?: number; // Quantos mockups aleatórios
    };
    // Advanced mode
    advancedOptions?: {
        selectedTemplates: string[]; // IDs dos templates escolhidos
        selectedMockups: string[];
        etiquetaStyle?: EtiquetaStyle;
        customColors?: {
            primary: string;
            secondary: string;
            accent: string;
        };
        outputFormat: 'png' | 'jpg' | 'webp';
        quality: number; // 0-100
    };
}

// ===== APP STATE =====

export interface AppState {
    step: 'upload' | 'info' | 'preview' | 'generating' | 'results';
    images: ImageFile[];
    productInfo: ProductInfo;
    generatorOptions: GeneratorOptions;
    availableTemplates: CapaTemplate[];
    outputs: GeneratedOutput[];
    progress: BatchProgress | null;
}
