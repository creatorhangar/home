## Objetivo
Elevar a qualidade e a responsividade do recorte offline com dois aprimoramentos principais: Bilateral Filter aplicado às bordas da máscara e refinamento do GrabCut via GraphCut (min-cut/max-flow), com processamento pesado movido para Web Workers.

## Bilateral Filter nas Bordas
1. Conversão de cor: adicionar util para `RGB → CIE-Lab` (distância perceptual) em `utils/imageProcessor.ts`.
2. Banda de borda: detectar região de transição da máscara (pixels com alfa 1..254 ou `dilate(mask) - erode(mask)`); referência atual de pipeline: `utils/imageProcessor.ts:421–428` (Opening/Closing) e `utils/imageProcessor.ts:355–373` (Suavização/Levels).
3. Kernel e pesos: implementar filtro bilateral com kernel 5x5/7x7; pré-computar pesos espaciais (LUT) e calcular pesos de range em Lab; aplicar apenas na banda de borda.
4. Integração no pipeline: executar após Opening/Closing e antes de `edgeSoftness` (blur), mantendo sequência: máscara limpa → edge-preserving smoothing → blur leve.
5. Opções: adicionar `bilateralIntensity`, `bilateralSigmaSpace`, `bilateralSigmaColor`, `bilateralEdgesOnly` (padrão true). Expor sliders na Prévia.

## GrabCut + GraphCut (Min-Cut/Max-Flow)
1. Modelo de dados: usar GMM inicial já presente (versão simplificada por médias/variâncias) em `utils/imageProcessor.ts:267–335` para estimar termos de dados FG/BG.
2. Grafo de pixel: criar nó por pixel no bbox; t-links com capacidades do termo de dados; n-links 4-conectados com pesos baseados em contraste (ex.: `exp(-β*(ΔI)^2)`) e fator de vizinhança.
3. Restrições rígidas: scribbles FG/BG viram t-links de capacidade “infinita” (hard constraints) e pixels fora do bbox como BG.
4. Algoritmo: implementar `Dinic` ou `Boykov-Kolmogorov` em Worker para max-flow; saída é partição min-cut → atualiza `labels` → gera `mask`.
5. Iterações: loop 3–5 iterações alternando atualização GMM ↔ cut (como GrabCut clássico) dentro do Worker; reportar progresso.

## Web Workers e Estrutura
1. Workers: criar `workers/filterWorker.ts` (Bilateral) e `workers/grabcutWorker.ts` (GraphCut+GrabCut).
2. Mensagens: `postMessage` com `ImageData`/buffers transferíveis, bbox, scribbles, parâmetros; responder com `mask`/`ImageData` e progresso.
3. Responsividade: bloquear UI nunca; botão “Refinar” dispara Worker; mostrar spinner/progresso no modal. 
4. Memória: usar `Uint8Array/Uint32Array` sobre `ArrayBuffer` compartilhado; liberar buffers após uso.

## Integração de UI
1. Prévia (`components/PreviewModal.tsx`): 
   - Adicionar seção “Bilateral Filter” com sliders (intensidade/sigmas, edges-only). 
   - No modo GrabCut: botão “Refinar (GraphCut)” que dispara o Worker; indicador de progresso; limpar scribbles.
2. Aplicação global (`App.tsx`): preservar parâmetros no `localStorage` como já feito para outros sliders.

## Validação e Métricas
1. Testes funcionais: 
   - Fundo uniforme (chroma) e fundo complexo (grabcut) → bordas suaves sem halos. 
   - Banda de borda processada corretamente (só transição alterada).
2. Performance (1920x1080): 
   - Bilateral borda: < 1s; GrabCut+GraphCut: 2–4s em 5 iterações; UI responsiva.
3. Regressão: conjunto de 20 imagens; comparar antes/depois; manter ou melhorar métricas do guia.

## Cronograma
- Fase A (1–2 dias): Bilateral Filter + UI + validação. 
- Fase B (3–5 dias): Worker de GraphCut, integração com GrabCut, UI “Refinar”, validação e otimizações. 
- Fase C (1–2 dias): Polimento, testes de stress e documentação inline nos controles (tooltips).

## Riscos & Mitigações
- Uso de memória em 4K: processar apenas banda de borda; chunking por tiles no Worker. 
- Tempo de GraphCut: limitar bbox apertado; reduzir iterações se progresso estagnar; perfis com DevTools.

Confirma proceder com esta implementação e iniciar pela Fase A (Bilateral Filter)?