export interface Categoria {
  id: string
  identificador_unico: string
}

export interface Tag {
  id: string
  identificador_unico: string
}

export interface CategoriaTraducao {
  id: string
  categoria_id: string
  codigo_idioma: string
  nome_traduzido: string
}

export interface TagTraducao {
  id: string
  tag_id: string
  codigo_idioma: string
  nome_traduzido: string
}

export interface Imagem {
  id: string
  categoria_id: string
  destacado: boolean
  url_publica: string
  cor_dominante: string | null
  created_at: string
}

export interface ImagemTagJoin {
  imagem_id: string
  tag_id: string
}

export interface ImagemComTraducao extends Imagem {
  categoria_nome: string
  tags: string[]
}

export type LanguageCode = 'pt' | 'en' | 'es' | 'fr' | 'ja'

export interface SearchParams {
  idioma_busca?: LanguageCode
  tag_busca?: string
  categoria_busca?: string
  limite?: number
  offset_val?: number
}