## Objetivo
- Criar um Stepper visual e responsivo no topo do modal, com ícones, tooltips e transições suaves; adicionar um seletor de "Tipo de Imagem" na tela principal com presets aplicáveis em lote e pré-visualização; manter consistência de design, tratamento de erros e testes.

## Entregáveis
- Stepper visual com estados: Definir área → Ajustar parâmetros → Refino manual → Aplicar, incluindo destaque de “Próximo passo”.
- Seletor de Tipo (Auto, Retrato, Produto, Logo/Texto, Green Screen) com presets em lote e preview.
- Integração com processamento existente (Workers, fila, progresso/cancelamento).
- Testes unitários e de integração; documentação atualizada.

## Atualizações Visuais
### Stepper no Modal
- Componente `TopStepper` no topo de `PreviewModal`:
  - Quatro passos com ícones (usar `Icons.tsx`), tooltips com descrições curtas.
  - Realce do passo ativo; badge “Próximo passo” habilitado quando critérios do passo atual forem atendidos (ex.: bbox definida para passo 1).
  - Transições: fade/slide entre painéis; animação ao avançar/retroceder.
- Estado de passos: máquina simples (`currentStep: 0..3`) com guardas e callbacks; botões desabilitados durante processamento; “Cancelar” mantém última máscara válida.

### Seletor de Tipo na Tela Principal
- Componente `ImageTypeSelector` no header/configurações da tela principal:
  - Opções: Auto, Retrato, Produto (→ GrabCut λ≈50), Logo/Texto (→ Silhouette + Closing), Green Screen (→ Chroma Key tolerância/smoothness/spill).
  - Seleção múltipla em `ImageGrid`: checkboxes por imagem e “Selecionar tudo”.
  - Botões: “Aplicar preset a selecionadas”, “Pré-visualizar preset” (gera prévia rápida 1024px antes do refino full), “Reverter preset”.
  - Mantém consistência de estilos (classes utilitárias existentes).

## Integração e Fluxo
- `hooks/useImageProcessor.ts`:
  - Adicionar seleção múltipla (estado `selectedIds: Set<string>`), funções `selectImage`, `selectAll`, `applyPresetToSelected` (atualiza `options` no processamento em lote), `previewPresetForSelected` (prévia rápida em baixa res). 
  - Usar fila com concorrência existente e prioridade para imagens ativas.
- `utils/imageProcessor.ts`:
  - Mapear presets → `RemovalOptions`; manter `autoDetectMode` para Auto.
  - Garantir erros tratados (timeouts de Worker, cancelamento, fallback); emitir progresso.
- `components/ImageCard.tsx`:
  - Checkbox de seleção; exibir estado de preset; barra de progresso já integrada.

## Responsividade e Consistência
- Desktop/Mobile: stepper em linha no desktop, carrossel compacto no mobile; tooltips acessíveis (`aria-label`, foco/teclado).
- Classes utilitárias já usadas (cores, bordas, tipografia) para consistência; transições leves (`transition-all`, `duration-300`).

## Tratamento de Erros
- Workers: captura de erro, fallback local e toast contextual; botão “Cancelar” ativo; watchdog por etapa.
- Batch: se uma imagem falhar em preset/preview, registrar erro no card, manter as demais na fila.

## Testes
- Unitários (Vitest + RTL):
  - `autoDetectMode` (chroma/silhouette/grabcut/floodfill), mapeamento de presets.
  - Render do Stepper: estados, tooltips, avanço somente quando critérios atendidos.
  - Seleção múltipla e aplicação de presets em `ImageGrid`.
- Integração:
  - Fluxo completo: seleção → preview preset (baixa res) → refino full → cancelar/retomar.
  - Mensageria Worker: progresso/cancelamento.

## Documentação
- Atualizar guia em `public/bg_removal_upgrade_guide (1).md` com:
  - Uso do Stepper e dos presets, critérios de cada etapa, dicas por tipo de imagem.
  - Troubleshooting (erros comuns, cancelamento, performance em 4K/8K).

## Alterações Planejadas por Arquivo
- `components/PreviewModal.tsx`: `TopStepper`, destaque “Próximo passo”, tooltips, transições; integração com passos.
- `components/Header.tsx`: inserir `ImageTypeSelector` com presets e ações.
- `components/ImageGrid.tsx`/`ImageCard.tsx`: seleção múltipla e indicadores de preset.
- `hooks/useImageProcessor.ts`: seleção e aplicação/preview em lote; integração com fila.
- `utils/imageProcessor.ts`: mapeamento de presets e tratamento de erros reforçado.
- `tests/`: novos testes unitários e de integração.

## Critérios de Sucesso
- Feedback inicial ≤ 5s (prévia 1024px) com Stepper visível e progresso.
- 100% sem travamentos (cancelamento e watchdog por etapa; fila com concorrência).
- UI clara e responsiva com “Próximo passo” destacado.
- Precisão ≥ 90% em diversos tipos via presets e refinos.
