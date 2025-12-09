## Contexto e Estado Atual
- Concorrência apresenta: busca por categorias (ex.: “daily focus planner”, “planner stickers”, “wedding planner”, “budget planner”), layouts semanais com abas (“Classic”, “Hourly”), abas laterais de meses, seções “Weekly Focus”, “Top Priorities”, “Brain Dump”, visão anual/trimestral, cadernos de notas com 14 templates (linhas, grid, dot grid, Cornell) e vasta galeria de templates por áreas.
- Nosso produto hoje oferece biblioteca de widgets e exportação, sem uma galeria de templates navegável:
  - Painel de inserção de widgets em `src/App.tsx:188-216`.
  - Renderização dos widgets em `src/widgets.tsx` (semanal, mensal, prioridades, hábitos, sono, refeições, gastos, poupança, pomodoro etc.).
  - Temas visuais em `src/themes.ts:19-105`.
  - Especificação de galeria/metadata no rascunho ainda não implementada (RASCUNHO CRIADOR DE TEMPLATE.txt).

## 1) Funcionalidades da concorrência ainda não implementadas
- Biblioteca/galleria de templates com filtros e busca
  - Descrição técnica: página “Templates” com indexação por tags (ex.: foco, financeiro, casamento), busca, filtros e preview. Estrutura de `TemplateDefinition` + `TemplateRenderer`.
  - Impacto: muito alto (descoberta, velocidade de criação). Viabilidade: alta.
- Páginas anuais e trimestrais (Calendar, Key Dates, Year Overview, Quarter at a Glance)
  - Descrição técnica: componentes `WidgetCalendarioAnual`, `WidgetVisaoTrimestral`, `WidgetDatasChave` agregados em um template “Yearly”.
  - Impacto: alto (planejamento macro). Viabilidade: média.
- Planner semanal com abas “Classic/Hourly” e seções integradas (Weekly Focus, Top Priorities, Brain Dump)
  - Descrição técnica: `WeeklyPage` com `@radix-ui/react-tabs` (já usado em `src/App.tsx:2`) alternando layouts; composição de `WidgetPrioridadesDoDia` (`src/widgets.tsx:225-249`) + `WidgetHorarioDoMeuDia` (`src/widgets.tsx:251-265`) + novos `WidgetWeeklyFocus` e `WidgetBrainDump`.
  - Impacto: muito alto. Viabilidade: alta.
- Abas laterais de meses para navegação
  - Descrição técnica: índice fixo vertical com âncoras para páginas do caderno; rotulagem JAN–DEC.
  - Impacto: alto (navegação). Viabilidade: média.
- Cadernos de notas com 14 templates (linhas, grid, dot grid, Cornell etc.)
  - Descrição técnica: coleção `NoteTemplate` (lined, graph, dot, cornell) com duplicação rápida.
  - Impacto: alto (produtividade). Viabilidade: alta.
- Stickers dedicados
  - Descrição técnica: pacotes SVG/PNG com paleta de cores tema; seletor e posicionamento no canvas; hoje só há `IconPicker` básico.
  - Impacto: médio. Viabilidade: média.
- Duplicação de páginas/seções e custom sections
  - Descrição técnica: operações de página (duplicar, mover, ocultar) e criação de seções nomeadas.
  - Impacto: alto. Viabilidade: alta.
- Busca por sugestões (queries populares)
  - Descrição técnica: autosuggest alimentado por catálogo/tags (“daily focus planner”, “budget planner” etc.).
  - Impacto: médio. Viabilidade: alta.
- Versionamento de templates
  - Descrição técnica: campo `version` e migrações de schema; histórico de alterações.
  - Impacto: médio. Viabilidade: média.

## 2) Elementos positivos para inspirar melhorias
- UX/UI
  - Hierarquia clara (títulos, subtítulos, grid consistente, microcards) e estética minimalista alinhada aos nossos `TEMAS`.
  - Abas horizontais (modo de visualização) e abas laterais (meses) reduzem carga cognitiva.
  - Seções auxiliares contínuas (Focus/Priorities/Brain Dump) integradas à semana melhoram retenção e execução.
