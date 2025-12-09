export enum ImageStatus {
  Pending = 'pending',
  Processing = 'processing',
  Done = 'done',
  Error = 'error',
}

export interface ImageFile {
  id: string;
  file: File;
  originalURL: string;
  processedURL: string | null;
  status: ImageStatus;
  error: string | null;
  progress?: { stage: string; iter?: number; pct?: number };
  removalInfo?: Array<{
    color: { r: number; g: number; b: number; a: number; };
    point?: { x: number; y: number; };
    isAuto: boolean;
  }>;
  customOptions?: import('./utils/imageProcessor').RemovalOptions;
}

export interface ConfiguracaoExportacao {
  fundos: {
    tipo: 'quadriculado' | 'branco' | 'preto' | 'cor-solida' | 'cores-personalizadas';
    corSolida?: string;
    coresPersonalizadas?: string[];
    modoAplicacao?: 'sequencial' | 'aleatorio';
    paletaSelecionada?: 'neutros' | 'suaves' | null;
  };
  dimensoes: {
    modo: 'original' | 'preset' | 'personalizado';
    preset?: '1:1' | '4:5' | '16:9' | '9:16' | '3:4' | '4:3' | '2:3' | '21:9' | '1.91:1';
    custom?: { width: number; height: number; };
  };
  ajustes: {
    padding: number;
    fitMode: 'contain' | 'cover' | 'fill';
    centralizar: boolean;
    manterProporcao: boolean;
  };
  formato: {
    tipo: 'png' | 'jpg';
    qualidade?: number;
  };
  circle?: {
    enabled: boolean;
    borderColor: string;
    borderWidth: number;
  };
}
