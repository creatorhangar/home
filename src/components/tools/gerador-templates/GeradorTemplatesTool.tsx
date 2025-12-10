'use client';

import './index.css';
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs'
import { Popover, PopoverTrigger, PopoverContent } from '@radix-ui/react-popover'
import { TEMAS } from './themes'
import { WidgetRenderer, WidgetEntry, IconPicker } from './widgets'
import { Palette, Save, Settings, Undo2, Redo2, Download, PanelLeft, PanelRight, ChevronDown, ChevronRight, LayoutTemplate, Layers, MousePointerClick } from 'lucide-react'
import { HexColorPicker } from 'react-colorful'
import { toPng, toJpeg } from 'html-to-image'
import jspdf from 'jspdf'
import { TEMPLATES_CATALOG, TemplateDefinition } from './templates'

type LayoutState = {
  temaId: string
  widgets: WidgetEntry[]
  updatedAt?: number
  pages?: { id: string; title: string; widgets: WidgetEntry[] }[]
  activePageId?: string | null
  canvasTextureLayers?: TextureLayer[]
}

type TextureLayer = { id: string; src: string; name?: string; scope: 'page' | 'widget'; fill: 'esticar' | 'repetir' | 'centralizar'; angle: number; posX: number; posY: number; scale: number; opacity?: number; zIndex: number }

import { useUsage } from '@/lib/hooks/useUsage'
import { useRouter } from 'next/navigation'

const STORAGE_KEY = 'template_creator_layout'

