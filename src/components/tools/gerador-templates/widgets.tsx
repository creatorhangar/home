import { motion } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs'
import { Droplet, GlassWater, Type, Square, CheckSquare, CalendarDays, Quote, Star, Heart, Camera, Flag, Calendar, Coffee, Utensils, Cookie, Moon, ShoppingCart, Car, Film, PiggyBank, Cake, Book, Timer, Lightbulb } from 'lucide-react'
import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts'
import { STICKER_PACKS } from './stickers'

export type WidgetKind =
  | 'texto'
  | 'controleDeAgua'
  | 'listaDeTarefas'
  | 'progressBar'
  | 'plannerSemanal'
  | 'moodTracker'
  | 'divisor'
  | 'imagem'
  | 'listaNumerada'
  | 'listaComPontos'
  | 'plannerMensal'
  | 'prioridadesDoDia'
  | 'horarioDoMeuDia'
  | 'trackerDeHabitos'
  | 'trackerDeSono'
  | 'refeicoes'
  | 'controleDeGastos'
  | 'poupanca'
  | 'contadorRegressivo'
  | 'metas3Meses'
  | 'gratitude'
  | 'trackerDeExercicios'
  | 'bookTracker'
  | 'pomodoroPlanner'
  | 'ideias'
  | 'memoriasDoMes'
  | 'aniversarios'
  | 'sticker'
  | 'weeklyFocus'
  | 'brainDump'
  | 'noteLined'
  | 'noteGraph'
  | 'noteDot'
  | 'noteDotGrid'
  | 'noteGraphGrid'
  | 'noteCornell'
  | 'calendarioAnual'
  | 'visaoTrimestral'
  | 'datasChave'
  | 'weeklyTabs'

export function WidgetTexto({ content, align = 'left', tipo = 'titulo', customSize }: { content: string; align?: 'left' | 'center' | 'right'; tipo?: 'titulo' | 'subtitulo' | 'paragrafo' | 'citacao'; customSize?: number }) {
  const size = customSize ? '' : tipo === 'titulo' ? 'text-3xl' : tipo === 'subtitulo' ? 'text-lg' : tipo === 'citacao' ? 'text-base italic' : 'text-sm'
  return (
    <div className={`p-4 ${align === 'center' ? 'text-center' : ''} ${align === 'right' ? 'text-right' : ''}`}>
      <div className="flex items-center gap-2">
        {tipo === 'citacao' ? <Quote className="w-4 h-4 text-ui-textSecondary" /> : <Type className="w-4 h-4 text-ui-textSecondary" />}
        <span className={`text-ui-text font-body ${size}`} style={customSize ? { fontSize: customSize } : undefined}>{content}</span>
      </div>
    </div>
  )
}

export function WidgetControleDeAgua({ total = 8, filled = 0, layout = 'grid', cols }: { total?: number; filled?: number; layout?: 'linha' | 'grid'; cols?: number }) {
  const items = Array.from({ length: total })
  const c = typeof cols === 'number' ? cols : layout === 'linha' ? total : 4
  return (
    <div className="grid gap-2 p-3" style={{ gridTemplateColumns: `repeat(${c}, minmax(0, 1fr))` }}>
      {items.map((_, i) => {
        const active = i < filled
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0.7 }}
            animate={{ opacity: active ? 1 : 0.7, scale: active ? 1.05 : 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className={`flex items-center justify-center ${active ? 'text-ui-primary' : 'text-ui-textSecondary'}`}
          >
            {active ? <GlassWater className="w-7 h-7" /> : <Droplet className="w-7 h-7" />}
          </motion.div>
        )
      })}
    </div>
  )
}

export function WidgetListaDeTarefas({ items = [] as { text: string; done: boolean }[], variant = 'checkbox', rows }: { items?: { text: string; done: boolean }[]; variant?: 'checkbox' | 'circle' | 'star'; rows?: number }) {
  return (
    <div className="p-4 space-y-2">
      {Array.from({ length: rows ?? items.length }).map((_, i) => {
        const it = items[i]
        const IconOff = variant === 'star' ? Star : variant === 'circle' ? Square : Square
        const IconOn = variant === 'star' ? Star : variant === 'circle' ? CheckSquare : CheckSquare
        return (
          <motion.div key={i} whileTap={{ scale: 0.97 }} className="w-full flex items-center gap-3 py-2 px-3 rounded-md border border-ui-border hover:border-ui-primary">
            <span className={`${it?.done ? 'text-ui-primary' : 'text-ui-textSecondary'}`}>{it?.done ? <IconOn className="w-5 h-5" /> : <IconOff className="w-5 h-5" />}</span>
            <span className={`text-sm ${it?.done ? 'line-through text-ui-textSecondary' : 'text-ui-text'}`}>{it?.text ?? 'Nova tarefa...'}</span>
          </motion.div>
        )
      })}
    </div>
  )
}

