## Visão Geral

* Implementar um preset “Fundo Sólido” com detecção automática de cor dominante em HSV, análise de uniformidade das bordas e chroma key dinâmico com refinamento.

* Integrar ao pipeline atual (`Canvas + Web Workers`) e adicionar uma via acelerada por GPU (WebGL) com fallback automático.

* Alvos: processamento total < 80ms em até 4K; latência do chroma < 50ms; artefatos visíveis < 1%; bordas suaves (2–5px).

## Pontos de Integração

* Core de máscara: `utils/imageProcessor.ts:265` (`removeBackgroundClientSide`) e ramo `selectedMode === 'chroma'` em `utils/imageProcessor.ts:335–356`.

* Auto-detecção atual: `utils/imageProcessor.ts:862` (`autoDetectMode`) – será estendida para HSV e uniformidade.

* Conversões existentes: `utils/imageProcessor.ts:112` (`rgbToUV`) – adicionar `rgbToHSV` e utilitários de histogramas.

* Detecção de cor de fundo: `utils/imageProcessor.ts:55` (`detectDominantBorderColor`) – manter como fallback, priorizar central HSV quando preset ativo.

* UI/controles: `components/PreviewModal.tsx:1088–1116` (seletor de modo e presets; sliders de tolerância/edge) – acrescentar novo preset, calibração e visualizações.

* Localização: `utils/localization.ts` (seção `previewModal`) – inserir chaves novas para preset/controles/indicadores.

## Implementação – Núcleo HSV

1. Conversão RGB→HSV

* Adicionar `rgbToHSV(r,g,b)` com `h∈[0,360)`, `s,v∈[0,1]` (exato e rápido).

1. Histograma Central (30%×30%)

* Função `computeHSVHistogram(imageData, rect, bins)`:

  * Bins: matiz 5° → 72 bins; saturação 5% → 20 bins; valor 5% → 20 bins.

  * Retornar matriz 72×20×20 e totais.

* Função `detectDominantCentralHSV(...)`:

  * Calcular moda 3D; confiança = `count_max / total`.

  * Condição de aceitação `confiança > 0.9`; caso contrário, manter o modo atual ou cair em `grabcut`.

1. Uniformidade nas Bordas

* Função `estimateBorderUniformityHSV(imageData)`:

  * Amostrar 4 pontos cardeais (linhas superior/inferior/esquerda/direita) com passo adaptativo; converter para HSV.

  * Calcular variância normalizada de H/S/V; escala agregada `u = 1 - clamp(VarAgg, 0, 1)`.

  * Threshold: `VarAgg < 0.05` considerado uniforme; exibir indicador 0–100%.

1. Chroma Key Dinâmico (HSV)

* Função `applyChromaHSV(imageData, keyColorHSV, tolerance)`:

  * Distância angular em H (com wrap) e métricas em S/V; compor uma métrica única e mapear para alfa 8 bits.

  * Parâmetros: tolerância inicial 35–45 (step 1), auto-ajuste por varredura e avaliação de qualidade (minimizar spill, preservar detalhes).

* Fallback de cor secundária: se `uniformidade` < threshold, selecionar segunda moda do histograma e reavaliar.

1. Refinamento

* Suavização gaussiana de borda na máscara: kernel 3×3 (`sigma≈0.5`) para “Leve”; kernel 5×5 para “Intenso”.

* Integração com morfologia/bilateral existentes quando adequado (já disponíveis em Worker).

## Aceleração por GPU (WebGL) com Fallback

1. Pipeline WebGL

* Fragment shader: conversão RGB→HSV, threshold por tolerância, escrita de alfa.

* Segundo pass: blur gaussiano (3×3 ou 5×5) sobre alfa.

* Uso de `OffscreenCanvas` quando disponível para análise em tempo real (30fps).

1. Fallback

* Se WebGL indisponível, usar `Web Worker` para HSV + threshold + blur em `TypedArray` e rehidratar `ImageData`.

* Reutilizar `workers/grabcutWorker.ts` estrutura de mensagens; se necessário, criar tarefa `task: 'chromaHSV'` paralela.

1. Seleção Dinâmica

* Detectar suporte a WebGL2; escolher GPU se presente, senão Worker.

* Medir latência e registrar métricas via `onMetrics` (já existente em `removeBackgroundClientSide`).

## Atualizações no Pipeline Existente

