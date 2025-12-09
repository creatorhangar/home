## Objetivo
- Eliminar travamentos e estados de carregamento indefinidos; oferecer feedback claro ≤ 5s; melhorar precisão da remoção em diferentes tipos de imagem; guiar o usuário por etapas intuitivas.

## Fase 1: Feedback e Responsividade
- Feedback imediato (≤ 5s): gerar prévia de baixa resolução (lado maior ≤ 1024px) primeiro; refino em alta resolução em segundo plano.
- Barra de progresso global e por imagem: indicadores de estágio (upload, análise, máscara, refino, composição) e botão Cancelar.
- Timeouts e fallback: se uma etapa ultrapassar limiar (por ex. 3s na prévia), cancelar/refazer com modo alternativo (floodfill simples) e manter UI responsiva.
- Fila de jobs em Worker: processar em lote com limite de concorrência (ex.: 2–3 imagens) para evitar bloqueios.

## Fase 2: Detecção Automática de Tipo de Imagem
- Pré‑classificação leve (sem ML pesado):
  - Fundo uniforme (baixa variância nas bordas) → Flood Fill/GrabCut com bbox amplo.
  - Green screen (UV concentrado na faixa de verde e alta similaridade) → Chroma Key.
  - Logos/textos (alta proporção de áreas planas + contornos duros, poucas cores) → Silhouette/threshold + closing.
  - Produtos/retratos (bordas complexas, textura variada) → GrabCut com bbox + refino.
- Heurísticas: variância nas bordas, histograma UV, entropia de textura, proporção de pixels saturados/planos.
- Sugestão de modo: UI mostra “Sugerido: GrabCut/Chroma/Silhouette” e permite trocar.

## Fase 3: Otimização do Algoritmo
- GrabCut robusto:
  - Bbox inicial automático: determinar região do sujeito por saliência simples (diferença vs. borda) ou clusterização K‑means (k=2) e expandir.
  - Termo de suavidade λ adaptativo: aumentar com resolução e ruído; beta calculado por imagem.
  - Morfologia/bilateral nas bordas somente (já implementado) ajustados por tipo.
- Chroma Key: distâncias UV com spill reduction proporcional, slider “similaridade/smoothness/spill” e prévia rápida.
- Silhouette: threshold adaptativo (Otsu) com closing para textos/logos; fallback para fundos claros.
- Multi‑resolução: pipeline coarse‑to‑fine (prévia 1024px → refino full) com reamostragem da máscara.

## Fase 4: Fluxo de Interface
- Etapas clarificadas na pré‑visualização:
  1) Definir área (bbox) ou aceitar sugestão
  2) Ajustar parâmetros por tipo (λ, tolerância, suavidade)
  3) Refino opcional (FG/BG)
  4) Aplicar e salvar
- Pós‑ação: depois de gerar prévia, destacar botão “Próximo passo” e indicações (ex.: “Melhorar bordas”, “Trocar modo”).
- Estados de carregamento: skeleton e spinner com progresso real; bloqueio de botões durante processamento e cancelar disponível.

## Fase 5: Tratamento por Formato
- JPEG/WEBP/PNG: normalizar para sRGB, respeitar alfa em PNG (preservar transparências já existentes), corrigir orientação EXIF.
- Detecção de metadados e tamanho: mensagens claras para imagens enormes; usar pipeline em tiles para 8K.
- Manter compatibilidade ES6+ e Workers; fallback quando Web Workers indisponíveis.

## Fase 6: Robustez e Sem Travamentos
- Cancelamento: token por tarefa; checagem entre tiles/iterações.
- Watchdog: interromper/refazer etapa que excede orçamento; mostrar motivo ao usuário.
- Limite de concorrência e backoff: evitar saturar CPU; fila com prioridade para a imagem ativa na UI.

## Fase 7: Métricas e Validação
- Instrumentação de tempos por estágio (já integrada): exibir no painel de Benchmark e console de debug.
- Critérios de sucesso:
  - Feedback inicial ≤ 5s (prévia 1024px)
  - 100% sem travamentos (cancelamento e watchdog ativos)
  - UI orientada por etapas com “Próximo passo” claro
  - Precisão ≥ 90%: validação manual com conjunto variado (retratos, produtos, logos, chroma); ajustar λ, thresholds e intensidades conforme tipo.

## Alterações de Código Planejadas
- `utils/imageProcessor.ts`: função `autoDetectMode(image)` com heurísticas; pipeline multi‑res com prévia rápida e refino; correção EXIF e sRGB; watchdog/timeout.
- `workers/grabcutWorker.ts`: confirmar cancelamento por tile/iteração; λ adaptativo por resolução; prévia coarse.
- `hooks/useImageProcessor.ts`: fila de jobs com limite de concorrência, estados e progresso por imagem.
- `components/ImageCard.tsx`: barra de progresso por cartão e estado claro (upload/análise/processando/refinando/concluído).
- `components/PreviewModal.tsx`: stepper com passos; mensagens contextuais; botões desativados durante processamento; botão “Próximo passo” e “Cancelar”.

## Entregáveis
- UX fluida com progresso real e cancelamento
- Detecção automática e sugestão de modo por tipo
- Prévia rápida + refino full sem travamentos
- Painel de Benchmark com tempos por estágio e resoluções
- Precisão melhorada por tipo com ajustes auto/adaptativos