export function WidgetProgressBar({ titulo = 'Meta', valor_atual = 5, valor_meta = 10, tipo_barra = 'linear', mostrar_porcentagem = true }: { titulo?: string; valor_atual?: number; valor_meta?: number; tipo_barra?: 'linear' | 'circular'; mostrar_porcentagem?: boolean }) {
  const pct = Math.min(100, Math.round((valor_atual / Math.max(1, valor_meta)) * 100))
  if (tipo_barra === 'circular') {
    return (
      <div className="p-4">
        <div className="text-sm mb-2 text-ui-text">{titulo}</div>
        <ResponsiveContainer width="100%" height={160}>
          <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ name: 'p', value: pct }]} startAngle={90} endAngle={450}>
            {/* @ts-ignore */}
            {/* @ts-ignore */}
            <RadialBar minAngle={15} background dataKey="value" cornerRadius={10} fill="#7A8A73" />
          </RadialBarChart>
        </ResponsiveContainer>
        {mostrar_porcentagem ? <div className="text-center text-sm text-ui-textSecondary">{valor_atual}/{valor_meta} ({pct}%)</div> : null}
      </div>
    )
  }
  return (
    <div className="p-4">
      <div className="text-sm mb-2 text-ui-text">{titulo}</div>
      <ResponsiveContainer width="100%" height={60}>
        <BarChart data={[{ name: 'progresso', value: pct }]}
          margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <XAxis dataKey="name" hide />
          <YAxis hide />
          <Tooltip cursor={{ fill: '#EAEAEA' }} />
          <Bar dataKey="value" fill="#7A8A73" radius={[8, 8, 8, 8]} />
        </BarChart>
      </ResponsiveContainer>
      {mostrar_porcentagem ? <div className="text-right text-xs text-ui-textSecondary">{pct}%</div> : null}
    </div>
  )
}

