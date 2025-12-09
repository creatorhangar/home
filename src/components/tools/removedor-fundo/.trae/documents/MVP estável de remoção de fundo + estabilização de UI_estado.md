## Objetivo
- Entregar um MVP robusto e previsível que remove fundo e exporta, com UI responsiva e sem loops de render.

## Corte de Escopo (MVP)
- Modos mantidos: `floodfill` (Auto), `chroma` (HSV/YUV com tolerância), `grabcut` (via Worker), `silhouette`.
- Remover/ocultar no MVP: benchmark, filtros bilaterais e morfologia manuais na UI, calibração contínua, presets criativos e elementos sobrepostos.

## Estabilização de Estado e Hooks
- `components/PreviewModal.tsx`
  - Substituir debounce ad‑hoc por ref estável:
    - Criar `previewRef = useRef({ timer: 0, lastKey: '' })`.
    - No efeito que hoje dispara `generatePreview` em 300ms (components/PreviewModal.tsx:541–553), calcular `key` a partir de `localOptions`, `localRemovalInfo`, `croppedImageSource` (serialização leve e determinística).
    - Se `key === previewRef.current.lastKey`, não agendar; caso contrário, limpar o timer anterior e agendar `generatePreview(currentOpts, currentInfo)` em 300ms; atualizar `lastKey`.
    - Não incluir funções recreadas nos deps; depender apenas de estados primários.
  - Guardas para `img.onload` e reprocessos:
    - Em `img.onload` (components/PreviewModal.tsx:562–576), adicionar `lastSourceRef` e só executar `updateImageRenderInfo`/`drawResultToCanvas` se `src` mudou de fato. Evitar `setState` que re‑dispara o mesmo efeito.
    - Em `generatePreview` (components/PreviewModal.tsx:296–364), garantir cancelamento do processamento anterior via `cancelRef` antes de iniciar um novo; usar um `inFlightId` para descartar resultados antigos.
  - Fluxo do usuário:
    - Sliders atualizam estado local; `generatePreview` só dispara no botão `Aplicar` ou por debounce de 300ms consolidado, sem dependência de estados derivados.
- `App.tsx` (App.tsx:341–349)
  - Manter overlay de loading (garante ordem de hooks estável). Não usar retornos condicionais antes de hooks.

## UI Mínima e Objetiva
- Simplificar o painel de presets e ações:
  - Manter chips compactos e grid responsivo (components/PreviewModal.tsx:1309–1316) com `text-xs` e largura limitada; mover ações sobre a imagem para a sidebar.
- Controles essenciais visíveis:
  - `Modo`, `Tolerância`, `Fundo` (quadriculado/branco/preto/cor), `Padding`, `FitMode` (contain/cover), `Exportar (PNG/JPG + qualidade)`, `Exportar Lote`.
- Ocultar temporariamente “Ajustes criativos” e evitar reordenação dinâmica de “Ferramentas Principais”; revisar traduções em `utils/localization.ts` quando necessário.

## Performance e Confiabilidade
- GrabCut sempre via Worker:
  - Já suportado por `utils/imageProcessor.ts` com `computeGrabCutMaskInWorker` (utils/imageProcessor.ts:1135–1179) e `workers/grabcutWorker.ts`.
  - Limitar concorrência de prévia a 1 (debounce + cancelamento) e lote a 1–3 (já controlado em `hooks/useImageProcessor.ts`:179).
- Redução de imagem para prévia já implementada (components/PreviewModal.tsx:308–315); manter.
- Error Boundary global com fallback e retry: adicionar `components/ErrorBoundary.tsx` e envolver o conteúdo principal do `App`.

## Remover dependência de CDN (JSZip)
- Substituir `<script>` de CDN (index.html:12) por dependência NPM `jszip`.
- Atualizar `hooks/useImageProcessor.ts`:
  - Remover `declare const JSZip` e importar `import JSZip from 'jszip'`.
  - Manter o fallback de toasts existente para ausência de ZIP; ajustar mensagens em `utils/localization.ts` se necessário.

## Vite Config (dedupe e plugin React)
- Adicionar `vite.config.ts` (não existe atualmente) com:
  - `plugins: [react()]` usando `@vitejs/plugin-react` já presente.
  - `resolve: { dedupe: ['react', 'react-dom'] }` e alias quando necessário.
  - Opcional: `optimizeDeps` coerente para evitar múltiplas cópias em testes/preview.

## Testes e Validação
- Unitário: vitest para garantir que `generatePreview` respeita debounce e descarta resultados antigos.
- Integração: simular `img.onload` com `vitest.setup.ts` (tests/setup/vitest.setup.ts:6–13) e verificar que não há loop.
- E2E: fluxo Upload → Processar → Visualizar → Exportar PNG/JPG → Exportar Lote.
- Lighthouse: verificar métricas básicas pós‑build.

## Deploy e Monitoramento
- Usar pipeline atual (`typecheck`, `lint`, `unit/integration`, `e2e`, `lighthouse`, deploy Pages).
- Web‑Vitals já integrado; manter coleta oportunista.

## Passos Imediatos após sua confirmação
1. Implementar debounce com `previewRef` e guardas de `lastSourceRef` no `PreviewModal` (com cancelamento e `inFlightId`).
2. Simplificar UI essencial na sidebar e chips.
3. Criar `vite.config.ts` com dedupe e plugin React.
4. Migrar `JSZip` para NPM e ajustar `useImageProcessor`.
5. Adicionar `ErrorBoundary` global.
6. Validar em `dev`, executar unitários/e2e locais e te entregar um build pronto para testes. 