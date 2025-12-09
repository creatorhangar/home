export type TemaVisual = {
  id: string
  nome_tema: string
  cores_primarias: string[]
  cores_acento: string[]
  tipografia: {
    heading: string
    body: string
    tamanhos: {
      titulo: string
      subtitulo: string
      corpo: string
    }
  }
  estilo_bordas: string
  estilo_sombras: string
}

export const TEMAS: TemaVisual[] = [
  {
    id: 'tema-minimalist-sage',
    nome_tema: 'Minimalist Sage',
    cores_primarias: ['#F8F9F8', '#FFFFFF', '#3D3D3D'],
    cores_acento: ['#A8B5A0', '#E8EDE7', '#7A8A73', '#D4DBD0'],
    tipografia: {
      heading: 'font-serif',
      body: 'font-sans',
      tamanhos: {
        titulo: 'text-3xl',
        subtitulo: 'text-lg',
        corpo: 'text-sm',
      },
    },
    estilo_bordas: 'rounded-lg',
    estilo_sombras: 'shadow-sm',
  },
  {
    id: 'tema-warm-boho',
    nome_tema: 'Warm Boho',
    cores_primarias: ['#FCF7F1', '#FFFFFF', '#3D3D3D'],
    cores_acento: ['#C77D5D', '#E7D8C7', '#E0C48A', '#BFA685'],
    tipografia: {
      heading: 'font-serif',
      body: 'font-sans',
      tamanhos: {
        titulo: 'text-3xl',
        subtitulo: 'text-lg',
        corpo: 'text-sm',
      },
    },
    estilo_bordas: 'rounded-2xl',
    estilo_sombras: 'shadow-md',
  },
  {
    id: 'tema-corporate-blue',
    nome_tema: 'Corporate Blue',
    cores_primarias: ['#FFFFFF', '#F3F5F8', '#1F2A44'],
    cores_acento: ['#1E3A8A', '#64748B', '#93C5FD'],
    tipografia: {
      heading: 'font-sans',
      body: 'font-sans',
      tamanhos: {
        titulo: 'text-3xl',
        subtitulo: 'text-lg',
        corpo: 'text-sm',
      },
    },
    estilo_bordas: 'rounded-sm',
    estilo_sombras: 'shadow',
  },
  {
    id: 'tema-soft-lavender',
    nome_tema: 'Soft Lavender',
    cores_primarias: ['#FFFFFF', '#FAFAFF', '#3D3D3D'],
    cores_acento: ['#C7B7DD', '#F0E7FA', '#E7CBEA', '#D9D4E7'],
    tipografia: {
      heading: 'font-serif',
      body: 'font-sans',
      tamanhos: {
        titulo: 'text-3xl',
        subtitulo: 'text-lg',
        corpo: 'text-sm',
      },
    },
    estilo_bordas: 'rounded-xl',
    estilo_sombras: 'shadow',
  },
  {
    id: 'tema-monochrome-elegant',
    nome_tema: 'Monochrome Elegant',
    cores_primarias: ['#FFFFFF', '#F7F7F7', '#111827'],
    cores_acento: ['#000000', '#6B7280', '#9CA3AF'],
    tipografia: {
      heading: 'font-serif',
      body: 'font-sans',
      tamanhos: {
        titulo: 'text-3xl',
        subtitulo: 'text-lg',
        corpo: 'text-sm',
      },
    },
    estilo_bordas: 'rounded-md',
    estilo_sombras: 'shadow-lg',
  },
]