'use client';

import './index.css';
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs'
import { Popover, PopoverTrigger, PopoverContent } from '@radix-ui/react-popover'
import { TEMAS } from './themes'
import { WidgetRenderer, WidgetEntry, IconPicker } from './widgets'
import { Palette, Save, Settings, Undo2, Redo2, Download } from 'lucide-react'
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

  return (
    <div className="h-full grid grid-cols-[280px_1fr_320px]">
      <aside className="bg-ui-sidebar border-r border-ui-border p-3">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-ui-primary" />
          <span className="font-heading text-xl">Biblioteca</span>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button onClick={() => setPane('widgets')} className={`py-2 px-3 rounded-md ${pane === 'widgets' ? 'bg-ui-primary text-white' : 'bg-ui-secondary text-ui-text'} card-hover`}>Widgets</button>
          <button onClick={() => setPane('templates')} className={`py-2 px-3 rounded-md ${pane === 'templates' ? 'bg-ui-primary text-white' : 'bg-ui-secondary text-ui-text'} card-hover`}>Templates</button>
        </div>
        {pane === 'widgets' ? (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={addTexto} className="py-2 px-3 rounded-md bg-ui-secondary text-ui-text card-hover">Texto</button>
            <button onClick={addAgua} className="py-2 px-3 rounded-md bg-ui-secondary text-ui-text card-hover">Água</button>
            <button onClick={addLista} className="py-2 px-3 rounded-md bg-ui-secondary text-ui-text card-hover">Lista</button>
            <button onClick={addProgress} className="py-2 px-3 rounded-md bg-ui-secondary text-ui-text card-hover">Progresso</button>
            <button onClick={() => setWidgets(w => [...w, { type: 'plannerSemanal', props: {} }])} className="py-2 px-3 rounded-md bg-ui-secondary text-ui-text card-hover">Planner Sem.</button>
            <button onClick={addMood} className="py-2 px-3 rounded-md bg-ui-secondary text-ui-text card-hover">Humor</button>
            <button onClick={addDivisor} className="py-2 px-3 rounded-md bg-ui-secondary text-ui-text card-hover">Divisor</button>
            <button onClick={addImagem} className="py-2 px-3 rounded-md bg-ui-secondary text-ui-text card-hover">Imagem</button>
            <button onClick={addListaNum} className="py-2 px-3 rounded-md bg-ui-secondary text-ui-text card-hover">Lista Num.</button>
            <button onClick={addListaPontos} className="py-2 px-3 rounded-md bg-ui-secondary text-ui-text card-hover">Lista Pontos</button>
            <button onClick={addPlannerMensal} className="py-2 px-3 rounded-md bg-ui-secondary text-ui-text card-hover">Planner Mensal</button>
            <button onClick={addPrioridades} className="py-2 px-3 rounded-md bg-ui-secondary text-ui-text card-hover">Prioridades</button>
            <button onClick={addHorarioDia} className="py-2 px-3 rounded-md bg-ui-secondary text-ui-text card-hover">Meu Dia</button>
            <button onClick={addHabitos} className="py-2 px-3 rounded-md bg-ui-secondary text-ui-text card-hover">Hábitos</button>
            <button onClick={addSono} className="py-2 px-3 rounded-md bg-ui-secondary text-ui-text card-hover">Sono</button>
            <button onClick={addRefeicoes} className="py-2 px-3 rounded-md bg-ui-secondary text-ui-text card-hover">Refeições</button>
            <button onClick={addGastos} className="py-2 px-3 rounded-md bg-ui-secondary text-ui-text card-hover">Gastos</button>
            <button onClick={addPoupanca} className="py-2 px-3 rounded-md bg-ui-secondary text-ui-text card-hover">Poupança</button>
            <button onClick={addContador} className="py-2 px-3 rounded-md bg-ui-secondary text-ui-text card-hover">Contador</button>
            <button onClick={addMetas3Meses} className="py-2 px-3 rounded-md bg-ui-secondary text-ui-text card-hover">Metas 3 Meses</button>
            <button onClick={() => setWidgets(w => [...w, { type: 'sticker', props: { pack: 'productivity', name: 'Star', tint: '#C7B7DD', size: 64, draggable: true } }])} className="py-2 px-3 rounded-md bg-ui-secondary text-ui-text card-hover">Sticker</button>
            <button onClick={() => setWidgets(w => [...w, { type: 'gratitude', props: {} }])} className="py-2 px-3 rounded-md bg-ui-secondary text-ui-text card-hover">Gratitude</button>
            <button onClick={() => setWidgets(w => [...w, { type: 'trackerDeExercicios', props: {} }])} className="py-2 px-3 rounded-md bg-ui-secondary text-ui-text card-hover">Exercícios</button>
            <button onClick={() => setWidgets(w => [...w, { type: 'bookTracker', props: {} }])} className="py-2 px-3 rounded-md bg-ui-secondary text-ui-text card-hover">Books</button>
            <button onClick={() => setWidgets(w => [...w, { type: 'pomodoroPlanner', props: {} }])} className="py-2 px-3 rounded-md bg-ui-secondary text-ui-text card-hover">Pomodoro</button>
            <button onClick={() => setWidgets(w => [...w, { type: 'ideias', props: {} }])} className="py-2 px-3 rounded-md bg-ui-secondary text-ui-text card-hover">Ideias</button>
            <button onClick={() => setWidgets(w => [...w, { type: 'memoriasDoMes', props: {} }])} className="py-2 px-3 rounded-md bg-ui-secondary text-ui-text card-hover">Memórias</button>
            <button onClick={() => setWidgets(w => [...w, { type: 'aniversarios', props: {} }])} className="py-2 px-3 rounded-md bg-ui-secondary text-ui-text card-hover">Aniversários</button>
          </div>
        ) : (
          <div>
            <input value={templateQuery} onChange={e => setTemplateQuery(e.target.value)} placeholder="Buscar por título ou tag" className="w-full border border-ui-border rounded-md px-2 py-1 text-sm" />
            <div className="mt-2 flex flex-wrap gap-2">
              {allTags.map(tag => (
                <button key={tag} onClick={() => setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])} className={`px-2 py-1 rounded border ${activeTags.includes(tag) ? 'border-ui-primary bg-white' : 'border-ui-border bg-ui-secondary'}`}>{tag}</button>
              ))}
              {activeTags.length > 0 ? (
                <button onClick={() => setActiveTags([])} className="px-2 py-1 rounded border border-ui-border">Limpar</button>
              ) : null}
            </div>
            <div className="mt-3 space-y-3 overflow-auto" style={{ maxHeight: '75vh' }}>
              {filteredTemplates.map(t => (
                <div key={t.id} className="border border-ui-border rounded-md bg-white">
                  <div className="px-3 py-2 flex items-center justify-between">
                    <div className="text-sm text-ui-text">{t.title}</div>
                    <div className="text-[10px] text-ui-textSecondary">v{t.version}</div>
                  </div>
                  <div className="px-3 pb-2 flex gap-1 flex-wrap">
                    {t.tags.map(tag => (<span key={tag} className="text-[10px] px-2 py-[2px] rounded bg-ui-base border border-ui-border">{tag}</span>))}
                  </div>
                  <div className="p-2">
                    <div className="bg-white rounded-md border border-ui-border overflow-hidden" style={{ width: '100%', height: 240 }}>
                      <div className="scale-[0.35] origin-top-left w-[1080px]">
                        <div className="space-y-2 p-2">
                          {t.blocks.slice(0, 4).map((b, i) => (
                            <div key={i} className="border border-ui-border rounded-md">
                              <WidgetRenderer entry={b} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-3 pb-2 flex items-center justify-end">
                    <button onClick={() => pushNext(t.blocks)} className="px-2 py-1 rounded-md bg-ui-primary text-white text-xs">Usar template</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      <main className="bg-ui-base overflow-auto p-6">
        <div ref={canvasRef} className={`mx-auto bg-white ${tema.estilo_bordas} ${tema.estilo_sombras} w-[1080px] h-[1920px] p-6`}>
          <div className="relative w-full h-full">
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
            <div className="relative z-10 h-full">
              <div className="flex items-center justify-between mb-4">
                <h1 className={`font-heading ${tema.tipografia.tamanhos.titulo}`}>{TEMAS.find(t => t.id === temaId)?.nome_tema}</h1>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="px-3 py-2 rounded-md bg-ui-primary text-white flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Estilo
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="bg-white border border-ui-border rounded-md p-3">
                    <div className="text-sm text-ui-textSecondary">Configurações rápidas do canvas</div>
                    <div className="mt-2 text-xs">Bordas: {tema.estilo_bordas} | Sombras: {tema.estilo_sombras}</div>
                  </PopoverContent>
                </Popover>
                <div className="flex items-center gap-2">
                  <button onClick={undo} className="px-3 py-2 rounded-md border border-ui-border bg-white text-ui-text flex items-center gap-2"><Undo2 className="w-4 h-4" />Undo</button>
                  <button onClick={redo} className="px-3 py-2 rounded-md border border-ui-border bg-white text-ui-text flex items-center gap-2"><Redo2 className="w-4 h-4" />Redo</button>
                  <button onClick={() => setShowExport(true)} className="px-3 py-2 rounded-md bg-ui-primary text-white flex items-center gap-2"><Download className="w-4 h-4" />Exportar</button>
                </div>
              </div>

              <div className="space-y-4">
                {widgets.map((w, i) => (
                  <button key={i} onClick={() => setSelected(i)} className={`w-full text-left ${selected === i ? 'ring-2 ring-ui-primary rounded-md' : ''}`}>
                    <WidgetRenderer entry={w} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <aside className="bg-ui-sidebar border-l border-ui-border p-3">
        <Tabs defaultValue="conteudo">
          <TabsList className="flex gap-2">
            <TabsTrigger value="conteudo" className="px-3 py-1 rounded-md bg-ui-secondary">Conteúdo</TabsTrigger>
            <TabsTrigger value="estilo" className="px-3 py-1 rounded-md bg-ui-secondary">Estilo</TabsTrigger>
          </TabsList>
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
      </aside>
      {showExport ? (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-[420px] p-4">
            <div className="font-heading text-lg text-ui-text mb-2">Exportar</div>
            <div className="space-y-3">
              <div className="text-sm">Formato</div>
              <div className="grid grid-cols-3 gap-2">
                {['png', 'jpg', 'pdf'].map(f => (
                  <button key={f} onClick={() => setExportFormat(f as any)} className={`py-2 px-3 border rounded ${exportFormat === f ? 'border-ui-primary' : 'border-ui-border'}`.trim()}>{f.toUpperCase()}</button>
                ))}
              </div>
              <div className="text-sm">Qualidade</div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map(s => (
                  <button key={s} onClick={() => setExportScale(s)} className={`py-2 px-3 border rounded ${exportScale === s ? 'border-ui-primary' : 'border-ui-border'}`.trim()}>{s}x</button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input id="bg" type="checkbox" checked={exportBg} onChange={e => setExportBg(e.target.checked)} />
                <label htmlFor="bg" className="text-sm">Incluir fundo</label>
              </div>
              {previewUrl ? (
                <div className="border border-ui-border rounded-md overflow-hidden">
                  <img src={previewUrl} alt="preview" className="w-full" />
                </div>
              ) : null}
              <div className="flex items-center justify-end gap-2 mt-2">
                <button onClick={() => setShowExport(false)} className="px-3 py-2 border border-ui-border rounded-md">Cancelar</button>
                <button onClick={async () => {
                  if (!canvasRef.current) return
                  const dataUrl = await toPng(canvasRef.current, { pixelRatio: exportScale, backgroundColor: exportBg ? '#FFFFFF' : 'transparent', cacheBust: true })
                  setPreviewUrl(dataUrl)
                }} className="px-3 py-2 border border-ui-border rounded-md">Gerar Preview</button>
                <button onClick={async () => {
                  if (!canvasRef.current) return
                  const dataUrl = await toPng(canvasRef.current, { pixelRatio: exportScale, backgroundColor: exportBg ? '#FFFFFF' : 'transparent', cacheBust: true })
                  const blob = await (await fetch(dataUrl)).blob()
                  // @ts-ignore
                  await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
                }} className="px-3 py-2 border border-ui-border rounded-md">Copiar</button>
                <button onClick={doExport} className="px-3 py-2 rounded-md bg-ui-primary text-white flex items-center gap-2"><Download className="w-4 h-4" />Baixar</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}