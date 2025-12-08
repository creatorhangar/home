import { WidgetEntry } from './widgets'

export type TemplateBlock = WidgetEntry

export type TemplateDefinition = {
  id: string
  title: string
  tags: string[]
  version: number
  blocks: TemplateBlock[]
}

export const TEMPLATES_CATALOG: TemplateDefinition[] = [
  {
    id: 'weekly-classic',
    title: 'Weekly — Classic',
    tags: ['weekly', 'focus', 'priorities'],
    version: 1,
    blocks: [
      { type: 'texto', props: { content: 'Weekly', align: 'left', tipo: 'titulo' } },
      { type: 'plannerSemanal', props: {} },
      { type: 'prioridadesDoDia', props: {} },
      { type: 'listaDeTarefas', props: { items: [{ text: 'Brain dump', done: false }], variant: 'checkbox' } },
    ],
  },
  {
    id: 'yearly-overview',
    title: 'Yearly Overview',
    tags: ['year','overview','monthly'],
    version: 1,
    blocks: [
      { type: 'texto', props: { content: 'Year Overview', align: 'left', tipo: 'titulo' } },
      { type: 'plannerMensal', props: { dias: 31 } },
      { type: 'plannerMensal', props: { dias: 30 } },
      { type: 'plannerMensal', props: { dias: 31 } },
      { type: 'metas3Meses', props: {} },
    ],
  },
  {
    id: 'quarterly',
    title: 'Quarter at a Glance',
    tags: ['quarter','goals'],
    version: 1,
    blocks: [
      { type: 'texto', props: { content: 'Quarter Goals', align: 'left', tipo: 'titulo' } },
      { type: 'metas3Meses', props: {} },
      { type: 'progressBar', props: { titulo: 'Progresso Trimestral', valor_atual: 30, valor_meta: 100, tipo_barra: 'linear' } },
    ],
  },
  {
    id: 'notes-cornell',
    title: 'Cornell Notes',
    tags: ['notes','cornell'],
    version: 1,
    blocks: [
      { type: 'noteCornell', props: {} },
    ],
  },
  {
    id: 'notes-dot',
    title: 'Dot Grid Notes',
    tags: ['notes','dot'],
    version: 1,
    blocks: [
      { type: 'noteDotGrid', props: {} },
    ],
  },
  {
    id: 'notes-graph',
    title: 'Graph Grid Notes',
    tags: ['notes','grid'],
    version: 1,
    blocks: [
      { type: 'noteGraphGrid', props: {} },
    ],
  },
  {
    id: 'notes-lined',
    title: 'Lined Notes',
    tags: ['notes','lined'],
    version: 1,
    blocks: [
      { type: 'noteLined', props: {} },
    ],
  },
  {
    id: 'weekly-hourly',
    title: 'Weekly — Hourly',
    tags: ['weekly', 'hourly', 'schedule'],
    version: 1,
    blocks: [
      { type: 'texto', props: { content: 'Weekly (Hourly)', align: 'left', tipo: 'titulo' } },
      { type: 'horarioDoMeuDia', props: {} },
      { type: 'prioridadesDoDia', props: {} },
    ],
  },
  {
    id: 'budget-planner',
    title: 'Budget Planner',
    tags: ['finance', 'budget', 'savings'],
    version: 1,
    blocks: [
      { type: 'texto', props: { content: 'Budget Planner', align: 'left', tipo: 'titulo' } },
      { type: 'controleDeGastos', props: {} },
      { type: 'poupanca', props: { atual: 0, meta: 1000 } },
    ],
  },
  {
    id: 'wedding-planner',
    title: 'Wedding Planner',
    tags: ['wedding', 'events', 'countdown'],
    version: 1,
    blocks: [
      { type: 'texto', props: { content: 'Wedding Planner', align: 'left', tipo: 'titulo' } },
      { type: 'listaDeTarefas', props: { items: [{ text: 'Lista de convidados', done: false }, { text: 'Local', done: false }], variant: 'checkbox' } },
      { type: 'contadorRegressivo', props: { diasRestantes: 90 } },
      { type: 'controleDeGastos', props: {} },
    ],
  },
  {
    id: 'habit-tracker',
    title: 'Habit Tracker',
    tags: ['habits', 'wellness'],
    version: 1,
    blocks: [
      { type: 'texto', props: { content: 'Habit Tracker', align: 'left', tipo: 'titulo' } },
      { type: 'trackerDeHabitos', props: {} },
      { type: 'moodTracker', props: { dias: 30 } },
    ],
  },
  {
    id: 'meal-planner',
    title: 'Meal Planner',
    tags: ['wellness', 'food'],
    version: 1,
    blocks: [
      { type: 'texto', props: { content: 'Meal Planner', align: 'left', tipo: 'titulo' } },
      { type: 'refeicoes', props: {} },
    ],
  },
  {
    id: 'book-tracker',
    title: 'Book Tracker',
    tags: ['reading', 'productivity'],
    version: 1,
    blocks: [
      { type: 'texto', props: { content: 'Book Tracker', align: 'left', tipo: 'titulo' } },
      { type: 'bookTracker', props: {} },
    ],
  },
  {
    id: 'pomodoro',
    title: 'Pomodoro Sessions',
    tags: ['focus', 'productivity'],
    version: 1,
    blocks: [
      { type: 'texto', props: { content: 'Pomodoro', align: 'left', tipo: 'titulo' } },
      { type: 'pomodoroPlanner', props: {} },
      { type: 'prioridadesDoDia', props: {} },
    ],
  },
  {
    id: 'ideas',
    title: 'Ideas Board',
    tags: ['ideation', 'notes'],
    version: 1,
    blocks: [
      { type: 'texto', props: { content: 'Ideas', align: 'left', tipo: 'titulo' } },
      { type: 'ideias', props: {} },
      { type: 'listaComPontos', props: { itens: ['Tarefas rápidas'], icone: 'Star' } },
    ],
  },
  {
    id: 'memories',
    title: 'Monthly Memories',
    tags: ['journaling', 'lifestyle'],
    version: 1,
    blocks: [
      { type: 'texto', props: { content: 'Memórias do Mês', align: 'left', tipo: 'titulo' } },
      { type: 'memoriasDoMes', props: {} },
    ],
  },
]
