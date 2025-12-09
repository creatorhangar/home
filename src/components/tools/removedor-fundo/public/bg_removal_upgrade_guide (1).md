# 🎯 Diretriz Técnica: Upgrade de Algoritmos de Remoção de Fundo Offline

## 📋 CONTEXTO DO PROJETO

**Aplicação Atual:**
- Removedor de fundo em lote 100% client-side (Canvas API)
- Algoritmo base: Flood Fill com detecção de cor predominante nas bordas
- Modo alternativo: Silhueta (baseado em luminância)
- Storage: IndexedDB para persistência
- Stack: HTML5 Canvas, JavaScript puro, sem dependências externas de IA

**Objetivo da Atualização:**
Elevar a qualidade de remoção de fundo ao nível da concorrência profissional usando algoritmos clássicos validados pela indústria, mantendo processamento 100% offline e sem IA externa.

---

## 🔧 ALGORITMOS A IMPLEMENTAR (PRIORIDADE ORDENADA)

### **PRIORIDADE 1: GrabCut Algorithm**

**Por que implementar primeiro:**
- Padrão da indústria (usado pelo Microsoft Office)
- Melhor custo-benefício: grande melhoria com interação mínima do usuário
- Funciona bem em 80% dos casos reais

**Especificações Técnicas:**
- **Base matemática:** Markov Random Fields + Graph Cut iterativo
- **Modelagem de cor:** Gaussian Mixture Models (GMM) com 5 componentes para foreground/background
- **Input do usuário:** Retângulo ao redor do objeto (bounding box)
- **Iterações:** 5-10 iterações para convergência
- **Saída:** Máscara binária com 4 estados possíveis por pixel:
  - `GC_BGD` (0): definitivamente background
  - `GC_FGD` (1): definitivamente foreground  
  - `GC_PR_BGD` (2): provavelmente background
  - `GC_PR_FGD` (3): provavelmente foreground

**Dados Técnicos da Pesquisa:**
- Usa GMM para modelar distribuições de cores, melhorando iterativamente
- Após corte inicial, permite refinamento com pincéis de foreground/background
- Requer mínima interação: apenas desenhar retângulo inicial

**Interface Necessária:**
1. Ferramenta "Seleção Inteligente" - usuário arrasta retângulo ao redor do objeto
2. Após processamento inicial, mostrar opções:
   - Pincel "Manter" (verde) - marca áreas definitivamente foreground
   - Pincel "Remover" (vermelho) - marca áreas definitivamente background
3. Botão "Refinar" - executa nova iteração do GrabCut com as marcações

**Performance Esperada:**
- Imagem 1920x1080: ~2-4 segundos para processamento inicial
- Refinamento: ~1-2 segundos por iteração

---

### **PRIORIDADE 2: Chroma Key Avançado (YUV Color Space)**

**Por que implementar:**
- Essencial para imagens com fundo uniforme (green screen, studio photos)
- Resultado perfeito quando aplicável
- Performance excelente (tempo real)

**Especificações Técnicas:**
- **Espaço de cor:** Converter RGB → YUV para cálculo de distância cromática
- **Fórmula de conversão:**
  ```
  U = R * -0.169 + G * -0.331 + B * 0.5 + 0.5
  V = R * 0.5 + G * -0.419 + B * -0.081 + 0.5
  ```
- **Cálculo de distância:** Distância euclidiana no espaço UV (ignorando luminância Y)
- **Transparência proporcional:** `alpha = 255 * (1 - (distance² / tolerance²))`

**Parâmetros Ajustáveis:**
1. **Key Color** (cor-alvo): Selecionada com eyedropper pelo usuário
2. **Similarity** (0-100): Limiar de distância para transparência total
3. **Smoothness** (0-100): Quão gradual é a transição de opacidade
4. **Spill Suppression** (0-100): Dessaturação para remover reflexo da cor-chave no objeto

**Dados Técnicos da Pesquisa:**
- Algoritmo usado pelo OBS Studio para green screen profissional
- Transformação RGB-para-YUV mede distância cromática ignorando luminância
- Criar transparência proporcional (gradiente) ao invés de binário produz bordas muito mais suaves

**Interface Necessária:**
1. Modo "Chroma Key" no seletor de algoritmo
2. Eyedropper tool - usuário clica no fundo para selecionar cor
3. Sliders em tempo real:
   - Similarity (padrão: 40)
   - Smoothness (padrão: 20)  
   - Spill Reduction (padrão: 10)