* Estender `selectedMode === 'chroma'` para aceitar chave HSV quando preset “Fundo Sólido” ativo.

* Inserir etapa “Detecção Central HSV” antes do keying, com fallback para `detectDominantBorderColor`.

* Incorporar `uniformity` ao `removalInfo` para UI e decisões de fallback.

* Ajustar `autoDetectMode` (`utils/imageProcessor.ts:862`) para considerar histograma central e bordas em HSV.

## UI – Novo Preset “Fundo Sólido”

1. Seletor de Preset

* Adicionar opção “Fundo Sólido” ao seletor em `components/PreviewModal.tsx:1092–1116`.

* Mapeamento: ativa `mode='chroma'`, força `colorSpace='HSV'`, tolerância default 40, sampling central 20% (ajustável).

1. Controles

* Slider “Tolerância” 25–55 (step 1) com default 40.

* Switch “Refinamento”: Leve (3×3) / Intenso (5×5).

* Slider/entrada “Amostragem Central”: 20% da imagem (com opção de seleção manual por retângulo).

* Toggle “Visualizar Máscara Alpha”.

* Indicador “Uniformidade” 0–100% com threshold visual em 95%.

* Histograma interativo (H/S/V) com bins especificados, atualizando em tempo real.

* Botão “Calibração Rápida” que roda análise contínua a 30fps usando GPU/Worker.

1. Eventos

* Ao trocar preset → recalcular detecção central e uniformidade; atualizar `localOptions` e preview.

* Calibração rápida: loop temporizado (≤ 33ms) com reprocessamento e atualização do histograma/indicador.

## Fluxo de Trabalho

1. Passo 1 – Seleção do preset

* Carregar configurações padrão e habilitar espaço HSV.

1. Passo 2 – Processamento (3 estágios)

* Detecção da cor dominante (timeout 50ms por imagem).

* Análise de uniformidade nas 4 bordas + centro.

* Cálculo dos parâmetros ótimos (tolerância e refinamento).

1. Passo 3 – Aplicação do chroma key

* Via GPU (alvo < 50ms) ou Worker; gerar máscara alpha 8 bits; aplicar pós-processamento.

1. Passo 4 – Controles manuais

* Ajuste fino de H/S/V; spill suppression; blend edge.

## Requisitos Técnicos

* Performance: usar `OffscreenCanvas` + WebGL; fallback para Worker; medir e registrar `duration` por estágio com `onMetrics`.

* Espaços de cor: manter processamento interno em sRGB; conversão precisa para HSV; compatibilidade com perfis ICC delegada ao navegador (decodificação), documentar suposição sRGB quando perfis não forem aplicados.

* Tolerâncias: robustez a variação de iluminação (±15% em `v`) e ruído (até 3dB SNR) via análise de variância e blur gaussiano.

* Qualidade: meta artefatos < 1% via avaliação de máscara (contagem de pixels semi-transparentes em regiões não-chaves) e suavização 2–5px.

## Telemetria e Verificação

* Benchmarks no modal: reutilizar acordeão de benchmark (`components/PreviewModal.tsx:1162–1174`).

* Adicionar métricas dos novos estágios e copiar resultados.

* Testes unitários leves para `rgbToHSV`, histogramas e uniformidade.

## Localização

* Inserir chaves em `utils/localization.ts` sob `previewModal` para:

  * `presetSolidBackground`, `quickCalibration`, `maskPreviewToggle`, `uniformity`, `uniformityThresholdHint`, `histogramTitle`, `samplingCentral`, `refinementLight`, `refinementStrong`.

* Substituir literais em `components/PreviewModal.tsx` por `t('...')` e replicar chaves mínimas nas línguas existentes.

## Entregáveis

* Funções novas no core HSV e integração no modo `chroma`.

* Pipeline GPU com fallback.

* UI completa do preset “Fundo Sólido”, incluindo calibração rápida, histograma e indicador de uniformidade.

* Métricas de desempenho e testes básicos.

## Critérios de Aceite

* Processamento total < 80ms em 1080p; < 150ms em 4K com GPU.

* Detecção de cor dominante com confiança ≥ 90% em fundos sólidos.

* Uniformidade ≥ 95% sinalizada quando fundo é homogêneo; fallback acionado caso contrário.

* Artefatos visíveis < 1%; bordas com gradiente 2–5px; preservação de detalhes finos.

