## Objetivo
- Integrar GraphCut (min‑cut/max‑flow) no Worker com GMM iterativo e refinamentos; migrar operações pesadas (morfológicas e filtros) para o Worker com cancelamento, progresso e responsividade em imagens 4K.

## Fase 1: GraphCut no Worker
- Mensageria: usar um único Worker existente com `task` ("graphcut", "morph", "filter"), `taskId`, e eventos de progresso `{stage, iter, progress}`; cancelar via mensagem `{type:"cancel", taskId}` com flag interna.
- Dados de entrada: `imageData` (transferível), `trimap/labels` (derivado de bbox e scribbles), e opções (`k`, `lambda`, `maxIters`, `epsilon`).
- GMM (FG/BG):
  - Inicializar a partir de rótulos atuais (FG/BG), `k=5` componentes por classe.
  - Estimar parâmetros com EM simplificado: pesos, médias, covariâncias diagonais (em espaço Lab para melhor robustez), até convergir ou `emIters`.
  - Atualizar por iteração GraphCut ↔ GMM.
- Termo de dados (t‑links):
  - `D_fg(p) = -log P(color_p | GMM_fg)`, `D_bg(p) = -log P(color_p | GMM_bg)`.
  - Enforçar sementes: scribbles FG/BG com penalidade infinita (capacidade muito alta).
- Termo de suavidade (n‑links):
  - Vizinhança 8‑conexa; `beta = 1/(2*avg(||I_p - I_q||^2))` sobre a imagem.
  - Capacidade `V(p,q) = lambda * exp(-beta * ||I_p - I_q||^2) / dist(p,q)`.
- Min‑cut/max‑flow:
  - Implementar Boykov‑Kolmogorov (BK) ou Push‑Relabel otimizado em TypedArrays (`Int32Array/Float32Array`).
  - Processar por blocos (tiles) com borda de sobreposição para 4K, mesclando cortes nas fronteiras (priorizar 8‑conexa, blend por consenso).
- Iteração e parada:
  - Loop: montar grafo → min‑cut → atualizar rótulos → re‑estimar GMM; parar por `ΔE < epsilon` ou `iter >= maxIters`.
  - Emitir progresso por estágio e iteração; suportar cancelamento imediato, retornando última máscara estável.

## Fase 2: Performance 4K
- Migrar morfologia (erode/dilate/opening/closing) e filtro bilateral para o mesmo Worker via `task` compartilhado.
- Estratégias de 4K/8K:
  - Tiling com sobreposição de `r = max(kernelRadius, sigmaSpace)`; reduzir picos de memória; reutilizar buffers e evitar alocações.
  - Transferir buffers ao invés de copiar (`postMessage({...}, [buffer])`); usar `SharedArrayBuffer` quando disponível (com fallback sem COOP/COEP).
  - Pré‑visualização em baixa resolução para UI; full‑res no export.
- Cancelamento e watchdog:
  - Flag de cancelamento checada entre tiles/iterações; watchdog de tempo por tile para manter responsividade.

## Fase 3: Validação e Ajuste
- Conjunto de 20 imagens: criar harness de benchmark (botão "Benchmark") que executa pipeline e registra métricas com `performance.now()`.
- Métricas: tempo total por resolução (HD/4K/8K), tempo por estágio (GMM, cut, morfologia, bilateral), pico de memória aproximado (tamanho de buffers), contagem de iterações.
- Tuning de valores padrão:
  - Bilateral: `sigmaSpace∈[2,8]`, `sigmaColor∈[10,40]`, intensidade nas bordas.
  - GraphCut: `k=5`, `lambda` ajustado por resolução, `beta` calculado por imagem, `maxIters∈[3,8]`.
- Documentação dos parâmetros recomendados no guia existente da pasta `public` e tooltips da UI.

## Fase 4: UI (Opcional)
- Barra de progresso e status por estágio; desabilitar controles durante processamento.
- Botão "Cancelar" com rollback seguro à última máscara válida.
- Painel de métricas (tempo por estágio, iterações) e logs para diagnóstico.

## Requisitos Técnicos
- ES6+; Worker thread‑safe com protocolo de mensagens bem definido.
- Otimização de memória: TypedArrays, reuso de buffers, tiling com sobreposição.
- Fallbacks: se GraphCut exceder orçamento de tempo/memória, usar classificador iterativo atual com morfologia+bilateral.

## Critérios de Aceite
- 4K: refinamento com GraphCut típico ≤ 3–5 s; cancelamento imediato; progresso visível.
- Qualidade: bordas limpas sem halos (com bilateral nas bordas), respeito aos scribbles.
- Benchmarks registrados para 20 imagens com valores padrão ajustados.

## Alterações de Código Planejadas
- `workers/grabcutWorker.ts`: adicionar tarefas "graphcut", "morph", "filter", BK/Push‑Relabel, EM GMM, mensageria de progresso/cancelamento.
- `utils/imageProcessor.ts`: unificar chamadas ao Worker com `taskId`; mover morfologia/bilateral quando 4K.
- `components/PreviewModal.tsx`: barra de progresso, botão cancelar, botão benchmark (opcional) e tooltips de parâmetros.
