## Visão Geral

* Endereçar falhas em imagens simples (fundos brancos/pretos/azuis, gradientes), remoções excessivas e perda de limites.

* Intervir em três pontos do pipeline atual: detecção de modo, geração/refino de máscara e UX de ajustes.

* Alinhado às metas: 99% de acerto em fundos sólidos, -80% de excesso de remoção, +80% de preservação de detalhes, <5s por imagem simples.

## Fase 1: Correções de Detecção Básica

1. Fortalecer detecção de fundo sólido em `utils/imageProcessor.ts:1208` (autoDetectMode):

   * Amostrar bordas em LAB e aplicar K-Means (k=2) para cor dominante; decidir entre `floodfill` e `chroma` por ΔE.

   * Detectar gradiente nas bordas via regressão de L (R² alto → gradiente); evitar `floodfill` puro nesses casos.

   * Expandir heurística além de “claro e uniforme”: suportar pretos, azuis e baixos contrastes.
2. Validação de bordas antes de aplicar a remoção:

   * Novo helper `validateBackgroundUniformityLAB` que mede variância e consistência conectada nos quatro cantos.

   * Se uniformidade baixa ou conflito entre cantos, escolher `grabcut` diretamente.
3. Seeds multi-canto para `floodfill`:

   * Iniciar preenchimento a partir dos 4 cantos e arestas; unir componentes apenas do fundo.

   * Aplicar tolerância adaptativa derivada de ΔE das amostras das bordas.

## Fase 2: Aprimorar Ferramentas e Preview

1. Controles de tolerância, desfoque e refinamento com pré-visualização em tempo real:

   * Pipeline leve de preview: gerar máscara + composição mínima em um Canvas secundário (debounce 50–100ms).

   * Movimentar operações pesadas para Worker quando `width*height` > 1MP.

   * `hooks/useImageProcessor.ts`: adicionar estado de preview e rota rápida que reutiliza `removeBackgroundClientSide` até a etapa de máscara.
2. Múltiplas tentativas automáticas por card:

   * Gerar 3 presets: “Seguro” (tolerância baixa), “Balanceado” (auto), “Agressivo” (tolerância alta + refino extra).

   * Avaliar cada tentativa com métrica `borderAlphaMean` e selecionar a melhor por padrão, mantendo as outras para escolha do usuário.
3. UX de limites:

   * Ajustar ranges: `tolerância` 10–80, `desfoque de borda` 0–5, `ajuste fino` 0–1.

   * Impedir estados inválidos (p.ex. ajuste fino -1); defaults mais robustos para imagens simples.

## Fase 3: Casos Complexos e Preservação de Detalhes

1. Preservação de cabelos/bordas finas:

   * Refinar alpha com filtro bilateral conjunto já existente em `workers/grabcutWorker.ts:241` (sigmaSpace/sigmaColor), desativando `edgesOnly` nas regiões semitransparentes.

   * Adicionar passo “matte refiner” (Laplacian matting leve) a partir de tri-map do grabcut para bordas delicadas.
2. Textura e anti-remoção indevida:

   * Penalidade de vizinhança em `graphcut` usando variância local para “snap” de borda (modular lambda pelo contraste) em `workers/grabcutWorker.ts:147–191`.

   * Seeds automáticos de fundo a partir das bordas (se `auto`), além de bbox, em tarefas do worker.
3. Decontaminação de cor (halos):

   * Reusar passagens de “descontaminação” existentes em `utils/imageProcessor.ts:961` com parâmetros automáticos calibrados pela cor dominante do fundo.

## Fase 4: Testes Abrangentes e Métricas

1. Conjunto de testes:

   * Fundos sólidos: branco, preto, azul; objetos com baixo contraste.

   * Gradientes simples (vertical/horizontal), cabelos/bordas irregulares, texturas leves.
2. Métricas e instrumentação:

   * `onMetrics` no pipeline (já presente em `utils/imageProcessor.ts:689`) para durações, contagem de “remoção excessiva” (máscara com >95% alpha=0) e “subremoção” (<5%).

   * Métrica de “limite respeitado”: interseção da máscara com mapa de bordas (Sobel) não excede limiar.
3. Performance:

   * Gatilhos para Worker acima de 1MP; loops limitados para auto-tolerance (≤50ms por varredura, já usado em `applyChromaHSV` auto-tuning).

## Alterações Pontuais Planejadas

* `utils/imageProcessor.ts`

  * Atualizar `autoDetectMode` e adicionar `validateBackgroundUniformityLAB`, `estimateBorderGradient` e tolerância adaptativa.

  * Melhorar caminho `floodfill` para multi-seed e componente conectada do fundo.

  * Expandir “auto-tolerance” no `chroma` com avaliação de borda e fallback mais robusto.

* `workers/grabcutWorker.ts`

  * Ajustar `graphcut` com modulação de `lambda` por contraste local e seeds automáticos.

  * Refinar tarefa `filter` para preservar microdetalhes em alfa e desativar `edgesOnly` seletivamente.

* `hooks/useImageProcessor.ts`

  * Adicionar “preview mode” com debounce e múltiplas tentativas por card.

## Critérios de Qualidade (Validação)

* 99% acerto em fundos sólidos: medir por `borderAlphaMean` e inspeção visual dentro de pontos de cores na imagem de forma rápida.

* -80% remoção excessiva: monitorar taxa de máscaras que apagam >95% e aplicar fallback automático.

* +80% preservação de detalhes: avaliar contorno em mapa de bordas + teste de cabelos.

* <5s por imagem simples: instrumentar tempo total e empurrar heavy para Worker.

## Entregáveis

* Código atualizado nos arquivos citados, com métricas embutidas e preview em tempo real.

* Presets de tentativa automática por card, com seleção da melhor configuração.

* Relatório de testes com amostras representativas e tempos de processamento.

Confirma a execução deste plano? Após confirmação, implemento as mudanças e disponibilizo uma versão para você testar com suas imagens.