export function WidgetPlannerSemanal({ dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] }: { dias?: string[] }) {
  return (
    <div className="p-4 grid grid-cols-7 gap-3">
      {dias.map((d) => (
        <div key={d} className="border border-ui-border rounded-md p-2 bg-white/90">
          <div className="flex items-center gap-2 text-ui-text font-medium">
            <CalendarDays className="w-4 h-4 text-ui-textSecondary" />
            <span>{d}</span>
          </div>
          <div className="mt-2 space-y-2">
            <div className="h-6 rounded bg-ui-base"></div>
            <div className="h-6 rounded bg-ui-base"></div>
            <div className="h-6 rounded bg-ui-base"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function WidgetMoodTracker({ dias = 30, estados = ['Smile', 'SmilePlus', 'Meh', 'Frown', 'CloudRain'] }: { dias?: number; estados?: string[] }) {
  const icons = [Star, Heart, Square, Droplet, Camera]
  return (
    <div className="p-4 grid grid-cols-10 gap-2">
      {Array.from({ length: dias }).map((_, i) => {
        const Icon = icons[i % icons.length]
        return (
          <div key={i} className="w-8 h-8 border border-ui-border rounded-md flex items-center justify-center text-ui-textSecondary">
            <Icon className="w-4 h-4" />
          </div>
        )
      })}
    </div>
  )
}

export function WidgetDivisor({ tipo = 'icone' as 'linha' | 'icone' | 'ondulada', cor = '#EAEAEA' }: { tipo?: 'linha' | 'icone' | 'ondulada'; cor?: string }) {
  if (tipo === 'linha') return <div className="p-2"><div style={{ backgroundColor: cor }} className="h-[1px] w-full" /></div>
  if (tipo === 'ondulada') return <div className="p-2"><div className="w-full h-4 bg-gradient-to-r from-transparent via-ui-border to-transparent" /></div>
  return (
    <div className="p-2 flex items-center justify-center gap-3">
      <Star style={{ color: cor }} className="w-4 h-4" />
      <div style={{ backgroundColor: cor }} className="h-[1px] w-40" />
      <Star style={{ color: cor }} className="w-4 h-4" />
    </div>
  )
}

export function WidgetImagem({ src, filtro = 'none', rounded = true }: { src?: string; filtro?: 'none' | 'grayscale' | 'sepia'; rounded?: boolean }) {
  return (
    <div className="p-3">
      {src ? (
        <img src={src} className={`${rounded ? 'rounded-xl' : ''} w-full ${filtro === 'grayscale' ? 'grayscale' : filtro === 'sepia' ? 'sepia' : ''}`} />
      ) : (
        <div className="border border-ui-border rounded-md p-6 text-center text-ui-textSecondary">Sem imagem</div>
      )}
    </div>
  )
}

export function WidgetListaNumerada({ itens = ['Item 1', 'Item 2', 'Item 3'], estilo = '1' as '1' | 'I' | 'a' }: { itens?: string[]; estilo?: '1' | 'I' | 'a' }) {
  const format = (i: number) => (estilo === 'I' ? ['I', 'II', 'III', 'IV', 'V'][i] || `${i + 1}` : estilo === 'a' ? String.fromCharCode(97 + i) : `${i + 1}`)
  return (
    <div className="p-4 space-y-2">
      {itens.map((it, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-ui-base flex items-center justify-center text-xs text-ui-textSecondary">{format(i)}</div>
          <div className="text-ui-text text-sm">{it}</div>
        </div>
      ))}
    </div>
  )
}

export function WidgetListaComPontos({ itens = ['Ponto A', 'Ponto B', 'Ponto C'], icone = 'Star', color }: { itens?: string[]; icone?: string; color?: string }) {
  const Icon = icone === 'Heart' ? Heart : icone === 'Star' ? Star : Square
  return (
    <div className="p-4 space-y-2">
      {itens.map((it, i) => (
        <div key={i} className="flex items-center gap-3">
          <Icon className="w-4 h-4" style={{ color: color || undefined }} />
          <div className="text-ui-text text-sm">{it}</div>
        </div>
      ))}
    </div>
  )
}

export function WidgetPlannerMensal({ dias = 30 }: { dias?: number }) {
  const boxes = Array.from({ length: dias })
  return (
    <div className="p-4 grid grid-cols-7 gap-2">
      {boxes.map((_, i) => (
        <div key={i} className="border border-ui-border rounded-md bg-white/90 h-24 p-2 flex flex-col">
          <div className="text-xs text-ui-textSecondary">{i + 1}</div>
          <div className="mt-1 flex-1 rounded bg-ui-base"></div>
        </div>
      ))}
    </div>
  )
}

export function WidgetPrioridadesDoDia({ altas = ['Tarefa A'], medias = ['Tarefa B'], baixas = ['Tarefa C'] }: { altas?: string[]; medias?: string[]; baixas?: string[] }) {
  const Section = ({ title, color, items }: { title: string; color: string; items: string[] }) => (
    <div className="border border-ui-border rounded-md p-3 bg-white">
      <div className="flex items-center gap-2" style={{ color }}>
        <Flag className="w-4 h-4" />
        <div className="font-medium text-ui-text">{title}</div>
      </div>
      <div className="mt-2 space-y-2">
        {items.map((t, i) => (
          <div key={i} className="flex items-center gap-2">
            <Square className="w-4 h-4 text-ui-textSecondary" />
            <div className="text-sm text-ui-text">{t}</div>
          </div>
        ))}
      </div>
    </div>
  )
  return (
    <div className="p-4 grid grid-cols-3 gap-3">
      <Section title="Alta" color="#D97A7A" items={altas} />
      <Section title="Média" color="#E8B863" items={medias} />
      <Section title="Baixa" color="#7AA88A" items={baixas} />
    </div>
  )
}

export function WidgetHorarioDoMeuDia({ inicio = 6, fim = 22 }: { inicio?: number; fim?: number }) {
  const horas = Array.from({ length: fim - inicio + 1 }, (_, idx) => inicio + idx)
  return (
    <div className="p-4">
      <div className="grid grid-cols-1 gap-2">
        {horas.map((h) => (
          <div key={h} className="flex items-center gap-3">
            <div className="w-14 text-right text-xs text-ui-textSecondary">{h}h</div>
            <div className="flex-1 h-8 rounded-md border border-ui-border bg-white" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function WidgetTrackerDeHabitos({ habitos = ['Água', 'Exercício', 'Leitura'], dias_mes = 30 }: { habitos?: string[]; dias_mes?: number }) {
  return (
    <div className="p-4 overflow-auto">
      <div className="grid" style={{ gridTemplateColumns: `150px repeat(${dias_mes}, minmax(24px, 1fr))`, gap: 8 }}>
        {habitos.map((h) => (
          <React.Fragment key={h}>
            <div className="flex items-center gap-2 text-ui-text">
              <Droplet className="w-4 h-4 text-ui-textSecondary" />
              <span className="text-sm">{h}</span>
            </div>
            {Array.from({ length: dias_mes }).map((_, i) => (
              <div key={i} className="w-6 h-6 border border-ui-border rounded-sm flex items-center justify-center text-ui-textSecondary">
                <Square className="w-3 h-3" />
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export function WidgetTrackerDeSono({ horas = Array.from({ length: 30 }, () => 7) }: { horas?: number[] }) {
  const colorFor = (h: number) => (h >= 8 ? '#A8B5A0' : h >= 6 ? '#E8B863' : '#D97A7A')
  return (
    <div className="p-4 grid grid-cols-10 gap-2">
      {horas.map((h, i) => (
        <div key={i} className="w-14 h-14 rounded-md border border-ui-border flex items-center justify-center" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="text-xs" style={{ color: colorFor(h) }}>{h}h</div>
        </div>
      ))}
    </div>
  )
}

export function WidgetRefeicoes({ saudavel = [true, false, true, true, false] }: { saudavel?: boolean[] }) {
  const labels = ['Café', 'Almoço', 'Lanche', 'Jantar', 'Ceia']
  const icons = [Coffee, Utensils, Cookie, Utensils, Moon]
  return (
    <div className="p-4 space-y-2">
      {labels.map((l, i) => {
        const Icon = icons[i]
        const ok = !!saudavel[i]
        return (
          <div key={l} className="flex items-center gap-3 border border-ui-border rounded-md p-2">
            <Icon className="w-4 h-4 text-ui-textSecondary" />
            <div className="flex-1 text-ui-text text-sm">{l}</div>
            <div className={`${ok ? 'text-ui-success' : 'text-ui-textSecondary'}`}>{ok ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}</div>
          </div>
        )
      })}
    </div>
  )
}

export function WidgetControleDeGastos({ categorias = [{ nome: 'Alimentação', icon: ShoppingCart, valor: 120 }, { nome: 'Transporte', icon: Car, valor: 80 }, { nome: 'Lazer', icon: Film, valor: 50 }] }: { categorias?: Array<{ nome: string; icon: any; valor: number }> }) {
  const total = categorias.reduce((acc, c) => acc + c.valor, 0)
  return (
    <div className="p-4 space-y-2">
      {categorias.map((c, i) => (
        <div key={i} className="flex items-center gap-3 border border-ui-border rounded-md p-2">
          <c.icon className="w-4 h-4 text-ui-textSecondary" />
          <div className="flex-1 text-ui-text text-sm">{c.nome}</div>
          <div className="text-ui-text">R$ {c.valor.toFixed(2)}</div>
        </div>
      ))}
      <div className="flex items-center justify-end gap-3 border-t border-ui-border pt-2">
        <PiggyBank className="w-4 h-4 text-ui-textSecondary" />
        <div className="text-ui-text font-medium">Total: R$ {total.toFixed(2)}</div>
      </div>
    </div>
  )
}

export function WidgetPoupanca({ atual = 500, meta = 1000 }: { atual?: number; meta?: number }) {
  const pct = Math.min(100, Math.round((atual / Math.max(1, meta)) * 100))
  return (
    <div className="p-4">
      <div className="text-sm mb-2 text-ui-text">Poupança</div>
      <ResponsiveContainer width="100%" height={160}>
        <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ name: 'p', value: pct }]} startAngle={90} endAngle={450}>
          {/* @ts-ignore */}
          <RadialBar minAngle={15} background dataKey="value" cornerRadius={10} fill="#7A8A73" />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="text-center text-sm text-ui-textSecondary">R$ {atual} / R$ {meta} ({pct}%)</div>
    </div>
  )
}

export function WidgetContadorRegressivo({ diasRestantes = 30 }: { diasRestantes?: number }) {
  return (
    <div className="p-6 flex items-center justify-between">
      <div className="flex items-center gap-3 text-ui-text">
        <Calendar className="w-6 h-6 text-ui-textSecondary" />
        <div className="text-sm">Dias até a meta</div>
      </div>
      <div className="font-heading text-3xl text-ui-text">{diasRestantes}</div>
    </div>
  )
}

export function WidgetMetas3Meses({ metas = [['Meta A', 'Meta B'], ['Meta C'], ['Meta D']] }: { metas?: string[][] }) {
  return (
    <div className="p-4 grid grid-cols-3 gap-3">
      {metas.map((lista, idx) => (
        <div key={idx} className="border border-ui-border rounded-md p-3 bg-white">
          <div className="font-medium text-ui-text">Mês {idx + 1}</div>
          <div className="mt-2 space-y-2">
            {lista.map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <Square className="w-4 h-4 text-ui-textSecondary" />
                <div className="text-sm text-ui-text">{t}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function WidgetGratitude({ linhas = ['Hoje sou grato por...', '...', '...'] }: { linhas?: string[] }) {
  return (
    <div className="p-4 space-y-2">
      {linhas.map((t, i) => (
        <div key={i} className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-ui-primary" />
          <div className="flex-1 text-sm text-ui-text">{t}</div>
        </div>
      ))}
    </div>
  )
}

export function WidgetTrackerDeExercicios({ tipos = [{ nome: 'Cardio', icon: Heart }, { nome: 'Força', icon: Droplet }, { nome: 'Yoga', icon: Star }] }: { tipos?: Array<{ nome: string; icon: any }> }) {
  const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  return (
    <div className="p-4 overflow-auto">
      <div className="grid" style={{ gridTemplateColumns: `150px repeat(${dias.length}, minmax(0, 1fr))`, gap: 8 }}>
        {tipos.map((t) => (
          <React.Fragment key={t.nome}>
            <div className="flex items-center gap-2 text-ui-text">
              <t.icon className="w-4 h-4 text-ui-textSecondary" />
              <span className="text-sm">{t.nome}</span>
            </div>
            {dias.map((d) => (
              <div key={d} className="w-6 h-6 border border-ui-border rounded-sm flex items-center justify-center text-ui-textSecondary">
                <Square className="w-3 h-3" />
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export function WidgetBookTracker({ livros = [{ titulo: 'Livro A', autor: 'Autor', paginas: 300, lidas: 120 }] }: { livros?: Array<{ titulo: string; autor: string; paginas: number; lidas: number }> }) {
  return (
    <div className="p-4 space-y-3">
      {livros.map((l, i) => {
        const pct = Math.min(100, Math.round((l.lidas / Math.max(1, l.paginas)) * 100))
        return (
          <div key={i} className="border border-ui-border rounded-md p-3 bg-white">
            <div className="flex items-center gap-2 text-ui-text">
              <Book className="w-4 h-4 text-ui-textSecondary" />
              <div className="text-sm font-medium">{l.titulo}</div>
              <div className="text-xs text-ui-textSecondary">— {l.autor}</div>
            </div>
            <div className="mt-2">
              <ResponsiveContainer width="100%" height={60}>
                <BarChart data={[{ name: 'p', value: pct }]} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                  <Bar dataKey="value" fill="#7A8A73" radius={[8, 8, 8, 8]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="text-right text-xs text-ui-textSecondary">{l.lidas}/{l.paginas} ({pct}%)</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function WidgetPomodoroPlanner({ total = 8, feitos = 3 }: { total?: number; feitos?: number }) {
  const arr = Array.from({ length: total })
  return (
    <div className="p-4 grid grid-cols-8 gap-2">
      {arr.map((_, i) => (
        <div key={i} className={`w-8 h-8 rounded-full ${i < feitos ? 'bg-ui-primary' : 'bg-ui-base'} border border-ui-border`}></div>
      ))}
      <div className="col-span-8 text-right text-xs text-ui-textSecondary">{feitos}/{total} sessões</div>
    </div>
  )
}

export function WidgetIdeias({ itens = ['Ideia 1', 'Ideia 2', 'Ideia 3'] }: { itens?: string[] }) {
  return (
    <div className="p-4 grid grid-cols-3 gap-3">
      {itens.map((t, i) => (
        <div key={i} className="h-24 rounded-md bg-ui-base border border-ui-border p-3 text-sm text-ui-text">{t}</div>
      ))}
    </div>
  )
}

export function WidgetMemoriasDoMes({ linhas = 2, colunas = 3 }: { linhas?: number; colunas?: number }) {
  const total = linhas * colunas
  return (
    <div className="p-4 grid" style={{ gridTemplateColumns: `repeat(${colunas}, minmax(0, 1fr))`, gap: 8 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="border border-ui-border rounded-md h-32 bg-white flex items-center justify-center text-ui-textSecondary">
          <Camera className="w-6 h-6" />
        </div>
      ))}
    </div>
  )
}

export function WidgetAniversarios({ lista = [{ nome: 'Ana', data: '12/03' }, { nome: 'João', data: '25/08' }] }: { lista?: Array<{ nome: string; data: string }> }) {
  return (
    <div className="p-4 space-y-2">
      {lista.map((p, i) => (
        <div key={i} className="flex items-center gap-3 border border-ui-border rounded-md p-2">
          <Cake className="w-4 h-4 text-ui-textSecondary" />
          <div className="flex-1 text-ui-text text-sm">{p.nome}</div>
          <div className="text-ui-textSecondary text-sm">{p.data}</div>
        </div>
      ))}
    </div>
  )
}

export function StickerPicker({ pack, value, onChange }: { pack?: string; value?: string; onChange: (name: string) => void }) {
  const p = STICKER_PACKS.find(x => x.id === pack) || STICKER_PACKS[0]
  const map: Record<string, any> = { Star, Heart, Square, Droplet, GlassWater, Flag, Calendar, Camera, PiggyBank, Book, Timer, Lightbulb, Coffee, Utensils, Cookie, Moon, ShoppingCart, Car, Film, Cake }
  return (
    <div>
      <select value={p.id} onChange={e => onChange(`${e.target.value}:${value || p.items[0].icon}`)} className="w-full border border-ui-border rounded-md px-2 py-1 text-sm">
        {STICKER_PACKS.map(sp => (<option key={sp.id} value={sp.id}>{sp.name}</option>))}
      </select>
      <div className="mt-2 grid grid-cols-5 gap-2">
        {p.items.map(it => {
          const Comp = map[it.icon] || Star
          const active = value === it.icon
          return (
            <button key={it.id} onClick={() => onChange(it.icon)} className={`p-2 border rounded-md ${active ? 'border-ui-primary' : 'border-ui-border'}`}>
              <Comp className="w-5 h-5" />
              <div className="text-[10px] text-ui-textSecondary mt-1">{it.label}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function WidgetSticker({ pack = 'productivity', name = 'Star', tint = '#C7B7DD', size = 64, rotation = 0, draggable = false }: { pack?: string; name?: string; tint?: string; size?: number; rotation?: number; draggable?: boolean }) {
  const map: Record<string, any> = { Star, Heart, Square, Droplet, GlassWater, Flag, Calendar, Camera, PiggyBank, Book, Timer, Lightbulb, Coffee, Utensils, Cookie, Moon, ShoppingCart, Car, Film, Cake }
  const Comp = map[name] || Star
  const Box = draggable ? motion.div : 'div'
  return (
    <Box className="p-4 flex items-center justify-center" {...(draggable ? { drag: true } : {})} style={{ cursor: draggable ? 'move' : 'default' }}>
      <div className="rounded-2xl px-4 py-3" style={{ backgroundColor: tint }}>
        <Comp className="w-8 h-8 text-white" style={{ width: size, height: size, transform: `rotate(${rotation}deg)` }} />
      </div>
    </Box>
  )
}

export function WidgetWeeklyFocus({ itens = ['Foco 1', 'Foco 2', 'Foco 3'] }: { itens?: string[] }) {
  return (
    <div className="p-4 border-ui-border">
      <div className="text-sm font-medium text-ui-text mb-2">Weekly Focus</div>
      <div className="space-y-2">
        {itens.map((t, i) => (
          <div key={i} className="flex items-center gap-2">
            <Star className="w-4 h-4 text-ui-primary" />
            <div className="text-sm text-ui-text">{t}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function WidgetBrainDump({ linhas = 6 }: { linhas?: number }) {
  return (
    <div className="p-4">
      <div className="text-sm font-medium text-ui-text mb-2">Brain Dump</div>
      <div className="space-y-2">
        {Array.from({ length: linhas }).map((_, i) => (
          <div key={i} className="h-10 rounded-md border border-ui-border bg-white" />
        ))}
      </div>
    </div>
  )
}



export function WidgetNoteGraph({ linhas = 16, colunas = 12 }: { linhas?: number; colunas?: number }) {
  return (
    <div className="p-4">
      <div className="grid" style={{ gridTemplateColumns: `repeat(${colunas}, minmax(0, 1fr))`, gap: 1 }}>
        {Array.from({ length: linhas * colunas }).map((_, i) => (
          <div key={i} className="h-6 border border-ui-border bg-white" />
        ))}
      </div>
    </div>
  )
}

export function WidgetNoteDot({ linhas = 22, colunas = 16 }: { linhas?: number; colunas?: number }) {
  return (
    <div className="p-6">
      <div className="grid" style={{ gridTemplateColumns: `repeat(${colunas}, minmax(0, 1fr))`, gap: 12 }}>
        {Array.from({ length: linhas * colunas }).map((_, i) => (
          <div key={i} className="w-1 h-1 rounded-full bg-ui-border" />
        ))}
      </div>
    </div>
  )
}



export function WidgetCalendarioAnual({ meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'] }: { meses?: string[] }) {
  return (
    <div className="p-4 grid grid-cols-3 gap-3">
      {meses.map((m) => (
        <div key={m} className="border border-ui-border rounded-md p-2 bg-white">
          <div className="text-xs font-medium text-ui-text mb-2">{m}</div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 28 }).map((_, i) => (
              <div key={i} className="h-4 border border-ui-border" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function WidgetVisaoTrimestral({ prompts = ['Objetivos', 'Hábitos', 'Eventos'] }: { prompts?: string[] }) {
  return (
    <div className="p-4 grid grid-cols-3 gap-3">
      {prompts.map((p, i) => (
        <div key={i} className="border border-ui-border rounded-md p-3 bg-white">
          <div className="text-sm font-medium text-ui-text mb-2">{p}</div>
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, j) => (
              <div key={j} className="h-8 rounded-md border border-ui-border" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function WidgetDatasChave({ itens = [{ titulo: 'Projeto', data: '10/02' }] }: { itens?: Array<{ titulo: string; data: string }> }) {
  return (
    <div className="p-4 space-y-2">
      {itens.map((it, i) => (
        <div key={i} className="flex items-center gap-3 border border-ui-border rounded-md p-2">
          <Calendar className="w-4 h-4 text-ui-textSecondary" />
          <div className="flex-1 text-ui-text text-sm">{it.titulo}</div>
          <div className="text-ui-textSecondary text-sm">{it.data}</div>
        </div>
      ))}
    </div>
  )
}

export function WidgetWeeklyTabs() {
  return (
    <div className="p-4">
      <Tabs defaultValue="classic">
        <TabsList className="flex gap-2 mb-3">
          <TabsTrigger value="classic" className="px-3 py-2 rounded-md border border-ui-border">Classic</TabsTrigger>
          <TabsTrigger value="hourly" className="px-3 py-2 rounded-md border border-ui-border">Hourly</TabsTrigger>
        </TabsList>
        <TabsContent value="classic" className="space-y-3">
          <WidgetPlannerSemanal />
          <WidgetWeeklyFocus />
          <WidgetPrioridadesDoDia />
          <WidgetBrainDump />
        </TabsContent>
        <TabsContent value="hourly" className="space-y-3">
          <WidgetHorarioDoMeuDia />
          <WidgetWeeklyFocus />
          <WidgetPrioridadesDoDia />
          <WidgetBrainDump />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Notebooks / Note templates
export function WidgetNoteLined({ linhas = 24, spacing = 28 }: { linhas?: number; spacing?: number }) {
  const bg = `repeating-linear-gradient(0deg, #FFFFFF, #FFFFFF ${spacing - 1}px, #e5e7eb ${spacing}px)`
  return <div className="p-4 border border-ui-border rounded-md" style={{ backgroundImage: bg, height: linhas * spacing }} />
}

export function WidgetNoteDotGrid({ linhas = 24, spacing = 24, dotSize = 2 }: { linhas?: number; spacing?: number; dotSize?: number }) {
  const size = spacing
  const bg = `radial-gradient(#e5e7eb ${dotSize}px, transparent ${dotSize}px)`
  return <div className="p-4 border border-ui-border rounded-md" style={{ backgroundImage: bg, backgroundSize: `${size}px ${size}px`, height: linhas * spacing }} />
}

export function WidgetNoteGraphGrid({ linhas = 24, spacing = 24 }: { linhas?: number; spacing?: number }) {
  const size = spacing
  const bg = `linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)`
  return <div className="p-4 border border-ui-border rounded-md" style={{ backgroundImage: bg, backgroundSize: `${size}px ${size}px`, height: linhas * spacing }} />
}

export function WidgetNoteCornell({ linhas = 24, spacing = 28 }: { linhas?: number; spacing?: number }) {
  const bg = `repeating-linear-gradient(0deg, #FFFFFF, #FFFFFF ${spacing - 1}px, #e5e7eb ${spacing}px)`
  return (
    <div className="p-4 border border-ui-border rounded-md grid grid-cols-[220px_1fr] gap-4">
      <div className="border border-ui-border rounded-md p-2">
        <div className="text-xs text-ui-textSecondary mb-1">Notas/Keywords</div>
        <div style={{ backgroundImage: bg, height: linhas * spacing }} />
      </div>
      <div className="border border-ui-border rounded-md p-2">
        <div className="text-xs text-ui-textSecondary mb-1">Conteúdo</div>
        <div style={{ backgroundImage: bg, height: (linhas - 4) * spacing }} />
        <div className="mt-3 border-t border-ui-border pt-2">
          <div className="text-xs text-ui.textSecondary mb-1">Resumo</div>
          <div style={{ backgroundImage: bg, height: 4 * spacing }} />
        </div>
      </div>
    </div>
  )
}

export type WidgetEntry = { type: WidgetKind; props: any; style?: { bg?: string; padding?: number; shadow?: string; borderRadius?: string; size?: number; textureLayers?: Array<{ id: string; src: string; name?: string; fill: 'esticar' | 'repetir' | 'centralizar'; angle: number; posX: number; posY: number; scale: number; opacity?: number; zIndex: number }> } }

export function WidgetRenderer({ entry }: { entry: WidgetEntry }) {
  const style = entry.style || {}
  const container = `bg-white ${style.borderRadius || 'rounded-md'} ${style.shadow || 'shadow-sm'} ${typeof style.padding === 'number' ? '' : 'p-2'}`
  const innerStyle: React.CSSProperties = { backgroundColor: style.bg || 'transparent', padding: typeof style.padding === 'number' ? style.padding : undefined, minHeight: style.size ? (style.size === 1 ? 100 : style.size === 2 ? 180 : 280) : undefined }
  return (
    <div className={container} style={innerStyle}>
      <div className="relative">
        {(style as any).textureLayers?.slice()?.sort((a: any, b: any) => a.zIndex - b.zIndex)?.map((l: any) => {
          const base: React.CSSProperties = { position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: l.zIndex, opacity: l.opacity ?? 1 }
          const bg: React.CSSProperties = { backgroundImage: `url(${l.src})` }
          const fill = l.fill === 'esticar' ? { backgroundSize: 'cover', backgroundRepeat: 'no-repeat' } : l.fill === 'centralizar' ? { backgroundSize: 'auto', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' } : { backgroundRepeat: 'repeat' }
          const transform = `translate(${l.posX}px, ${l.posY}px) rotate(${l.angle}deg) scale(${l.scale})`
          return <div key={l.id} style={{ ...base, ...bg, ...fill, transform }} />
        })}
        <div className="relative z-10">
          {entry.type === 'texto' ? <WidgetTexto {...entry.props} /> : null}
          {entry.type === 'controleDeAgua' ? <WidgetControleDeAgua {...entry.props} cols={entry.style?.size === 1 ? 4 : entry.style?.size === 2 ? 8 : 4} /> : null}
          {entry.type === 'listaDeTarefas' ? <WidgetListaDeTarefas {...entry.props} rows={entry.style?.size === 1 ? 4 : entry.style?.size === 2 ? 8 : 14} /> : null}
          {entry.type === 'progressBar' ? <WidgetProgressBar {...entry.props} /> : null}
          {entry.type === 'plannerSemanal' ? <WidgetPlannerSemanal {...entry.props} /> : null}
          {entry.type === 'plannerMensal' ? <WidgetPlannerMensal {...entry.props} /> : null}
          {entry.type === 'prioridadesDoDia' ? <WidgetPrioridadesDoDia {...entry.props} /> : null}
          {entry.type === 'horarioDoMeuDia' ? <WidgetHorarioDoMeuDia {...entry.props} /> : null}
          {entry.type === 'trackerDeHabitos' ? <WidgetTrackerDeHabitos {...entry.props} /> : null}
          {entry.type === 'trackerDeSono' ? <WidgetTrackerDeSono {...entry.props} /> : null}
          {entry.type === 'refeicoes' ? <WidgetRefeicoes {...entry.props} /> : null}
          {entry.type === 'controleDeGastos' ? <WidgetControleDeGastos {...entry.props} /> : null}
          {entry.type === 'poupanca' ? <WidgetPoupanca {...entry.props} /> : null}
          {entry.type === 'contadorRegressivo' ? <WidgetContadorRegressivo {...entry.props} /> : null}
          {entry.type === 'metas3Meses' ? <WidgetMetas3Meses {...entry.props} /> : null}
          {entry.type === 'gratitude' ? <WidgetGratitude {...entry.props} /> : null}
          {entry.type === 'trackerDeExercicios' ? <WidgetTrackerDeExercicios {...entry.props} /> : null}
          {entry.type === 'bookTracker' ? <WidgetBookTracker {...entry.props} /> : null}
          {entry.type === 'pomodoroPlanner' ? <WidgetPomodoroPlanner {...entry.props} /> : null}
          {entry.type === 'ideias' ? <WidgetIdeias {...entry.props} /> : null}
          {entry.type === 'memoriasDoMes' ? <WidgetMemoriasDoMes {...entry.props} /> : null}
          {entry.type === 'aniversarios' ? <WidgetAniversarios {...entry.props} /> : null}
          {entry.type === 'sticker' ? <WidgetSticker {...entry.props} /> : null}
          {entry.type === 'weeklyFocus' ? <WidgetWeeklyFocus {...entry.props} /> : null}
          {entry.type === 'brainDump' ? <WidgetBrainDump {...entry.props} /> : null}
          {entry.type === 'noteLined' ? <WidgetNoteLined {...entry.props} /> : null}
          {entry.type === 'noteGraph' ? <WidgetNoteGraph {...entry.props} /> : null}
          {entry.type === 'noteDot' ? <WidgetNoteDot {...entry.props} /> : null}
          {entry.type === 'noteCornell' ? <WidgetNoteCornell {...entry.props} /> : null}
          {entry.type === 'calendarioAnual' ? <WidgetCalendarioAnual {...entry.props} /> : null}
          {entry.type === 'visaoTrimestral' ? <WidgetVisaoTrimestral {...entry.props} /> : null}
          {entry.type === 'datasChave' ? <WidgetDatasChave {...entry.props} /> : null}
          {entry.type === 'weeklyTabs' ? <WidgetWeeklyTabs {...entry.props} /> : null}
          {entry.type === 'moodTracker' ? <WidgetMoodTracker {...entry.props} /> : null}
          {entry.type === 'divisor' ? <WidgetDivisor {...entry.props} /> : null}
          {entry.type === 'imagem' ? <WidgetImagem {...entry.props} /> : null}
          {entry.type === 'listaNumerada' ? <WidgetListaNumerada {...entry.props} /> : null}
          {entry.type === 'listaComPontos' ? <WidgetListaComPontos {...entry.props} /> : null}
        </div>
      </div>

    </div>
  )
}



export function IconPickerBasic({ value, onChange }: { value?: string; onChange: (name: string) => void }) {
  const icons = [
    { name: 'Star', Comp: Star },
    { name: 'Heart', Comp: Heart },
    { name: 'Square', Comp: Square },
    { name: 'Droplet', Comp: Droplet },
    { name: 'GlassWater', Comp: GlassWater },
    { name: 'Flag', Comp: Flag },
    { name: 'Calendar', Comp: Calendar },
    { name: 'Camera', Comp: Camera },
  ]
  const [query, setQuery] = React.useState('')
  const filtered = icons.filter(i => i.name.toLowerCase().includes(query.toLowerCase()))
  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar ícone" className="w-full border border-ui-border rounded-md px-2 py-1 text-sm" />
      <div className="mt-2 grid grid-cols-4 gap-2">
        {filtered.map(({ name, Comp }) => (
          <button key={name} onClick={() => onChange(name)} className={`p-2 border rounded-md ${value === name ? 'border-ui-primary' : 'border-ui-border'}`}>
            <Comp className="w-5 h-5 text-ui-text" />
            <div className="text-[10px] text-ui-textSecondary mt-1">{name}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

export const IconPicker = IconPickerBasic

export function TemplateRenderer({ template }: { template: { blocks: Array<{ type: WidgetKind; props?: any; style?: WidgetEntry['style'] }> } }) {
  return (
    <div className="space-y-3">
      {template.blocks.map((b, i) => (
        <WidgetRenderer key={i} entry={{ type: b.type, props: b.props || {}, style: b.style }} />
      ))}
    </div>
  )
}
