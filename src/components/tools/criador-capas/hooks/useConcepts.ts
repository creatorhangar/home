import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Categoria, CategoriaTraducao, Tag, TagTraducao, LanguageCode } from '@/lib/types'

export function useConcepts(language: LanguageCode = 'pt') {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [categoriaTraducoes, setCategoriaTraducoes] = useState<CategoriaTraducao[]>([])
  const [tagTraducoes, setTagTraducoes] = useState<TagTraducao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchConcepts()
  }, [language])

  const fetchConcepts = async () => {
    try {
      setLoading(true)
      setError(null)

      // Buscar categorias
      const { data: categoriasData, error: categoriasError } = await supabase
        .from('categorias')
        .select('*')
        .order('identificador_unico')

      if (categoriasError) throw categoriasError
      setCategorias(categoriasData || [])

      // Buscar tags
      const { data: tagsData, error: tagsError } = await supabase
        .from('tags')
        .select('*')
        .order('identificador_unico')

      if (tagsError) throw tagsError
      setTags(tagsData || [])

      // Buscar traduções de categorias
      const { data: catTraducoesData, error: catTraducoesError } = await supabase
        .from('categoria_traducoes')
        .select('*')
        .eq('codigo_idioma', language)

      if (catTraducoesError) throw catTraducoesError
      setCategoriaTraducoes(catTraducoesData || [])

      // Buscar traduções de tags
      const { data: tagTraducoesData, error: tagTraducoesError } = await supabase
        .from('tag_traducoes')
        .select('*')
        .eq('codigo_idioma', language)

      if (tagTraducoesError) throw tagTraducoesError
      setTagTraducoes(tagTraducoesData || [])

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar conceitos')
    } finally {
      setLoading(false)
    }
  }

  const createCategoria = async (identificadorUnico: string, traducoes: Record<LanguageCode, string>) => {
    try {
      // Criar categoria
      const { data: categoriaData, error: categoriaError } = await supabase
        .from('categorias')
        .insert({ identificador_unico: identificadorUnico })
        .select()
        .single()

      if (categoriaError) throw categoriaError
      if (!categoriaData) throw new Error('Erro ao criar categoria')

      // Criar traduções
      const traducoesData = Object.entries(traducoes).map(([idioma, nome]) => ({
        categoria_id: categoriaData.id,
        codigo_idioma: idioma,
        nome_traduzido: nome
      }))

      const { error: traducoesError } = await supabase
        .from('categoria_traducoes')
        .insert(traducoesData)

      if (traducoesError) throw traducoesError

      await fetchConcepts()
      return categoriaData

    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao criar categoria')
    }
  }

  const createTag = async (identificadorUnico: string, traducoes: Record<LanguageCode, string>) => {
    try {
      // Criar tag
      const { data: tagData, error: tagError } = await supabase
        .from('tags')
        .insert({ identificador_unico: identificadorUnico })
        .select()
        .single()

      if (tagError) throw tagError
      if (!tagData) throw new Error('Erro ao criar tag')

      // Criar traduções
      const traducoesData = Object.entries(traducoes).map(([idioma, nome]) => ({
        tag_id: tagData.id,
        codigo_idioma: idioma,
        nome_traduzido: nome
      }))

      const { error: traducoesError } = await supabase
        .from('tag_traducoes')
        .insert(traducoesData)

      if (traducoesError) throw traducoesError

      await fetchConcepts()
      return tagData

    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao criar tag')
    }
  }

  const updateCategoria = async (id: string, identificadorUnico?: string, traducoes?: Record<LanguageCode, string>) => {
    try {
      if (identificadorUnico) {
        const { error } = await supabase
          .from('categorias')
          .update({ identificador_unico: identificadorUnico })
          .eq('id', id)

        if (error) throw error
      }

      if (traducoes) {
        for (const [idioma, nome] of Object.entries(traducoes)) {
          const { error } = await supabase
            .from('categoria_traducoes')
            .upsert({
              categoria_id: id,
              codigo_idioma: idioma,
              nome_traduzido: nome
            })

          if (error) throw error
        }
      }

      await fetchConcepts()

    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao atualizar categoria')
    }
  }

  const updateTag = async (id: string, identificadorUnico?: string, traducoes?: Record<LanguageCode, string>) => {
    try {
      if (identificadorUnico) {
        const { error } = await supabase
          .from('tags')
          .update({ identificador_unico: identificadorUnico })
          .eq('id', id)

        if (error) throw error
      }

      if (traducoes) {
        for (const [idioma, nome] of Object.entries(traducoes)) {
          const { error } = await supabase
            .from('tag_traducoes')
            .upsert({
              tag_id: id,
              codigo_idioma: idioma,
              nome_traduzido: nome
            })

          if (error) throw error
        }
      }

      await fetchConcepts()

    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao atualizar tag')
    }
  }

  const deleteCategoria = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchConcepts()

    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao deletar categoria')
    }
  }

  const deleteTag = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchConcepts()

    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao deletar tag')
    }
  }

  const getCategoriaNome = (categoriaId: string): string => {
    const traducao = categoriaTraducoes.find(ct => ct.categoria_id === categoriaId)
    return traducao?.nome_traduzido || 'Sem categoria'
  }

  const getTagNomes = (tagIds: string[]): string[] => {
    return tagIds.map(tagId => {
      const traducao = tagTraducoes.find(tt => tt.tag_id === tagId)
      return traducao?.nome_traduzido || 'Tag desconhecida'
    })
  }

  return {
    categorias,
    tags,
    categoriaTraducoes,
    tagTraducoes,
    loading,
    error,
    createCategoria,
    createTag,
    updateCategoria,
    updateTag,
    deleteCategoria,
    deleteTag,
    getCategoriaNome,
    getTagNomes,
    refetch: fetchConcepts
  }
}