4. Preview em tempo real enquanto ajusta

---

### **PRIORIDADE 3: Refinamento de Bordas com Bilateral Filter**

**Por que implementar:**
- Suaviza bordas preservando detalhes importantes
- Remove "halos" de cor residual do fundo
- Melhora dramaticamente a qualidade visual final

**Especificações Técnicas:**
- **Tipo:** Filtro não-linear edge-preserving
- **Dois pesos combinados:**
  1. **Peso espacial:** `exp(-distance² / (2 * sigma_space²))`
  2. **Peso de range:** `exp(-color_diff² / (2 * sigma_color²))`
- **Peso final:** `weight = spatial_weight * range_weight`
- **Kernel size:** 5x5 ou 7x7 pixels
- **Sigma recomendados:**
  - sigma_space: 3-5 pixels
  - sigma_color: 20-40 (0-255 scale)

**Dados Técnicos da Pesquisa:**
- Combina peso espacial (penaliza pixels distantes) e peso de range (penaliza pixels com cores diferentes)
- Funciona especialmente bem em espaço CIE-Lab onde distâncias correlacionam com percepção humana
- Pode ser iterado múltiplas vezes para resultados quase constantes por partes

**Onde Aplicar:**
- Após gerar máscara alfa inicial (de qualquer algoritmo)
- Aplicar apenas na região de borda (2-5 pixels para dentro/fora da transição)
- Não aplicar em áreas totalmente opacas ou transparentes (performance)

**Performance:**
- Implementar versão otimizada com lookup tables para exponenciais
- Processar apenas região de borda (~10-20% dos pixels totais)

---

### **PRIORIDADE 4: Operações Morfológicas (Opening/Closing)**

**Por que implementar:**
- Remove ruído e pequenos artefatos da máscara
- Fecha buracos indesejados no objeto principal
- Preprocessing essencial antes de refinamentos mais pesados

**Especificações Técnicas:**

**Erosão** (encolhe objeto, remove pixels das bordas):
```
Para cada pixel:
  valor_final = mínimo(valores dos 8 vizinhos + centro)
```

**Dilatação** (expande objeto, adiciona pixels nas bordas):
```
Para cada pixel:
  valor_final = máximo(valores dos 8 vizinhos + centro)
```

**Operações Compostas:**
- **Opening = Erosão → Dilatação**
  - Remove objetos pequenos e ruído
  - Mantém tamanho aproximado do objeto principal
  
- **Closing = Dilatação → Erosão**
  - Fecha buracos pequenos
  - Suaviza contornos irregulares

**Dados Técnicos da Pesquisa:**
- Pode ser implementado diretamente em JavaScript ou via SVG filters (feMorphology)
- Opening remove objetos pequenos e ruído; Closing fecha buracos no objeto principal
- Estruturante recomendado: kernel 3x3 ou 5x5 (cross ou square)

**Quando Aplicar:**
1. **Após detecção inicial:** Opening para limpar ruído
2. **Antes de refinamento:** Closing para fechar pequenos buracos
3. **Parâmetro ajustável:** Número de iterações (1-3 típico)

---

### **PRIORIDADE 5: Closed-Form Matting (Opcional - Casos Avançados)**

**Por que implementar (opcional):**
- Qualidade profissional em bordas complexas (cabelo, pelo, fumaça)
- Necessário apenas para 10-15% dos casos mais difíceis
- Computacionalmente mais pesado

**Especificações Técnicas:**
- **Input:** Trimap com 3 regiões (definitivamente FG, definitivamente BG, desconhecido)
- **Modelo:** Color-line model - assume que em janelas pequenas (3x3), cores estão distribuídas em linha no espaço RGB
- **Solver:** Sistema linear esparso Ax = b onde x é o vetor alfa
- **Otimização:** Usar esquema coarse-to-fine para imagens grandes

**Dados Técnicos da Pesquisa:**
- Resolve matting como sistema linear esparso, assumindo que cores de FG/BG variam suavemente localmente
- Aceita três tipos de entrada: scribbles (rabiscos do usuário), trimap, ou prior com confiança
- Usa "color-line model" - em pequenas janelas, cores distribuem-se em linha no espaço RGB
- Performance: 200x300px em 20s com solver direto, mas pode usar coarse-to-fine para imagens grandes

**Performance:**
- Implementar apenas se usuário marcar "Modo Profissional"
- Usar Web Workers para não bloquear UI
- Tempo estimado: 10-30 segundos para imagem 1920x1080