- Fluxos eficientes
  - “Quarter at a glance” conecta metas trimestrais com semanas/dias.
  - Cadernos de notas predefinidos (Cornell, dot, grid) aceleram registro e revisão.
  - Duplicação de páginas evita setup repetitivo.
- Estruturas de templates
  - Catálogo amplo por áreas (wellness, produtividade, lifestyle, finanças) com índices e previews.

## 3) Plano de implementação
### Fase 1 — Infraestrutura de Templates (sem mudar visual)
- Definir `TemplateDefinition` (metadata, tags, versão, composição de blocos) e `TemplateRenderer`.
- Criar catálogo interno com 10 templates iniciais (Weekly Classic, Weekly Hourly, Yearly, Quarterly, Cornell Notes, Dot Grid, Graph Grid, Budget Planner, Wedding Planner, Habit Tracker).
- UI da galeria: lista com busca/filters, preview e botão “Usar template”.

### Fase 2 — Cadernos de Notas e Duplicação
- Implementar `NoteTemplate` (lined, grid, dot, Cornell) com duplicação/renomeação e custom sections.
- Operações de página: duplicar, mover, ocultar, exportar.

### Fase 3 — Planejamento Macro
- `WidgetCalendarioAnual`, `WidgetDatasChave`, `WidgetVisaoTrimestral` e template “Yearly Overview”.
- Abas laterais JAN–DEC e navegação por âncora.

### Fase 4 — Semanal Avançado e Stickers
- Weekly com abas (Classic/Hourly) e seções “Weekly Focus”, “Top Priorities”, “Brain Dump”.
- Packs de stickers alinhados aos `TEMAS`.

### Entregáveis de protótipo
- Wireframes e JSON de template (exemplos):
```
TemplateDefinition {
  id: 'weekly-classic',
  title: 'Weekly — Classic',
  tags: ['weekly','focus','priorities'],
  version: 1,
  blocks: [
    { type: 'plannerSemanal' },
    { type: 'prioridadesDoDia' },
    { type: 'weeklyFocus' },
    { type: 'brainDump' }
  ]
}
```
- Componente `TemplateRenderer(entry: TemplateDefinition)` que instancia `WidgetRenderer` para cada bloco mantendo tema atual.

## 4) Requisitos técnicos
- Arquitetura de Templates
  - Tipos: `TemplateDefinition`, `TemplateBlock`, `NoteTemplate`, `TemplateCatalog`.
  - Renderização: `TemplateRenderer` compõe blocos (`WidgetRenderer`) respeitando `TEMAS` e layout do canvas (`src/App.tsx:220-249`).
  - Persistência: `localStorage` (como em `src/App.tsx:52-58`) com chave nova `template_creator_catalog`; preparado para backend futuro.
  - Versionamento: campo `version` + migração ao carregar; auditoria mínima (`updatedAt`).
- Padrões de código e componentes reutilizáveis
  - Continuar com TypeScript e Radix (`Tabs`/`Popover` já usados), framer-motion e lucide.
  - Widgets atômicos, sem estado interno persistente; props declarativas e seguras.
  - Naming consistente com `Widget*` e `Template*`.
- Personalização e versionamento
  - Overrides de props por usuário (ex.: cores, textos, layout) salvos em `LayoutState` estendido.
  - Histórico (undo/redo já existente em `src/App.tsx:60-80,142-155`) aplicado a templates.
- Testes automatizados
  - Unit: validação de schema (props obrigatórios/compatibilidade de versão).
  - Snapshot: render de `TemplateRenderer` para 10 templates base.
  - Integração: fluxo galeria→preview→aplicar→persistir.

## Métricas de impacto
- Adoção de templates: % sessões que iniciam pela galeria.
- Tempo até primeiro export: mediana por template.
- Taxa de duplicação de páginas e uso de notas.
- Retenção semanal: nº de semanas com uso de “Weekly Focus/Priorities/Brain Dump”.
- Exportações e satisfação (NPS) por categoria de template.

## Identidade Visual
- Manter `TEMAS` atuais, tipografia e bordas/sombras; novos componentes devem seguir classes utilitárias existentes e cores/acento por tema.

## Próximo passo
- Implementar Fase 1 (modelo de template + galeria) e os 10 templates iniciais; em seguida, Fase 2 (notas e duplicação). Confirma para iniciar a execução.