export default function GeradorTemplatesTool() {
  const { incrementUsage } = useUsage()
  const router = useRouter()
  const [temaId, setTemaId] = useState<string>(TEMAS[0].id)
  const [widgets, setWidgets] = useState<LayoutState['widgets']>([
    { type: 'texto', props: { content: 'Título Grande', align: 'left', tipo: 'titulo' } },
    { type: 'controleDeAgua', props: { total: 8, filled: 5, layout: 'grid' } },
    { type: 'listaDeTarefas', props: { items: [{ text: 'Ideia 1', done: false }, { text: 'Ideia 2', done: true }], variant: 'checkbox' } },
    { type: 'progressBar', props: { titulo: 'Ler 12 livros', valor_atual: 5, valor_meta: 12, tipo_barra: 'linear' } },
    { type: 'plannerSemanal', props: {} },
  ])
  const [selected, setSelected] = useState<number | null>(null)
  const [pane, setPane] = useState<'widgets' | 'templates'>('widgets')
  const [pages, setPages] = useState<{ id: string; title: string; widgets: WidgetEntry[] }[]>([])
  const [activePageId, setActivePageId] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [canvasTextureLayers, setCanvasTextureLayers] = useState<TextureLayer[]>([])
  const tema = useMemo(() => TEMAS.find(t => t.id === temaId)!, [temaId])
  const [showExport, setShowExport] = useState(false)
  const [exportFormat, setExportFormat] = useState<'png' | 'jpg' | 'pdf'>('png')
  const [exportScale, setExportScale] = useState(2)
  const [exportBg, setExportBg] = useState(true)
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const [history, setHistory] = useState<WidgetEntry[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [templateQuery, setTemplateQuery] = useState('')
  const [activeTags, setActiveTags] = useState<string[]>([])

  // UI State
  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({})

  const toggleCategory = (cat: string) => setCollapsedCategories(prev => ({ ...prev, [cat]: !prev[cat] }))
  const ACCEPT_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml']
  const MAX_UPLOAD_MB = 8
  const toMB = (bytes: number) => Math.round(bytes / (1024 * 1024))
  const makeLayerFromFile = (file: File, scope: 'page' | 'widget') => {
    const okType = ACCEPT_TYPES.includes(file.type)
    const okSize = file.size <= MAX_UPLOAD_MB * 1024 * 1024
    if (!okType || !okSize) return null
    const url = URL.createObjectURL(file)
    return { id: `tex-${Date.now()}-${Math.round(Math.random() * 1000)}`, src: url, name: file.name, scope, fill: 'esticar' as const, angle: 0, posX: 0, posY: 0, scale: 1, opacity: 1, zIndex: 0 }
  }

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const parsed: LayoutState = JSON.parse(raw)
        setTemaId(parsed.temaId)
        if (parsed.pages?.length) {
          setPages(parsed.pages)
          setActivePageId(parsed.activePageId || parsed.pages[0].id)
          const current = parsed.pages.find(p => p.id === (parsed.activePageId || parsed.pages[0].id))
          const w = current ? current.widgets : parsed.widgets
          setWidgets(w || [])
          setHistory([w || []])
          setHistoryIndex(0)
        } else {
          const firstId = `page-${Date.now()}`
          const initial = parsed.widgets || []
          setPages([{ id: firstId, title: 'Página 1', widgets: initial }])
          setActivePageId(firstId)
          setWidgets(initial)
          setHistory([initial])
          setHistoryIndex(0)
        }
      } catch { }
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      const state: LayoutState = { temaId, widgets, pages, activePageId, updatedAt: Date.now() }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }, 10000)
    return () => clearInterval(timer)
  }, [temaId, widgets, pages, activePageId])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (historyIndex > 0) {
          const idx = historyIndex - 1
          setHistoryIndex(idx)
          setWidgets(history[idx])
        }
      } else if ((e.ctrlKey && e.key.toLowerCase() === 'y') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'z')) {
        e.preventDefault()
        if (historyIndex < history.length - 1) {
          const idx = historyIndex + 1
          setHistoryIndex(idx)
          setWidgets(history[idx])
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [history, historyIndex])

  const pushNext = (next: WidgetEntry[]) => {
    setWidgets(next)
    setHistory(h => {
      const sliced = h.slice(0, historyIndex + 1)
      const newArr = [...sliced, next]
      setHistoryIndex(newArr.length - 1)
      return newArr
    })
    setPages(prev => prev.map(p => p.id === (activePageId || prev[0]?.id) ? { ...p, widgets: next } : p))
  }
  const updateWidgets = (fn: (prev: WidgetEntry[]) => WidgetEntry[]) => setWidgets(prev => {
    const next = fn(prev)
    const sliced = history.slice(0, historyIndex + 1)
    const newArr = [...sliced, next]
    setHistory(newArr)
    setHistoryIndex(newArr.length - 1)
    setPages(prevPages => prevPages.map(p => p.id === (activePageId || prevPages[0]?.id) ? { ...p, widgets: next } : p))
    return next
  })
  const addPage = (title?: string) => {
    const id = `page-${Date.now()}-${Math.round(Math.random() * 1000)}`
    const newPage = { id, title: title || `Página ${pages.length + 1}`, widgets: [] as WidgetEntry[] }
    setPages(prev => [...prev, newPage])
    setActivePageId(id)
    setWidgets([])
    setHistory([[]])
    setHistoryIndex(0)
  }
  const duplicatePage = () => {
    const current = pages.find(p => p.id === (activePageId || pages[0]?.id))
    if (!current) return
    const id = `page-${Date.now()}-${Math.round(Math.random() * 1000)}`
    const copy = { id, title: `${current.title} (cópia)`, widgets: [...current.widgets] }
    setPages(prev => [...prev, copy])
    setActivePageId(id)
    pushNext([...current.widgets])
  }
  const removePage = (id: string) => {
    setPages(prev => {
      const filtered = prev.filter(p => p.id !== id)
      const nextActive = filtered[0]?.id || null
      setActivePageId(nextActive)
      const nextWidgets = filtered.find(p => p.id === nextActive)?.widgets || []
      setWidgets(nextWidgets)
      setHistory([nextWidgets])
      setHistoryIndex(0)
      return filtered
    })
  }
  const setActivePage = (id: string) => {
    setActivePageId(id)
    const page = pages.find(p => p.id === id)
    const w = page?.widgets || []
    setWidgets(w)
    setHistory([w])
    setHistoryIndex(0)
  }
  const addTexto = () => updateWidgets(w => [...w, { type: 'texto', props: { content: 'Novo texto', align: 'left', tipo: 'paragrafo' } }])
  const addAgua = () => updateWidgets(w => [...w, { type: 'controleDeAgua', props: { total: 8, filled: 0, layout: 'grid' } }])
  const addLista = () => updateWidgets(w => [...w, { type: 'listaDeTarefas', props: { items: [{ text: 'Tarefa 1', done: false }, { text: 'Tarefa 2', done: false }], variant: 'checkbox' } }])
  const addProgress = () => updateWidgets(w => [...w, { type: 'progressBar', props: { titulo: 'Progresso', valor_atual: 3, valor_meta: 10, tipo_barra: 'circular' } }])
  const addMood = () => updateWidgets(w => [...w, { type: 'moodTracker', props: { dias: 30 } }])
  const addDivisor = () => updateWidgets(w => [...w, { type: 'divisor', props: { tipo: 'icone', cor: '#EAEAEA' } }])
  const addImagem = () => updateWidgets(w => [...w, { type: 'imagem', props: { src: '', filtro: 'none', rounded: true } }])
  const addListaNum = () => updateWidgets(w => [...w, { type: 'listaNumerada', props: { itens: ['Item 1', 'Item 2', 'Item 3'], estilo: '1' } }])
  const addListaPontos = () => updateWidgets(w => [...w, { type: 'listaComPontos', props: { itens: ['Ponto A', 'Ponto B', 'Ponto C'], icone: 'Star' } }])
  const addPlannerMensal = () => updateWidgets(w => [...w, { type: 'plannerMensal', props: { dias: 30 } }])
  const addPrioridades = () => updateWidgets(w => [...w, { type: 'prioridadesDoDia', props: {} }])
  const addHorarioDia = () => updateWidgets(w => [...w, { type: 'horarioDoMeuDia', props: {} }])
  const addHabitos = () => updateWidgets(w => [...w, { type: 'trackerDeHabitos', props: {} }])
  const addSono = () => updateWidgets(w => [...w, { type: 'trackerDeSono', props: {} }])
  const addRefeicoes = () => updateWidgets(w => [...w, { type: 'refeicoes', props: {} }])
  const addGastos = () => updateWidgets(w => [...w, { type: 'controleDeGastos', props: {} }])
  const addPoupanca = () => updateWidgets(w => [...w, { type: 'poupanca', props: { atual: 500, meta: 1000 } }])
  const addContador = () => updateWidgets(w => [...w, { type: 'contadorRegressivo', props: { diasRestantes: 30 } }])
  const addMetas3Meses = () => updateWidgets(w => [...w, { type: 'metas3Meses', props: {} }])
  const moveUp = (idx: number) => updateWidgets(w => {
    if (idx <= 0) return w
    const next = [...w]
      ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
    return next
  })
  const moveDown = (idx: number) => updateWidgets(w => {
    if (idx >= w.length - 1) return w
    const next = [...w]
      ;[next[idx + 1], next[idx]] = [next[idx], next[idx + 1]]
    return next
  })
  const bringFront = (idx: number) => updateWidgets(w => {
    const next = [...w]
    const item = next.splice(idx, 1)[0]
    next.push(item)
    return next
  })
  const sendBack = (idx: number) => updateWidgets(w => {
    const next = [...w]
    const item = next.splice(idx, 1)[0]
    next.unshift(item)
    return next
  })
  const undo = () => {
    if (historyIndex > 0) {
      const idx = historyIndex - 1
      setHistoryIndex(idx)
      setWidgets(history[idx])
    }
  }
  const redo = () => {
    if (historyIndex < history.length - 1) {
      const idx = historyIndex + 1
      setHistoryIndex(idx)
      setWidgets(history[idx])
    }
  }
  const allTags = useMemo(() => Array.from(new Set(TEMPLATES_CATALOG.flatMap(t => t.tags))), [])
  const filteredTemplates = useMemo(() => {
    const q = templateQuery.toLowerCase()
    return TEMPLATES_CATALOG.filter(t => {
      const qOk = !q || t.title.toLowerCase().includes(q) || t.tags.some(tag => tag.toLowerCase().includes(q))
      const tagsOk = activeTags.length === 0 || activeTags.every(tag => t.tags.includes(tag))
      return qOk && tagsOk
    })
  }, [templateQuery, activeTags])
  const doExport = async () => {
    // USAGE LIMIT CHECK
    try {
      await incrementUsage();
    } catch (error: any) {
      if (error.message === 'LIMIT_REACHED') {
        if (confirm('Limite diário atingido! Atualize para o plano PRO para downloads ilimitados.')) {
          router.push('/dashboard?upgrade=true');
        }
        return;
      }
    }

    if (!canvasRef.current) return
    await (document as any).fonts?.ready?.catch?.(() => { })
    const node = canvasRef.current
    if (exportFormat === 'png') {
      const dataUrl = await toPng(node, { pixelRatio: exportScale, backgroundColor: exportBg ? '#FFFFFF' : 'transparent', cacheBust: true })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = 'template.png'
      a.click()
    } else if (exportFormat === 'jpg') {
      const dataUrl = await toJpeg(node, { pixelRatio: exportScale, backgroundColor: '#FFFFFF', quality: 0.95, cacheBust: true })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = 'template.jpg'
      a.click()
    } else {
      const dataUrl = await toPng(node, { pixelRatio: exportScale, backgroundColor: exportBg ? '#FFFFFF' : '#FFFFFF', cacheBust: true })
      const pdf = new jspdf({ orientation: 'portrait', unit: 'px', format: [1080, 1920] })
      pdf.addImage(dataUrl, 'PNG', 0, 0, 1080, 1920)
      pdf.save('template.pdf')
    }
    setShowExport(false)
  }

  const WIDGET_GROUPS = [
    {
      id: 'essencial', title: 'Essencial', icon: <LayoutTemplate size={16} />, items: [
        { label: 'Texto', fn: addTexto },
        { label: 'Imagem', fn: addImagem },
        { label: 'Sticker', fn: () => setWidgets(w => [...w, { type: 'sticker', props: { pack: 'productivity', name: 'Star', tint: '#C7B7DD', size: 64, draggable: true } }]) },
        { label: 'Divisor', fn: addDivisor },
      ]
    },
    {
      id: 'listas', title: 'Listas & Tarefas', icon: <Layers size={16} />, items: [
        { label: 'Lista Checkbox', fn: addLista },
        { label: 'Lista Numerada', fn: addListaNum },
        { label: 'Lista Pontos', fn: addListaPontos },
        { label: 'Ideias', fn: () => setWidgets(w => [...w, { type: 'ideias', props: { title: 'Ideias', items: [] } }]) },
        { label: 'Prioridades', fn: addPrioridades },
      ]
    },
    {
      id: 'planejamento', title: 'Planejamento', icon: <LayoutTemplate size={16} />, items: [
        { label: 'Meu Dia', fn: addHorarioDia },
        { label: 'Planner Semanal', fn: () => setWidgets(w => [...w, { type: 'plannerSemanal', props: {} }]) },
        { label: 'Planner Mensal', fn: addPlannerMensal },
        { label: 'Metas 3 Meses', fn: addMetas3Meses },
        { label: 'Pomodoro', fn: () => setWidgets(w => [...w, { type: 'pomodoroPlanner', props: {} }]) },
      ]
    },
    {
      id: 'trackers', title: 'Hábitos & Saúde', icon: <LayoutTemplate size={16} />, items: [
        { label: 'Água', fn: addAgua },
        { label: 'Humor', fn: addMood },
        { label: 'Sono', fn: addSono },
        { label: 'Hábitos', fn: addHabitos },
        { label: 'Exercícios', fn: () => setWidgets(w => [...w, { type: 'trackerDeExercicios', props: {} }]) },
        { label: 'Refeições', fn: addRefeicoes },
      ]
    },
    {
      id: 'financeiro', title: 'Financeiro', icon: <LayoutTemplate size={16} />, items: [
        { label: 'Gastos', fn: addGastos },
        { label: 'Poupança', fn: addPoupanca },
      ]
    },
    {
      id: 'outros', title: 'Outros', icon: <LayoutTemplate size={16} />, items: [
        { label: 'Progresso', fn: addProgress },
        { label: 'Contador', fn: addContador },
        { label: 'Books', fn: () => setWidgets(w => [...w, { type: 'bookTracker', props: {} }]) },
        { label: 'Memórias', fn: () => setWidgets(w => [...w, { type: 'memoriasDoMes', props: {} }]) },
        { label: 'Gratidão', fn: () => setWidgets(w => [...w, { type: 'gratitude', props: {} }]) },
        { label: 'Aniversários', fn: () => setWidgets(w => [...w, { type: 'aniversarios', props: {} }]) },
      ]
    }
  ]

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden relative bg-gray-100">

      {/* Mobile Toggle for Left Panel */}
      <div className="lg:hidden p-2 bg-white border-b border-ui-border flex justify-between items-center z-20">
        <span className="font-heading font-bold text-ui-text">Gerador</span>
        <button onClick={() => setLeftOpen(!leftOpen)} className="p-2 bg-ui-secondary rounded-md">
          <PanelLeft size={20} />
        </button>
      </div>

      {/* Left Sidebar */}
      <aside
        className={`${leftOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative inset-y-0 left-0 w-[280px] bg-white border-r border-ui-border z-30 transition-all duration-300 ease-in-out shadow-xl lg:shadow-none
        ${!leftOpen && 'lg:w-0 lg:overflow-hidden lg:border-none lg:p-0'} flex flex-col`}
      >
        <div className={`flex flex-col h-full bg-ui-sidebar ${!leftOpen && 'hidden'}`}>
          <div className="p-3 border-b border-ui-border flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-ui-primary" />
              <span className="font-heading text-lg font-semibold text-gray-800">Biblioteca</span>
            </div>
            <button onClick={() => setLeftOpen(false)} className="hidden lg:flex p-1 hover:bg-gray-100 rounded-md text-gray-400 transition-colors" title="Minimizar">
              <PanelLeft size={16} />
            </button>
            <button onClick={() => setLeftOpen(false)} className="lg:hidden p-1 hover:bg-gray-100 rounded-md">
              X
            </button>
          </div>

          <div className="p-3 shrink-0">
            <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-lg">
              <button onClick={() => setPane('widgets')} className={`py-1.5 px-3 rounded-md text-sm font-medium transition-all ${pane === 'widgets' ? 'bg-white text-ui-primary shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>Widgets</button>
              <button onClick={() => setPane('templates')} className={`py-1.5 px-3 rounded-md text-sm font-medium transition-all ${pane === 'templates' ? 'bg-white text-ui-primary shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>Templates</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 p-3 pt-0">
            {pane === 'widgets' ? (
              <div className="space-y-4 pb-20">
                {WIDGET_GROUPS.map(group => (
                  <div key={group.id} className="space-y-2">
                    <button
                      onClick={() => toggleCategory(group.id)}
                      className="w-full flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors"
                    >
                      <span className="flex items-center gap-2">{group.icon} {group.title}</span>
                      {collapsedCategories[group.id] ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {!collapsedCategories[group.id] && (
                      <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-top-2 duration-200">
                        {group.items.map((item, idx) => (
                          <button
                            key={idx}
                            onClick={item.fn}
                            className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-100 bg-white shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-ui-primary/30 hover:bg-ui-primary/5 transition-all duration-200 group text-center h-20"
                          >
                            <span className="text-xs font-medium text-gray-600 group-hover:text-ui-primary line-clamp-2">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              // ... Templates Tab Content (kept similar but scrollable) ...
              <div>
                <input value={templateQuery} onChange={e => setTemplateQuery(e.target.value)} placeholder="Buscar templates..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ui-primary/20 focus:border-ui-primary outline-none transition-all" />

                <div className="mt-4 space-y-4 pb-20">
                  {filteredTemplates.map(t => (
                    <div key={t.id} className="group border border-gray-200 rounded-xl bg-white overflow-hidden hover:shadow-md transition-all duration-200">
                      <div className="p-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <div className="font-medium text-sm text-gray-900">{t.title}</div>
                        <button onClick={() => pushNext(t.blocks)} className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded-md bg-ui-primary text-white text-xs font-medium shadow-sm hover:bg-ui-primary/90">Usar</button>
                      </div>
                      <div className="p-3 bg-gray-100/50">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden pointer-events-none select-none relative h-32 w-full">
                          {/* Mini Preview using scale */}
                          <div className="absolute top-0 left-0 w-[1080px] origin-top-left scale-[0.25]">
                            <div className="p-4 space-y-4">
                              {t.blocks.slice(0, 3).map((b, i) => (
                                <div key={i} className="opacity-75"><WidgetRenderer entry={b} /></div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Collapse Left Button (when closed) */}
      {!leftOpen && (
        <div className="hidden lg:flex flex-col justify-center border-r border-gray-200 bg-white z-10">
          <button onClick={() => setLeftOpen(true)} className="p-2 hover:bg-gray-50 text-gray-400 hover:text-ui-primary transition-colors" title="Expandir Sidebar">
            <PanelLeft size={20} />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative flex flex-col bg-gray-100/50">

        {/* Main Toolbar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <h1 className="font-heading font-bold text-gray-800 text-sm hidden sm:block truncate max-w-[200px]">{tema.nome_tema}</h1>
            <Popover>
              <PopoverTrigger asChild>
                <button className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Configurar Canvas</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="bg-white border border-gray-200 rounded-lg p-4 shadow-xl w-72 z-50">
                <h4 className="font-bold text-gray-900 mb-2">Configurações do Canvas</h4>
                <div className="space-y-3">
                  {/* Theme Style Toggles could go here */}
                  <div className="text-xs text-gray-500">
                    Bordas: <span className="font-mono bg-gray-100 px-1 rounded">{tema.estilo_bordas}</span>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-100 p-1 rounded-lg mr-2">
              <button onClick={undo} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-gray-600 transition-all" title="Desfazer (Ctrl+Z)">
                <Undo2 className="w-4 h-4" />
              </button>
              <button onClick={redo} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-gray-600 transition-all" title="Refazer (Ctrl+Y)">
                <Redo2 className="w-4 h-4" />
              </button>
            </div>
            <button onClick={() => setShowExport(true)} className="px-4 py-2 rounded-lg bg-ui-primary text-white text-sm font-medium shadow-lg shadow-ui-primary/20 hover:bg-ui-primary/90 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar</span>
            </button>
            <button
              onClick={() => setRightOpen(!rightOpen)}
              className={`lg:hidden p-2 rounded-lg border border-gray-200 ${rightOpen ? 'bg-ui-primary/10 text-ui-primary border-ui-primary/30' : 'bg-white text-gray-500'}`}
            >
              <PanelRight size={20} />
            </button>
          </div>
        </header>


        {/* Canvas Scroll Area */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center bg-gray-100 cross-dots-bg">
          <div ref={canvasRef} className={`relative bg-white ${tema.estilo_bordas} ${tema.estilo_sombras} min-w-[320px] w-full max-w-[500px] lg:max-w-[600px] xl:max-w-[700px] aspect-[9/16] transition-all duration-300 shadow-2xl`}>

            {/* Empty State Overlay */}
            {widgets.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 pointer-events-none z-0">
                <MousePointerClick size={48} className="mb-4 opacity-50" />
                <p className="text-lg font-medium">Seu template está vazio</p>
                <p className="text-sm">Selecione widgets na barra lateral para começar</p>
              </div>
            )}

            <div className="relative w-full h-full p-6 sm:p-8 xl:p-10 flex flex-col">
              {/* Background Texture Renderer */}
              {canvasTextureLayers
                .slice()
                .sort((a, b) => a.zIndex - b.zIndex)
                .map(l => {
                  const base: React.CSSProperties = { position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: l.zIndex, opacity: l.opacity ?? 1 }
                  const bg: React.CSSProperties = { backgroundImage: `url(${l.src})` }
                  const fill = l.fill === 'esticar' ? { backgroundSize: 'cover', backgroundRepeat: 'no-repeat' } : l.fill === 'centralizar' ? { backgroundSize: 'auto', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' } : { backgroundRepeat: 'repeat' }
                  const transform = `translate(${l.posX}px, ${l.posY}px) rotate(${l.angle}deg) scale(${l.scale})`
                  return <div key={l.id} style={{ ...base, ...bg, ...fill, transform }} />
                })}

              <div className="relative z-10 h-full flex flex-col">
                {/* Title - Editable? For now just static based on theme */}
                <div className="mb-6 group relative">
                  <h1 className={`font-heading ${tema.tipografia.tamanhos.titulo}`}>{TEMAS.find(t => t.id === temaId)?.nome_tema}</h1>
                </div>

                {/* Drop Zone / Widget List */}
                <div className="flex-1 space-y-4">
                  {widgets.map((w, i) => (
                    <button
                      key={i}
                      onClick={() => { setSelected(i); if (!rightOpen) setRightOpen(true); }}
                      className={`w-full text-left transition-all duration-200 relative group
                                    ${selected === i
                          ? 'ring-2 ring-ui-primary ring-offset-4 ring-offset-white rounded-lg'
                          : 'hover:ring-2 hover:ring-gray-200 hover:ring-offset-2 rounded-lg'
                        }`}
                    >
                      <WidgetRenderer entry={w} />
                      {/* Hover Actions */}
                      <div className={`absolute -right-8 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${selected === i ? 'opacity-100' : ''}`}>
                        {/* Small quick actions could go here */}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Collapse Right Button (when closed) */}
      {!rightOpen && (
        <div className="hidden lg:flex flex-col justify-center border-l border-gray-200 bg-white z-10">
          <button onClick={() => setRightOpen(true)} className="p-2 hover:bg-gray-50 text-gray-400 hover:text-ui-primary transition-colors" title="Expandir Painel">
            <PanelRight size={20} />
          </button>
        </div>
      )}

      {/* Right Sidebar - Settings */}
      <aside
        className={`${rightOpen ? 'translate-x-0' : 'translate-x-[120%]'} lg:translate-x-0 fixed lg:relative inset-y-0 right-0 w-[320px] bg-white border-l border-ui-border z-30 transition-all duration-300 ease-in-out shadow-xl lg:shadow-none
        ${!rightOpen && 'lg:w-0 lg:overflow-hidden lg:border-none lg:p-0'} flex flex-col`}
      >
        <div className="flex flex-col h-full bg-ui-sidebar">
          {/* Header */}
          <div className="p-3 border-b border-ui-border flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-ui-primary" />
              <span className="font-heading text-lg font-semibold text-gray-800">Propriedades</span>
            </div>
            <button onClick={() => setRightOpen(false)} className="hidden lg:flex p-1 hover:bg-gray-100 rounded-md text-gray-400 transition-colors" title="Minimizar">
              <PanelRight size={16} />
            </button>
            <button onClick={() => setRightOpen(false)} className="lg:hidden p-1 hover:bg-gray-100 rounded-md">
              X
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 bg-gray-50/50">
            {/* Keeping existing Tabs structure but ensuring full height scroll */}
            <div className="p-4">
              <Tabs defaultValue="conteudo" className="w-full">
                <TabsList className="flex gap-1 bg-gray-200/50 p-1 rounded-lg mb-4">
                  <TabsTrigger
                    value="conteudo"
                    className="flex-1 py-1.5 text-xs font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-ui-primary data-[state=active]:shadow-sm transition-all"
                  >
                    Estrutura
                  </TabsTrigger>
                  <TabsTrigger
                    value="estilo"
                    className="flex-1 py-1.5 text-xs font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-ui-primary data-[state=active]:shadow-sm transition-all"
                  >
                    Estilo
                  </TabsTrigger>
                </TabsList>
                {/* ... Content of Tabs content follows in next chunks or reused code ... */}
                <TabsContent value="conteudo" className="mt-3">
                  <div className="mb-2 text-sm">Tema visual</div>
                  <div className="grid grid-cols-2 gap-2">
                    {TEMAS.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTemaId(t.id)}
                        className={`p-2 border rounded-md card-hover ${temaId === t.id ? 'border-ui-primary' : 'border-ui-border'}`}
                      >
                        <div className="text-left text-sm">{t.nome_tema}</div>
                        <div className="mt-2 flex gap-1">
                          {t.cores_acento.slice(0, 4).map((c) => (
                            <span key={c} className="w-4 h-4 rounded-sm" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-4">
                    <div className="mb-2 text-sm">Layers</div>
                    <div className="space-y-2">
                      {widgets.map((w, i) => (
                        <div key={i} className={`flex items-center gap-2 p-2 border rounded-md ${selected === i ? 'border-ui-primary' : 'border-ui-border'}`}>
                          <div className="flex-1 text-sm text-ui-text">{w.type}</div>
                          <button onClick={() => moveUp(i)} className="px-2 py-1 border border-ui-border rounded">↑</button>
                          <button onClick={() => moveDown(i)} className="px-2 py-1 border border-ui-border rounded">↓</button>
                          <button onClick={() => sendBack(i)} className="px-2 py-1 border border-ui-border rounded">Início</button>
                          <button onClick={() => bringFront(i)} className="px-2 py-1 border border-ui-border rounded">Topo</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="estilo" className="mt-3">
                  {selected !== null ? (
                    <div className="space-y-4">
                      <div className="text-sm">Cor de fundo</div>
                      <HexColorPicker color={(widgets[selected].style?.bg || '#FFFFFF') as string} onChange={(c) => {
                        updateWidgets(prev => prev.map((it, idx) => idx === selected ? { ...it, style: { ...(it.style || {}), bg: c } } : it))
                      }} />
                      <div className="text-sm">Tamanho</div>
                      <input type="range" min={1} max={3} value={(widgets[selected].style?.size || 2) as number} onChange={(e) => {
                        const v = parseInt(e.target.value)
                        updateWidgets(prev => prev.map((it, idx) => idx === selected ? { ...it, style: { ...(it.style || {}), size: v } } : it))
                      }} />
                      <div className="text-sm">Padding</div>
                      <input type="range" min={0} max={40} value={(widgets[selected].style?.padding || 12) as number} onChange={(e) => {
                        const v = parseInt(e.target.value)
                        updateWidgets(prev => prev.map((it, idx) => idx === selected ? { ...it, style: { ...(it.style || {}), padding: v } } : it))
                      }} />
                      <div className="text-sm">Sombra</div>
                      <div className="grid grid-cols-2 gap-2">
                        {['shadow-none', 'shadow-sm', 'shadow', 'shadow-md', 'shadow-lg'].map(s => (
                          <button key={s} onClick={() => updateWidgets(prev => prev.map((it, idx) => idx === selected ? { ...it, style: { ...(it.style || {}), shadow: s } } : it))} className="py-2 px-3 border border-ui-border rounded-md">{s}</button>
                        ))}
                      </div>
                      <div className="text-sm">Bordas</div>
                      <div className="grid grid-cols-2 gap-2">
                        {['rounded-none', 'rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-2xl'].map(r => (
                          <button key={r} onClick={() => updateWidgets(prev => prev.map((it, idx) => idx === selected ? { ...it, style: { ...(it.style || {}), borderRadius: r } } : it))} className="py-2 px-3 border border-ui-border rounded-md">{r}</button>
                        ))}
                      </div>
                      {widgets[selected].type === 'listaComPontos' ? (
                        <div className="space-y-2">
                          <div className="text-sm">Ícone</div>
                          <IconPicker value={widgets[selected].props.icone} onChange={(name) => updateWidgets(prev => prev.map((it, idx) => idx === selected ? { ...it, props: { ...it.props, icone: name } } : it))} />
                          <div className="text-sm">Cor do ícone</div>
                          <HexColorPicker color={(widgets[selected].props.color || '#7A8A73') as string} onChange={(c) => updateWidgets(prev => prev.map((it, idx) => idx === selected ? { ...it, props: { ...it.props, color: c } } : it))} />
                        </div>
                      ) : null}
                      {widgets[selected].type === 'texto' ? (
                        <div className="space-y-2">
                          <div className="text-sm">Tipografia</div>
                          <div className="grid grid-cols-3 gap-2">
                            {['titulo', 'subtitulo', 'paragrafo', 'citacao'].map(t => (
                              <button key={t} onClick={() => updateWidgets(prev => prev.map((it, idx) => idx === selected ? { ...it, props: { ...it.props, tipo: t } } : it))} className="py-2 px-3 border border-ui-border rounded-md">{t}</button>
                            ))}
                          </div>
                          <div className="text-sm">Alinhamento</div>
                          <div className="grid grid-cols-3 gap-2">
                            {['left', 'center', 'right'].map(a => (
                              <button key={a} onClick={() => updateWidgets(prev => prev.map((it, idx) => idx === selected ? { ...it, props: { ...it.props, align: a } } : it))} className="py-2 px-3 border border-ui-border rounded-md">{a}</button>
                            ))}
                          </div>
                          <div className="text-sm">Tamanho da fonte</div>
                          <input type="range" min={12} max={48} value={(widgets[selected].props.customSize || 0) as number} onChange={(e) => {
                            const v = parseInt(e.target.value)
                            updateWidgets(prev => prev.map((it, idx) => idx === selected ? { ...it, props: { ...it.props, customSize: v } } : it))
                          }} />
                        </div>
                      ) : null}
                      {widgets[selected].type === 'sticker' ? (
                        <div className="space-y-2">
                          <div className="text-sm">Sticker</div>
                          <div className="grid grid-cols-1 gap-2">
                            <input type="color" value={(widgets[selected].props.tint || '#C7B7DD') as string} onChange={(e) => {
                              const c = e.target.value
                              updateWidgets(prev => prev.map((it, idx) => idx === selected ? { ...it, props: { ...it.props, tint: c } } : it))
                            }} />
                            <input type="range" min={32} max={128} value={(widgets[selected].props.size || 64) as number} onChange={(e) => {
                              const v = parseInt(e.target.value)
                              updateWidgets(prev => prev.map((it, idx) => idx === selected ? { ...it, props: { ...it.props, size: v } } : it))
                            }} />
                            <input type="range" min={-180} max={180} value={(widgets[selected].props.rotation || 0) as number} onChange={(e) => {
                              const v = parseInt(e.target.value)
                              updateWidgets(prev => prev.map((it, idx) => idx === selected ? { ...it, props: { ...it.props, rotation: v } } : it))
                            }} />
                          </div>
                        </div>
                      ) : null}
                      <div className="space-y-2">
                        <div className="text-sm">Texturas (Widget)</div>
                        <div className="flex items-center gap-2">
                          <input type="file" accept={ACCEPT_TYPES.join(',')} onChange={e => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            const layer = makeLayerFromFile(file, 'widget')
                            if (!layer) return
                            updateWidgets(prev => prev.map((it, idx) => idx === selected ? { ...it, style: { ...(it.style || {}), textureLayers: [...(it.style?.textureLayers || []), { ...layer, zIndex: (it.style?.textureLayers?.length || 0) }] } } : it))
                          }} />
                        </div>
                        {(widgets[selected].style?.textureLayers || []).map((l, li) => (
                          <div key={l.id} className="p-2 border border-ui-border rounded-md space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs flex-1">{l.name || 'Layer'}</span>
                              <button onClick={() => updateWidgets(prev => prev.map((it, idx) => {
                                if (idx !== selected) return it
                                const arr = [...(it.style?.textureLayers || [])]
                                const rem = arr[li]
                                const next = arr.filter((_, j) => j !== li).map((x, xi) => ({ ...x, zIndex: xi }))
                                try { if (rem?.src?.startsWith('blob:')) URL.revokeObjectURL(rem.src) } catch { }
                                return { ...it, style: { ...(it.style || {}), textureLayers: next } }
                              }))} className="px-2 py-1 border border-ui-border rounded text-xs">Remover</button>
                              <button onClick={() => updateWidgets(prev => prev.map((it, idx) => {
                                if (idx !== selected) return it
                                const arr = [...(it.style?.textureLayers || [])]
                                if (li <= 0) return it
                                  ;[arr[li - 1], arr[li]] = [arr[li], arr[li - 1]]
                                return { ...it, style: { ...(it.style || {}), textureLayers: arr.map((x, xi) => ({ ...x, zIndex: xi })) } }
                              }))} className="px-2 py-1 border border-ui-border rounded text-xs">↑</button>
                              <button onClick={() => updateWidgets(prev => prev.map((it, idx) => {
                                if (idx !== selected) return it
                                const arr = [...(it.style?.textureLayers || [])]
                                if (li >= arr.length - 1) return it
                                  ;[arr[li + 1], arr[li]] = [arr[li], arr[li + 1]]
                                return { ...it, style: { ...(it.style || {}), textureLayers: arr.map((x, xi) => ({ ...x, zIndex: xi })) } }
                              }))} className="px-2 py-1 border border-ui-border rounded text-xs">↓</button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <select value={l.fill} onChange={e => updateWidgets(prev => prev.map((it, idx) => {
                                if (idx !== selected) return it
                                const arr = [...(it.style?.textureLayers || [])]
                                arr[li] = { ...arr[li], fill: e.target.value as any }
                                return { ...it, style: { ...(it.style || {}), textureLayers: arr } }
                              }))} className="px-2 py-1 border border-ui-border rounded text-xs">
                                <option value="esticar">Esticar</option>
                                <option value="repetir">Repetir</option>
                                <option value="centralizar">Centralizar</option>
                              </select>
                              <input type="range" min={0} max={360} value={l.angle} onChange={e => updateWidgets(prev => prev.map((it, idx) => {
                                if (idx !== selected) return it
                                const arr = [...(it.style?.textureLayers || [])]
                                arr[li] = { ...arr[li], angle: parseInt(e.target.value) }
                                return { ...it, style: { ...(it.style || {}), textureLayers: arr } }
                              }))} />
                              <input type="range" min={-540} max={540} value={l.posX} onChange={e => updateWidgets(prev => prev.map((it, idx) => {
                                if (idx !== selected) return it
                                const arr = [...(it.style?.textureLayers || [])]
                                arr[li] = { ...arr[li], posX: parseInt(e.target.value) }
                                return { ...it, style: { ...(it.style || {}), textureLayers: arr } }
                              }))} />
                              <input type="range" min={-960} max={960} value={l.posY} onChange={e => updateWidgets(prev => prev.map((it, idx) => {
                                if (idx !== selected) return it
                                const arr = [...(it.style?.textureLayers || [])]
                                arr[li] = { ...arr[li], posY: parseInt(e.target.value) }
                                return { ...it, style: { ...(it.style || {}), textureLayers: arr } }
                              }))} />
                              <input type="range" min={10} max={300} value={Math.round(l.scale * 100)} onChange={e => updateWidgets(prev => prev.map((it, idx) => {
                                if (idx !== selected) return it
                                const arr = [...(it.style?.textureLayers || [])]
                                arr[li] = { ...arr[li], scale: parseInt(e.target.value) / 100 }
                                return { ...it, style: { ...(it.style || {}), textureLayers: arr } }
                              }))} />
                              <input type="range" min={0} max={100} value={Math.round((l.opacity ?? 1) * 100)} onChange={e => updateWidgets(prev => prev.map((it, idx) => {
                                if (idx !== selected) return it
                                const arr = [...(it.style?.textureLayers || [])]
                                arr[li] = { ...arr[li], opacity: parseInt(e.target.value) / 100 }
                                return { ...it, style: { ...(it.style || {}), textureLayers: arr } }
                              }))} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-ui-textSecondary">Selecione um bloco no canvas para editar o estilo</div>
                  )}
                  <div className="mt-4 space-y-2">
                    <div className="text-sm">Texturas (Página)</div>
                    <div className="flex items-center gap-2">
                      <input type="file" accept={ACCEPT_TYPES.join(',')} onChange={e => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const layer = makeLayerFromFile(file, 'page')
                        if (!layer) return
                        setCanvasTextureLayers(prev => [...prev, { ...layer, zIndex: prev.length }])
                      }} />
                    </div>
                    {canvasTextureLayers.map((l, li) => (
                      <div key={l.id} className="p-2 border border-ui-border rounded-md space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs flex-1">{l.name || 'Layer'}</span>
                          <button onClick={() => setCanvasTextureLayers(prev => {
                            const rem = prev[li]
                            try { if (rem?.src?.startsWith('blob:')) URL.revokeObjectURL(rem.src) } catch { }
                            return prev.filter((_, j) => j !== li).map((x, xi) => ({ ...x, zIndex: xi }))
                          })} className="px-2 py-1 border border-ui-border rounded text-xs">Remover</button>
                          <button onClick={() => setCanvasTextureLayers(prev => {
                            const arr = [...prev]
                            if (li <= 0) return prev
                              ;[arr[li - 1], arr[li]] = [arr[li], arr[li - 1]]
                            return arr.map((x, xi) => ({ ...x, zIndex: xi }))
                          })} className="px-2 py-1 border border-ui-border rounded text-xs">↑</button>
                          <button onClick={() => setCanvasTextureLayers(prev => {
                            const arr = [...prev]
                            if (li >= arr.length - 1) return prev
                              ;[arr[li + 1], arr[li]] = [arr[li], arr[li + 1]]
                            return arr.map((x, xi) => ({ ...x, zIndex: xi }))
                          })} className="px-2 py-1 border border-ui-border rounded text-xs">↓</button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <select value={l.fill} onChange={e => setCanvasTextureLayers(prev => prev.map((it, idx) => idx === li ? { ...it, fill: e.target.value as any } : it))} className="px-2 py-1 border border-ui-border rounded text-xs">
                            <option value="esticar">Esticar</option>
                            <option value="repetir">Repetir</option>
                            <option value="centralizar">Centralizar</option>
                          </select>
                          <input type="range" min={0} max={360} value={l.angle} onChange={e => setCanvasTextureLayers(prev => prev.map((it, idx) => idx === li ? { ...it, angle: parseInt(e.target.value) } : it))} />
                          <input type="range" min={-540} max={540} value={l.posX} onChange={e => setCanvasTextureLayers(prev => prev.map((it, idx) => idx === li ? { ...it, posX: parseInt(e.target.value) } : it))} />
                          <input type="range" min={-960} max={960} value={l.posY} onChange={e => setCanvasTextureLayers(prev => prev.map((it, idx) => idx === li ? { ...it, posY: parseInt(e.target.value) } : it))} />
                          <input type="range" min={10} max={300} value={Math.round(l.scale * 100)} onChange={e => setCanvasTextureLayers(prev => prev.map((it, idx) => idx === li ? { ...it, scale: parseInt(e.target.value) / 100 } : it))} />
                          <input type="range" min={0} max={100} value={Math.round((l.opacity ?? 1) * 100)} onChange={e => setCanvasTextureLayers(prev => prev.map((it, idx) => idx === li ? { ...it, opacity: parseInt(e.target.value) / 100 } : it))} />
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
              <div className="mt-6">
                <div className="mb-2 text-sm">Páginas</div>
                <div className="space-y-2">
                  {pages.map(p => (
                    <div key={p.id} className={`flex items-center gap-2 p-2 border rounded-md ${activePageId === p.id ? 'border-ui-primary' : 'border-ui-border'}`}>
                      <button onClick={() => setActivePage(p.id)} className="flex-1 text-left text-sm text-ui-text">{p.title}</button>
                      <button onClick={() => duplicatePage()} className="px-2 py-1 border border-ui-border rounded text-xs">Duplicar</button>
                      <button onClick={() => removePage(p.id)} className="px-2 py-1 border border-ui-border rounded text-xs">Excluir</button>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <button onClick={() => addPage()} className="px-3 py-2 rounded-md border border-ui-border">Nova página</button>
                  <button onClick={() => {
                    const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']
                    setPages(months.map((m, idx) => ({ id: `page-m-${idx}`, title: m, widgets: idx === 0 ? widgets : [] })))
                    setActivePageId('page-m-0')
                  }} className="px-3 py-2 rounded-md border border-ui-border">Criar meses</button>
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => {
                    const state: LayoutState = { temaId, widgets, pages, activePageId, updatedAt: Date.now() }
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
                  }}
                  className="w-full py-2 px-3 rounded-md bg-ui-primary text-white flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Salvar agora
                </button>
                <div className="mt-2 text-xs text-ui-textSecondary">Auto-save a cada 10s</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Export Modal */}
      {showExport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="font-heading text-xl font-bold text-gray-900">Exportar Template</div>
              <button onClick={() => setShowExport(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-700">Formato do Arquivo</div>
                <div className="grid grid-cols-3 gap-3">
                  {['png', 'jpg', 'pdf'].map(f => (
                    <button key={f} onClick={() => setExportFormat(f as any)} className={`py-2.5 px-4 border rounded-xl font-medium text-sm transition-all ${exportFormat === f ? 'border-ui-primary bg-ui-primary/5 text-ui-primary ring-1 ring-ui-primary' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`.trim()}>{f.toUpperCase()}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-700">Qualidade (Escala)</div>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map(s => (
                    <button key={s} onClick={() => setExportScale(s)} className={`py-2.5 px-4 border rounded-xl font-medium text-sm transition-all ${exportScale === s ? 'border-ui-primary bg-ui-primary/5 text-ui-primary ring-1 ring-ui-primary' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`.trim()}>{s}x</button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <input id="bg" type="checkbox" checked={exportBg} onChange={e => setExportBg(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-ui-primary focus:ring-ui-primary" />
                <label htmlFor="bg" className="text-sm font-medium text-gray-700 cursor-pointer select-none">Incluir cor de fundo</label>
              </div>

              {previewUrl && (
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-100/50 p-2">
                  <img src={previewUrl} alt="preview" className="w-full h-48 object-contain" />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button onClick={() => setShowExport(false)} className="px-4 py-2.5 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
                <button onClick={async () => {
                  if (!canvasRef.current) return
                  const dataUrl = await toPng(canvasRef.current, { pixelRatio: exportScale, backgroundColor: exportBg ? '#FFFFFF' : 'transparent', cacheBust: true })
                  setPreviewUrl(dataUrl)
                }} className="px-4 py-2.5 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors">Prévia</button>
                <button onClick={doExport} className="px-5 py-2.5 rounded-xl bg-ui-primary text-white font-medium shadow-lg shadow-ui-primary/25 hover:bg-ui-primary/90 transition-all flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Baixar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Simple Helper Icon component if needed else use Lucide
function X({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>
}