**Interface Necessária:**
1. Checkbox "Refinamento Profissional" (hidden por padrão)
2. Três pincéis:
   - Verde: "Definitivamente Objeto"
   - Vermelho: "Definitivamente Fundo"
   - Azul: "Área Desconhecida" (opcional - preenche automaticamente entre verde/vermelho)
3. Warning: "Este modo é mais lento mas produz melhor qualidade em detalhes complexos"

---

## 🎨 MELHORIAS DE INTERFACE (CRÍTICAS)

### **Problema Identificado:**
Ferramentas e controles estão visualmente desconectados, causando confusão ao usuário.

### **Solução: Interface Contextual**

**Regra Principal:**
**Controles devem aparecer/desaparecer baseado na ferramenta ativa.**

**Implementação:**

1. **Seletor de Modo de Remoção** (sempre visível no topo):
   - [ ] Modo Automático (Flood Fill atual)
   - [ ] Modo Inteligente (GrabCut)
   - [ ] Modo Chroma Key
   - [ ] Modo Silhueta (atual)

2. **Painel Contextual Dinâmico:**

**Quando "Modo Automático" ativo:**
```
└─ Ajustes de Remoção
   ├─ Tolerância (slider)
   ├─ Desfoque de Borda (slider)
   └─ Modo: [Borda | Centro]
```

**Quando "Modo Inteligente (GrabCut)" ativo:**
```
└─ Ferramenta de Seleção
   ├─ [Desenhar Retângulo ao redor do objeto]
   └─ Botão: "Processar"
   
└─ Ferramentas de Refinamento (após processamento)
   ├─ Pincel Manter (verde) - tamanho ajustável
   ├─ Pincel Remover (vermelho) - tamanho ajustável  
   └─ Botão: "Refinar" (executa nova iteração)
```

**Quando "Modo Chroma Key" ativo:**
```
└─ Seleção de Cor
   ├─ [Eyedropper] - Clique no fundo
   ├─ Preview da cor selecionada
   
└─ Ajustes Finos
   ├─ Similarity: [slider 0-100] (padrão: 40)
   ├─ Smoothness: [slider 0-100] (padrão: 20)
   └─ Spill Reduction: [slider 0-100] (padrão: 10)
```

3. **Ferramentas Pós-Processamento** (sempre disponíveis após remoção inicial):
```
└─ Refinar Bordas
   ├─ Bilateral Filter
   │  ├─ Intensidade: [slider 0-100]
   │  └─ Aplicar apenas em bordas ☑
   │
   └─ Limpeza de Máscara
      ├─ Remover ruído (Opening): [0-3 iterações]
      └─ Fechar buracos (Closing): [0-3 iterações]
```

4. **Painel de Ajustes Globais** (accordion, collapsed por padrão):
```
└─ Ajustes de Imagem
   ├─ Brilho
   ├─ Contraste
   └─ Saturação

└─ Efeitos Criativos
   ├─ Efeito Adesivo
   ├─ Sombra
   └─ Contorno
```

---

## 🚀 OTIMIZAÇÕES DE PERFORMANCE

### **Dados da Pesquisa - Implementar:**

1. **Usar Uint32Array ao invés de Uint8ClampedArray:**
   ```javascript
   // LENTO (acessa 4 vezes)
   const data = imageData.data; // Uint8ClampedArray
   const r = data[i];
   const g = data[i+1];
   const b = data[i+2];
   const a = data[i+3];
   
   // RÁPIDO (acessa 1 vez, processa 4x mais rápido)
   const buf32 = new Uint32Array(imageData.data.buffer);
   const pixel = buf32[i];
   const r = pixel & 0xff;
   const g = (pixel >> 8) & 0xff;
   const b = (pixel >> 16) & 0xff;
   const a = (pixel >> 24) & 0xff;
   ```

2. **Web Workers para Processamento Pesado:**
   - GrabCut iterations
   - Bilateral filter
   - Closed-form matting
   - Operações morfológicas em imagens grandes (>2MP)

3. **Separable Filters:**
   - Gaussian blur: aplicar horizontal depois vertical (N² → 2N operations)
   - Bilateral filter: considerar aproximação separável para performance

4. **Canvas em Múltiplas Resoluções:**
   - Preview em tempo real: processar em 50% resolução
   - Ajustes de slider: processar em 25% resolução
   - Processamento final: resolução completa

