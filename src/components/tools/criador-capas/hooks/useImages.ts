import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Imagem, LanguageCode, SearchParams } from '@/lib/types'

export function useImages(language: LanguageCode = 'pt', searchParams?: SearchParams) {
  const [images, setImages] = useState<Imagem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)

  const limit = searchParams?.limite || 50

  useEffect(() => {
    setImages([])
    setOffset(0)
    setHasMore(true)
    fetchImages(true)
  }, [language, searchParams?.tag_busca, searchParams?.categoria_busca])

  const fetchImages = async (reset = false) => {
    try {
      setLoading(true)
      setError(null)

      const currentOffset = reset ? 0 : offset

      // Usar a função RPC para busca multi-idiomas
      const { data, error: rpcError } = await supabase
        .rpc('search_images', {
          idioma_busca: language,
          tag_busca: searchParams?.tag_busca || null,
          categoria_busca: searchParams?.categoria_busca || null,
          limite: limit,
          offset_val: currentOffset
        })

      if (rpcError) throw rpcError

      const newImages = data || []

      if (reset) {
        setImages(newImages)
      } else {
        setImages(prev => [...prev, ...newImages])
      }

      setHasMore(newImages.length === limit)
      setOffset(currentOffset + newImages.length)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar imagens')
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchImages()
    }
  }

  const createImage = async (imageData: {
    categoria_id: string
    destacado: boolean
    url_publica: string
    cor_dominante?: string
    tag_ids: string[]
  }) => {
    try {
      // Criar imagem
      const { data: newImage, error: imageError } = await supabase
        .from('imagens')
        .insert({
          categoria_id: imageData.categoria_id,
          destacado: imageData.destacado,
          url_publica: imageData.url_publica,
          cor_dominante: imageData.cor_dominante
        })
        .select()
        .single()

      if (imageError) throw imageError
      if (!newImage) throw new Error('Erro ao criar imagem')

      // Criar junções com tags
      if (imageData.tag_ids.length > 0) {
        const joinData = imageData.tag_ids.map(tagId => ({
          imagem_id: newImage.id,
          tag_id: tagId
        }))

        const { error: joinError } = await supabase
          .from('imagem_tags_join')
          .insert(joinData)

        if (joinError) throw joinError
      }

      // Atualizar lista de imagens
      await fetchImages(true)
      return newImage

    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao criar imagem')
    }
  }

  const updateImage = async (id: string, updates: Partial<Imagem>) => {
    try {
      const { error } = await supabase
        .from('imagens')
        .update(updates)
        .eq('id', id)

      if (error) throw error
      await fetchImages(true)

    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao atualizar imagem')
    }
  }

  const deleteImage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('imagens')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchImages(true)

    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao deletar imagem')
    }
  }

  const getFeaturedImages = async (limit = 10) => {
    try {
      const { data, error } = await supabase
        .from('imagens')
        .select('*')
        .eq('destacado', true)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []

    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao buscar imagens destacadas')
    }
  }

  const getRecentImages = async (limit = 20) => {
    try {
      const { data, error } = await supabase
        .from('imagens')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []

    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao buscar imagens recentes')
    }
  }

  return {
    images,
    loading,
    error,
    hasMore,
    loadMore,
    createImage,
    updateImage,
    deleteImage,
    getFeaturedImages,
    getRecentImages,
    refetch: () => fetchImages(true)
  }
}