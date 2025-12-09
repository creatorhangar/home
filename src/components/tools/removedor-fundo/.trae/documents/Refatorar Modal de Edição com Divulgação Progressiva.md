## Objetivo

* Reduzir sobrecarga cognitiva com três níveis: Simples → Ajustes Rápidos → Avançado.

* Adotar linguagem humana e reorganizar controles por objetivo.

## Mapeamento no Código Atual

* Estado e presets existentes: `App.tsx:31` (modo), `App.tsx:45-65` (defaults).

* Painel de edição e controles: `components/PreviewModal.tsx`.

  * Presets por tipo de imagem: `components/PreviewModal.tsx:1189-1210`.

  * Sliders chave (tolerância, borda, suavização, opening/closing, descontaminação): `components/PreviewModal.tsx:1211-1223`.

  * Ferramentas manuais (Borracha/Restaurar, Cortar): `components/PreviewModal.tsx:1118-1140` e lógica de pincel `components/PreviewModal.tsx:573-612`.

  * GrabCut com marcações e bbox: `components/PreviewModal.tsx:1224-1244` + worker `workers/grabcutWorker.ts:103-161`.

  * Chroma HSV e calibração: `components/PreviewModal.tsx:1245-1280` e `workers/grabcutWorker.ts:283-320`.

* Terminologia i18n já amigável em `utils/localization.ts:82-183` (ajustar rótulos de Opening/Closing).

## Nível 1: Modo Simplificado

* Nova view `SimpleControls` dentro do modal com 4 opções grandes:

  * Automático, Retrato, Produto/Objeto, Green Screen.

  * essas opções também viram pequenos icones dentro de cada card individual do modo em lote, onde sem abir o modal o usuario consegue selecionar um dos 4 presets, ou opcao de selecionar todos e mudar o tipo de preset na propria tela inicial com as imagens em lote.

* Ações ao clicar:

  * aplicar preset mapeado aos existentes (`components/PreviewModal.tsx:1191-1199`).

  * gerar prévia com `removeBackgroundClientSide` (`components/PreviewModal.tsx:319-335`).

* Botões: `Aplicar` e `Modo Avançado →` (troca de subview).

## Nível 2: Ajustes Rápidos

* Exibir se heurística simples indicar qualidade mediana:

  * Heurística inicial: razão de máscara 0/255 nas bordas > limiar, ou opening sugerido > 0 (rápido via worker `morph`).

* Três cartões:

  * Refinar Manualmente: ativa Borracha/Restaurar, `brushSize` e `brushHardness` (`components/PreviewModal.tsx:1126-1140`).

  * Ajustar Bordas: `edgeSoftness`, `edgeRefinement`, `contourSmoothing` (`components/PreviewModal.tsx:1217-1220`).

  * Corrigir Cores: `colorDecontamination` (`components/PreviewModal.tsx:1222`).

* Cada ação com preview imediato e botão desfazer/refazer já existentes.

## Nível 3: Modo Avançado

* Reorganizar por objetivo em acordeões:

  * Seleção: Crop/bbox e scribbles FG/BG (`components/PreviewModal.tsx:1229-1236`, `components/PreviewModal.tsx:1070-1076`).

  * Método de Detecção: seletor de modo + presets (`components/PreviewModal.tsx:1175-1210`).

  * Ajuste Fino: tolerância, bordas, opening/closing (`components/PreviewModal.tsx:1211-1221`).

  * Correção de Cor: descontaminação e Bilateral (usar worker `filter`: `workers/grabcutWorker.ts:254-281`).

* Botões: `Aplicar`, `Resetar`, `Voltar` (usar já `handleApply`, `handleRevertToOriginal`).

## Terminologia

* Atualizar rótulos em pt-BR:

  * Opening → Remover pontos isolados.

  * Closing → Fechar pequenos buracos.

  * Tolerância → Sensibilidade de detecção.

  * Edge Softness → Suavização de borda.

  * Edge Refinement → Expandir/encolher seleção.

* Ajustar `utils/localization.ts` mantendo descrições didáticas.

## Feedback Visual

* Adicionar comparação antes/depois com divisor:

  * Duas camadas (`canvas` result e imagem original) com slider horizontal.

  * Toggle "Ver antes/depois" ao lado do controle de fundo (`components/PreviewModal.tsx:1361-1366`).

* Indicador textual: ✓ Ótimo resultado / ⚠️ Precisa ajuste (com base na heurística de qualidade).

## Estado e Navegação

* Estado de submodo do modal: `modeLocal: 'simple' | 'quick-fix' | 'advanced'` dentro de `PreviewModal`.

* Ordem de revelação:

  * Inicia em simple.

  * Se heurística falhar, muda para quick-fix com CTA.

  * Usuário pode ir para advanced manualmente.

## Integração com Pipeline

* Presets disparam workers corretos:

  * Retrato/Produto: GrabCut `graphcut` (`workers/grabcutWorker.ts:163-219`).

  * Green Screen: `chromaHSV` (`workers/grabcutWorker.ts:283-320`).

  * Automático: floodfill atual via `removeBackgroundClientSide`.

* Pós-processo opcional:

  * Limpeza (opening/closing): `task='morph'`.

  * Suavização de borda/halo: `task='filter'` com `edgesOnly=true`.

## Heurística de Qualidade (V1 simples)

* Métrica rápida na prévia:

  * % de pixels com alpha ∈ (1..254) nas bordas > X% → sinaliza halo.

  * contagem de componentes pequenos na máscara > N → sugere opening.

* Sem bloqueios: apenas orienta a mostrar Ajustes Rápidos.

## Validação

* Checklist de UX aplicado no modal:

  * 2 cliques para novos usuários (upload → automático → aplicar).

  * Tooltips com imagens nos cartões de Ajustes Rápidos.

  * Preview antes de cada ajuste já é instantâneo; adicionar divisor.

  * Undo/Redo ativo; botão Reverter claro.

## Entregáveis por Fase

* Fase 1: Estrutura de submodos e SimpleControls; presets amarrados.

* Fase 2: Ajustes Rápidos com heurística; comparação antes/depois.

* Fase 3: Reorganização Avançado por objetivo; revisão de i18n.

* Fase 4: Polimento e testes com imagens de casos (retratos, produto, fundo sólido, green screen).

## Riscos e Mitigações

* Performance em 4K: manter prévias redimensionadas (`components/PreviewModal.tsx:301-318`).

* Consistência de estado: usar `localOptions` e histórico existente; evitar conflitos com `crop` (`components/PreviewModal.tsx:448-459`).