5. **WebGL para Filtros (Opcional):**
   - Se precisar tempo real (>30fps), migrar filtros para shaders
   - Biblioteca recomendada: glfx.js (sem dependências)

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### **FASE 1: Fundação (Semana 1)**
- [ ] Refatorar arquitetura para suportar múltiplos algoritmos
- [ ] Criar classe abstrata `BackgroundRemovalAlgorithm` com interface:
  - [ ] `process(imageData, params)` → Promise<ImageData>
  - [ ] `getRequiredUI()` → UI components definition
  - [ ] `getDefaultParams()` → default parameters
- [ ] Implementar sistema de Web Workers para processamento pesado
- [ ] Criar utility: conversão RGB ↔ YUV
- [ ] Criar utility: operações morfológicas básicas (erode, dilate)
- [ ] Otimizar processamento de pixels: migrar para Uint32Array

### **FASE 2: Algoritmo GrabCut (Semana 2-3)**
- [ ] Implementar GMM (Gaussian Mixture Model) com 5 componentes
- [ ] Implementar Graph Cut (min-cut/max-flow algorithm)
- [ ] Criar ferramenta de seleção por retângulo na UI
- [ ] Implementar loop iterativo (5-10 iterações)
- [ ] Criar ferramentas de refinamento:
  - [ ] Pincel "Manter" (marca FG)
  - [ ] Pincel "Remover" (marca BG)
  - [ ] Tamanho de pincel ajustável
- [ ] Adicionar preview em tempo real durante ajustes
- [ ] Testes com imagens variadas:
  - [ ] Objeto com fundo uniforme
  - [ ] Objeto com fundo complexo
  - [ ] Pessoa com cabelo detalhado
  - [ ] Objeto transparente/translúcido

### **FASE 3: Chroma Key Avançado (Semana 4)**
- [ ] Implementar conversão RGB → YUV otimizada
- [ ] Implementar cálculo de distância cromática no espaço UV
- [ ] Criar eyedropper tool para seleção de cor
- [ ] Implementar transparência proporcional (gradiente suave)
- [ ] Criar sliders em tempo real:
  - [ ] Similarity (com preview instantâneo)
  - [ ] Smoothness
  - [ ] Spill Reduction
- [ ] Otimizar para 60fps em preview (processar a 50% resolução)
- [ ] Testes com cenários:
  - [ ] Green screen clássico
  - [ ] Blue screen
  - [ ] Fundo branco/cinza uniforme
  - [ ] Fundo com gradiente suave

### **FASE 4: Refinamento de Bordas (Semana 5)**
- [ ] Implementar Bilateral Filter:
  - [ ] Cálculo de pesos espaciais (lookup table para exp)
  - [ ] Cálculo de pesos de range
  - [ ] Versão otimizada: processar apenas bordas
- [ ] Implementar detecção de região de borda (2-5 pixels de transição)
- [ ] Adicionar slider "Intensidade de Suavização" (controla sigma_color)
- [ ] Checkbox "Aplicar apenas em bordas" (padrão: ON)
- [ ] Implementar Opening/Closing morfológico:
  - [ ] Slider para iterações de Opening (remover ruído)
  - [ ] Slider para iterações de Closing (fechar buracos)
- [ ] Preview antes/depois com divisor deslizante
- [ ] Testes de performance:
  - [ ] 1920x1080: < 1s para bilateral em bordas
  - [ ] 4K: < 3s para bilateral em bordas

### **FASE 5: Interface Contextual (Semana 6)**
- [ ] Criar componente `ContextualToolbar` que recebe:
  - [ ] `activeMode` (string)
  - [ ] `onModeChange` (callback)
- [ ] Implementar lógica de show/hide baseado em modo ativo:
  - [ ] Mostrar apenas controles relevantes
  - [ ] Transições suaves (fade in/out)
- [ ] Reorganizar painéis accordion:
  - [ ] "Modo de Remoção" (sempre visível)
  - [ ] Painéis contextuais dinâmicos
  - [ ] "Ajustes Globais" (collapsed por padrão)
- [ ] Adicionar tooltips explicativos em cada ferramenta
- [ ] Implementar sistema de "dicas contextuais":
  - [ ] "Dica: Desenhe um retângulo apertado ao redor do objeto"
  - [ ] "Dica: Clique no fundo uniforme com o eyedropper"
