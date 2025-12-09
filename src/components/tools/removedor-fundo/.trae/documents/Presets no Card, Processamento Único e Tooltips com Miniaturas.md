## Objetivo

Adicionar UX refinada no cartão de imagem: rótulos e ícones localizados para presets, ação "Aplicar e processar" por imagem, e tooltips com miniaturas explicativas para presets e controles de Ajustes Rápidos.

## Localização

- Adicionar chaves em `utils/localization.ts`:
  - `imageCard.presetAuto`, `imageCard.presetPortrait`, `imageCard.presetProduct`, `imageCard.presetGreen`.
  - `imageCard.applyPresetProcess` (botão "Aplicar este preset e processar").
  - Tooltips: `tooltips.presetAuto`, `tooltips.presetPortrait`, `tooltips.presetProduct`, `tooltips.presetGreen` e `tooltips.controls.*` para sliders (borda, refinamento, contorno, descontaminação).
- Incluir PT e EN; demais idiomas mantêm fallback.

## Ícones de Preset

- Mapear ícones existentes:
  - Auto: `SparklesIcon`.
  - Green Screen: `EyedropperIcon` ou `ColorSwatchIcon`.
- Adicionar ícones leves para tipos faltantes em `components/Icons.tsx`:
  - `UserIcon` (Retrato).
  - `CubeIcon` (Produto/Objeto).

## UI no Card

- Atualizar `components/ImageCard.tsx`:
  - Substituir textos fixos dos presets por rótulos i18n e mostrar ícone + label.
  - Adicionar botão secundário "Aplicar e processar" visível no hover:
    - Clique chama `processImageById(image.id)` com merge de `customOptions` da imagem.
    - Desabilitar quando `status==='processing'`.
  - Presets continuam salvando `customOptions` (modo e parâmetros), mantendo estado ativo (realçado).

## Hook de Processamento Único

- Estender `hooks/useImageProcessor.ts`:
  - Nova função `processImageById(id: string, baseOptions: RemovalOptions)`:
    - Seta `status='processing'` e inicia `removeBackgroundClientSide` com `{...baseOptions, ...(image.customOptions||{}), removalInfo}`.
    - Atualiza `progress`, `processedURL`, `status` e persistência em IndexedDB.
  - Exportar a função e passá-la pelo `App.tsx` → `ImageGrid` → `ImageCard`.

## Tooltips com Miniaturas

- Criar `components/Tooltip.tsx` simples:
  - Props: `title`, `desc`, `imgSrc`.
  - Aparência: bolha leve com imagem 120×80 e texto curto.
- Presets (card): mostrar tooltip com miniatura demonstrando efeito típico.
- Ajustes Rápidos (PreviewModal): anexar tooltip aos labels dos sliders:
  - `edgeSoftness`, `edgeRefinement`, `contourSmoothing`, `colorDecontamination`.
- Imagens: colocar em `public/tooltips/*` (PNG) inicialmente; se não disponíveis, fallback para `title` textual.

## Integração e Acessibilidade

- Adicionar `aria-label` e `title` aos botões.
- Manter teclado acessível (foco, Enter/Space).

## Verificação

- Build do projeto e smoke test:
  - Troca de preset no card altera destaque e `customOptions`.
  - "Aplicar e processar" processa apenas a imagem alvo.
  - Tooltips aparecem no hover e não obstruem cliques.

## Entregáveis por Fase

1. Localização e ícones (inclui novos ícones).
2. Presets com rótulos/ícones + botão "Aplicar e processar" no card.
3. Tooltip component + tooltips para presets e sliders.
4. Testes manuais e polimento (estados desabilitados, acessibilidade).