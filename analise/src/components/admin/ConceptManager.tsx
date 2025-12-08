'use client'

import { useState } from 'react'
import { useConcepts } from '@/hooks/useConcepts'
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react'
import { LanguageCode } from '@/lib/types'
import toast from 'react-hot-toast'

interface ConceptManagerProps {
  language: LanguageCode
}

export default function ConceptManager({ language }: ConceptManagerProps) {
  const { categorias, tags, categoriaTraducoes, tagTraducoes, loading, error, createCategoria, createTag, updateCategoria, updateTag, deleteCategoria, deleteTag, refetch } = useConcepts(language)
  
  const [activeTab, setActiveTab] = useState<'categorias' | 'tags'>('categorias')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ identificador_unico: '', nome_traduzido: '' })
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createForm, setCreateForm] = useState({ identificador_unico: '', nome_traduzido: '' })

  const supportedLanguages: LanguageCode[] = ['pt', 'en', 'es', 'fr', 'ja']

  const handleCreate = async () => {
    if (!createForm.identificador_unico || !createForm.nome_traduzido) {
      toast.error('Por favor, preencha todos os campos')
      return
    }

    try {
      const traducoes = supportedLanguages.reduce((acc, lang) => {
        acc[lang] = lang === language ? createForm.nome_traduzido : createForm.nome_traduzido
        return acc
      }, {} as Record<LanguageCode, string>)

      if (activeTab === 'categorias') {
        await createCategoria(createForm.identificador_unico, traducoes)
        toast.success('Categoria criada com sucesso!')
      } else {
        await createTag(createForm.identificador_unico, traducoes)
        toast.success('Tag criada com sucesso!')
      }

      setCreateForm({ identificador_unico: '', nome_traduzido: '' })
      setShowCreateForm(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao criar conceito')
    }
  }

  const handleUpdate = async (id: string) => {
    if (!editForm.identificador_unico && !editForm.nome_traduzido) {
      toast.error('Por favor, preencha pelo menos um campo para atualizar')
      return
    }

    try {
      const updates: any = {}
      if (editForm.identificador_unico) {
        updates.identificador_unico = editForm.identificador_unico
      }
      if (editForm.nome_traduzido) {
        updates.traducoes = { [language]: editForm.nome_traduzido }
      }

      if (activeTab === 'categorias') {
        await updateCategoria(id, updates.identificador_unico, updates.traducoes)
      } else {
        await updateTag(id, updates.identificador_unico, updates.traducoes)
      }

      toast.success('Conceito atualizado com sucesso!')
      setEditingId(null)
      setEditForm({ identificador_unico: '', nome_traduzido: '' })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar conceito')
    }
  }

  const handleDelete = async (id: string, type: 'categoria' | 'tag') => {
    if (!confirm('Tem certeza que deseja deletar este conceito?')) {
      return
    }

    try {
      if (type === 'categoria') {
        await deleteCategoria(id)
      } else {
        await deleteTag(id)
      }
      toast.success('Conceito deletado com sucesso!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao deletar conceito')
    }
  }

  const getTraducao = (id: string, type: 'categoria' | 'tag'): string => {
    if (type === 'categoria') {
      const traducao = categoriaTraducoes.find(ct => ct.categoria_id === id)
      return traducao?.nome_traduzido || 'Sem tradução'
    } else {
      const traducao = tagTraducoes.find(tt => tt.tag_id === id)
      return traducao?.nome_traduzido || 'Sem tradução'
    }
  }

  const items = activeTab === 'categorias' ? categorias : tags

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={refetch}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Gerenciar Conceitos ({language.toUpperCase()})
        </h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Novo {activeTab === 'categorias' ? 'Categoria' : 'Tag'}
        </button>
      </div>

      {/* Abas */}
      <div className="flex mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('categorias')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'categorias'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Categorias ({categorias.length})
        </button>
        <button
          onClick={() => setActiveTab('tags')}
          className={`px-4 py-2 font-medium ml-6 ${
            activeTab === 'tags'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Tags ({tags.length})
        </button>
      </div>

      {/* Form de criação */}
      {showCreateForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">
            Criar nova {activeTab === 'categorias' ? 'categoria' : 'tag'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Identificador único
              </label>
              <input
                type="text"
                value={createForm.identificador_unico}
                onChange={(e) => setCreateForm(prev => ({ ...prev, identificador_unico: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Ex: ${activeTab === 'categorias' ? 'cat_nova' : 'tag_nova'}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome em {language.toUpperCase()}
              </label>
              <input
                type="text"
                value={createForm.nome_traduzido}
                onChange={(e) => setCreateForm(prev => ({ ...prev, nome_traduzido: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome traduzido"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              <Save className="w-4 h-4 inline mr-1" />
              Criar
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false)
                setCreateForm({ identificador_unico: '', nome_traduzido: '' })
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              <X className="w-4 h-4 inline mr-1" />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de itens */}
      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhuma {activeTab === 'categorias' ? 'categoria' : 'tag'} encontrada
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4">
              {editingId === item.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Identificador único
                      </label>
                      <input
                        type="text"
                        value={editForm.identificador_unico}
                        onChange={(e) => setEditForm(prev => ({ ...prev, identificador_unico: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={item.identificador_unico}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome em {language.toUpperCase()}
                      </label>
                      <input
                        type="text"
                        value={editForm.nome_traduzido}
                        onChange={(e) => setEditForm(prev => ({ ...prev, nome_traduzido: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={getTraducao(item.id, activeTab === 'categorias' ? 'categoria' : 'tag')}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(item.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      <Save className="w-4 h-4 inline mr-1" />
                      Salvar
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null)
                        setEditForm({ identificador_unico: '', nome_traduzido: '' })
                      }}
                      className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      <X className="w-4 h-4 inline mr-1" />
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-gray-800">{getTraducao(item.id, activeTab === 'categorias' ? 'categoria' : 'tag')}</h4>
                    <p className="text-sm text-gray-600">{item.identificador_unico}</p>
                    <p className="text-xs text-gray-500">ID: {item.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(item.id)
                        setEditForm({ identificador_unico: '', nome_traduzido: '' })
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, activeTab === 'categorias' ? 'categoria' : 'tag')}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}