- [ ] Adicionar atalhos de teclado:
  - [ ] 1-4: Selecionar modo
  - [ ] B: Pincel
  - [ ] E: Borracha
  - [ ] [ / ]: Aumentar/diminuir pincel

### **FASE 6: Processamento em Lote (Semana 7)**
- [ ] Adicionar opção "Aplicar Mesmo Modo a Todas"
- [ ] Salvar parâmetros usados na primeira imagem
- [ ] Queue system para processar imagens sequencialmente
- [ ] Progress bar global com estimativa de tempo
- [ ] Permitir cancelar processamento em lote
- [ ] Opção "Pular imagens com erro"
- [ ] Relatório final:
  - [ ] X de Y processadas com sucesso
  - [ ] Tempo total
  - [ ] Tempo médio por imagem

### **FASE 7: Polimento & Testes (Semana 8)**
- [ ] Adicionar sistema de presets:
  - [ ] "Retrato Profissional"
  - [ ] "Produto E-commerce"
  - [ ] "Green Screen"
  - [ ] "Logotipo/Texto"
- [ ] Implementar histórico de ações (Undo/Redo):
  - [ ] Máximo 10 estados
  - [ ] Ctrl+Z / Ctrl+Y
- [ ] Otimizar uso de memória:
  - [ ] Limpar canvases temporários
  - [ ] Liberar ImageData após processamento
- [ ] Testes de stress:
  - [ ] 50 imagens de 5MB cada
  - [ ] Imagem 8K (7680x4320)
  - [ ] 100 operações de undo/redo
- [ ] Testes cross-browser:
  - [ ] Chrome/Edge (WebKit)
  - [ ] Firefox (Gecko)
  - [ ] Safari (WebKit mobile)
- [ ] Documentação de uso:
  - [ ] Tutorial interativo first-run
  - [ ] Vídeo demo de cada modo
  - [ ] FAQ com casos de uso

### **FASE 8: Closed-Form Matting (Opcional - Semana 9-10)**
⚠️ **Implementar apenas se houver demanda real por qualidade profissional**

- [ ] Implementar color-line model para janelas 3x3
- [ ] Implementar sparse linear solver:
  - [ ] Considerar biblioteca: numeric.js ou glMatrix
  - [ ] Ou implementar Conjugate Gradient simplificado
- [ ] Implementar esquema coarse-to-fine:
  - [ ] Processar em 25% → 50% → 100% resolução
- [ ] Criar UI para trimap:
  - [ ] Pincel "Definitivamente Objeto" (verde)
  - [ ] Pincel "Definitivamente Fundo" (vermelho)
  - [ ] Auto-gerar região "Desconhecida" (azul)
- [ ] Mover processamento para Web Worker dedicado
- [ ] Warning de tempo estimado antes de processar
- [ ] Permitir cancelamento durante processamento
- [ ] Testes limitados a casos críticos:
  - [ ] Cabelo detalhado contra fundo complexo
  - [ ] Objeto semitransparente (vidro, fumaça)
  - [ ] Pelo de animais

---

## 📊 MÉTRICAS DE SUCESSO

### **Performance:**
- [ ] Tempo de processamento GrabCut (1920x1080): < 4s
- [ ] Tempo de processamento Chroma Key (1920x1080): < 500ms
- [ ] Preview em tempo real de sliders: 60fps (30fps mínimo)
- [ ] Uso de memória para 50 imagens: < 2GB RAM

### **Qualidade:**
- [ ] Teste A/B vs concorrência (remove.bg, Adobe, Canva):
  - [ ] Bordas suaves em 90% dos casos
  - [ ] Preservação de detalhes finos (cabelo): 85% dos casos
  - [ ] Sem halos residuais: 95% dos casos
- [ ] Taxa de sucesso em remoção automática: > 75%
- [ ] Taxa de sucesso com refinamento manual: > 95%

### **UX:**
- [ ] Usuário consegue processar primeira imagem sem tutorial: > 80%
- [ ] Tempo médio para dominar interface: < 5 minutos
- [ ] Taxa de abandono na primeira imagem: < 10%
- [ ] Net Promoter Score (NPS): > 50

---

## 🔍 DEBUGGING & VALIDAÇÃO

### **Para cada algoritmo implementado:**

1. **Teste de Unidade:**
   - [ ] Input de cor sólida → output esperado
   - [ ] Input de gradiente linear → transição suave
   - [ ] Input de imagem real → validação visual

2. **Teste de Performance:**
   - [ ] Profiling com Chrome DevTools
   - [ ] Identificar bottlenecks (> 100ms)
   - [ ] Otimizar até atingir target

3. **Teste de Qualidade Visual:**
   - [ ] Capturar screenshots antes/depois
   - [ ] Comparar com concorrência lado-a-lado
   - [ ] Ajustar parâmetros padrão se necessário

4. **Teste de Regressão:**
   - [ ] Conjunto de 20 imagens de referência
   - [ ] Processar após cada mudança
   - [ ] Garantir que qualidade não degradou

---

## 📚 REFERÊNCIAS TÉCNICAS

### **Algoritmos (papers originais):**
- GrabCut: "GrabCut — Interactive Foreground Extraction using Iterated Graph Cuts" (Rother et al., 2004)
- Closed-Form Matting: "A Closed Form Solution to Natural Image Matting" (Levin et al., 2006)
- Bilateral Filter: "Bilateral Filtering for Gray and Color Images" (Tomasi & Manduchi, 1998)

### **Implementações de Referência:**
- OpenCV GrabCut: `cv::grabCut()` [C++]
- OBS Studio Chroma Key: `chroma_key_filter.c` [C]
- ImageMagick Morphology: `morphology.c` [C]

### **Bibliotecas JavaScript Relevantes:**
- glfx.js - WebGL filters (se precisar tempo real)
- numeric.js - Linear algebra (para closed-form matting)
- tracking.js - Computer vision primitives

---

## ⚠️ NOTAS IMPORTANTES

1. **Não sacrificar performance pela perfeição:**
   - GrabCut com 5 iterações já produz resultado excelente
   - Bilateral filter apenas em bordas (não imagem inteira)
   - Closed-form matting é opcional - maioria dos usuários não precisa

2. **Priorizar UX sobre features:**
   - Interface simples > 20 opções confusas
   - Preview instantâneo > qualidade marginalmente melhor
   - Modo automático bom > modo manual perfeito mas complexo

3. **Manter compatibilidade:**
   - Salvar versão do algoritmo usado em cada imagem
   - Permitir reprocessar com algoritmo diferente
   - Exportar metadata (algoritmo, parâmetros) opcional

4. **Documentar limitações:**
   - Algoritmos clássicos não são mágicos
   - Alguns casos sempre precisarão refinamento manual
   - Ser transparente com o usuário sobre quando IA seria melhor

---

## 🎓 GLOSSÁRIO TÉCNICO

**Trimap:** Mapa de três regiões (foreground, background, unknown) usado como input para algoritmos de matting.

**Alpha Matting:** Processo de extrair valores de transparência precisos (canal alfa) para cada pixel, especialmente em regiões de borda.

**GMM (Gaussian Mixture Model):** Modelo estatístico que representa uma distribuição de cores como soma de múltiplas distribuições gaussianas.

**Graph Cut:** Algoritmo que resolve problema de segmentação como um problema de min-cut em um grafo, onde pixels são nós e arestas representam similaridade.

**Chroma Key:** Técnica que remove pixels baseado em sua cor (chroma), independente de luminância.

**YUV Color Space:** Espaço de cor que separa luminância (Y) de crominância (U, V), permitindo remoção de fundo baseada apenas em cor.

**Bilateral Filter:** Filtro que suaviza preservando bordas, combinando proximidade espacial e similaridade de cor.

**Morphological Operations:** Operações baseadas em teoria de conjuntos que modificam forma de objetos (erosão, dilatação, opening, closing).

**Separable Filter:** Filtro 2D que pode ser decomposto em dois filtros 1D aplicados sequencialmente, economizando processamento.

**Coarse-to-fine:** Estratégia de processar imagem em múltiplas resoluções, começando com baixa resolução e refinando progressivamente.

---

## 🚀 PRÓXIMOS PASSOS IMEDIATOS

1. **Ler toda esta diretriz com sua IDE IA**
2. **Começar pela FASE 1: Fundação** - refatorar para arquitetura extensível
3. **Implementar FASE 2: GrabCut** - maior impacto na qualidade
4. **Implementar FASE 3: Chroma Key** - maior impacto em casos específicos
5. **Implementar FASE 4: Refinamento** - polish final da qualidade
6. **Implementar FASE 5: Interface** - polish final da UX
7. **Avaliar necessidade de FASE 8** - apenas se usuários pedirem

**Tempo estimado total: 6-8 semanas de desenvolvimento**