Sim, é totalmente possível fazer conversão RGB → CMYK client-side! Aqui como funciona:
Como Implementar RGB → CMYK
1. Conversão Matemática Pura (Canvas API)
javascript// Fórmula padrão de conversão
function rgbToCmyk(r, g, b) {
  // Normalizar RGB (0-255 → 0-1)
  r = r / 255;
  g = g / 255;
  b = b / 255;
  
  // Calcular K (preto)
  const k = 1 - Math.max(r, g, b);
  
  // Calcular CMY
  const c = (1 - r - k) / (1 - k) || 0;
  const m = (1 - g - k) / (1 - k) || 0;
  const y = (1 - b - k) / (1 - k) || 0;
  
  return { c, m, y, k }; // valores 0-1
}
```

### 2. **Onde Inserir no Seu App**

**Novo painel**: `ColorModeConverter.tsx`
- Toggle: "Converter para CMYK"
- Preview mostra separação de canais (4 imagens: C, M, Y, K)
- Export gera 4 arquivos separados OU 1 arquivo TIFF multi-layer
- Útil para: gráficas, serigrafia, impressão offset

### 3. **Features Práticas para Impressão**

**Simulação de Impressão:**
- Preview de como ficará impresso (cores CMYK são diferentes de RGB)
- Aviso de cores "fora do gamut" (cores RGB que não existem em CMYK)
- Ajuste automático para gamut CMYK

**Bleeding/Sangria:**
- Adicionar área de sangria (3-5mm) automaticamente
- Útil para impressão de camisetas, banners, cartões
- Preview com marcas de corte

**Crop Marks (Marcas de Registro):**
- Adicionar marcas de corte para gráfica
- Marcas de registro CMYK (bolinha colorida nos cantos)
- Export pronto para impressão profissional

**Color Profile:**
- Aplicar perfil de cor específico (Coated, Uncoated, Newspaper)
- Simular papel branco vs off-white
- Preview com diferentes perfis lado a lado

### 4. **Formato de Export**

**Opção 1 - Separação de Canais:**
- `imagem-cyan.png`
- `imagem-magenta.png`
- `imagem-yellow.png`
- `imagem-black.png`
- Serigrafia usa isso (1 tela por cor)

**Opção 2 - TIFF CMYK:**
- 1 arquivo só com 4 canais
- Padrão para gráficas
- Você consegue gerar via Canvas convertendo pixel por pixel

**Opção 3 - PDF com CMYK:**
- PDF com color space CMYK
- Aceito por qualquer gráfica profissional

### 5. **Interface Sugerida**
```
[Toggle] Modo de Impressão Profissional

├── Conversão de Cor
│   ├── [ ] RGB → CMYK
│   ├── [ ] Ajustar para gamut CMYK
│   └── [ ] Preview separação de canais
│
├── Área de Sangria
│   ├── Tamanho: [3mm] ▼ (3mm, 5mm, 10mm)
│   └── [ ] Adicionar marcas de corte
│
├── Perfil de Cor
│   └── [Coated FOGRA39] ▼
│       - Coated (papel brilhante)
│       - Uncoated (papel fosco)
│       - Newspaper (jornal)
│
└── Export
    ├── ( ) Canais separados (PNG x4)
    ├── ( ) TIFF CMYK
    └── ( ) PDF/X-4 (padrão gráfica)
6. Casos de Uso Reais
Impressão de Camisetas (Serigrafia):

Converter → CMYK
Simplificar cores (posterize para 4-6 cores max)
Export canais separados
Cada arquivo = 1 tela de silk screen

Impressão Offset (Gráfica):

CMYK + sangria 3mm
Marcas de registro
Export como PDF/X ou TIFF

Sublimação:

Manter RGB mas ajustar saturação
Export em alta qualidade (300 DPI mínimo)
Espelhar imagem horizontalmente (vai ser transferida)

DTF (Direct to Film):

Fundo transparente (PNG)
Contorno branco automático (underbase)
Export invertido se necessário

7. Limitações Client-Side
❌ Não dá pra fazer:

Color matching 100% preciso (precisa de ICC profiles complexos)
Pantone/spot colors (são proprietários)

✅ Dá pra fazer bem:

Conversão RGB → CMYK padrão (90% dos casos)
Preview de separação
Export de canais
Simulação básica de impressão

# DIRETRIZ: FEATURES E USABILIDADE CLIENT-SIDE
## Foco em Ferramentas Práticas - 100% Offline

---

## 🎯 FUNCIONALIDADES ATUAIS (O QUE TEM)

- Upload múltiplo (drag/drop, paste, file picker)
- Conversão HEIC → JPEG automática
- Seleção em lote
- Rename em lote simples (padrão + número)
- Conversão formato: JPEG, PNG, WebP, AVIF, TIFF, PDF
- Compressão com qualidade ajustável
- Redimensionamento (%, pixels, contain/cover/fill/smart-fill)
- Rotação (90°, 180°, 270°)
- Marca d'água (texto/imagem, posição, tile)
- Preview ao vivo de 1 imagem
- Comparação antes/depois
- Download individual/ZIP/PDF
- Presets salvos (save/load/delete)
- Multi-idioma
- Dark mode

---

## 🔨 FERRAMENTAS NOVAS (O QUE FALTA)

### EDIÇÃO DE IMAGEM

#### Crop/Corte em Lote
- Definir área de corte manualmente (x, y, width, height)
- Aspect ratios prontos: 1:1, 4:3, 16:9, 9:16, livre
- Presets de rede social: Instagram Post/Story, Facebook, Twitter Header
- Posicionamento: center, top, bottom, left, right, custom
- Aplicar mesmo crop em todas selecionadas

#### Filtros de Cor (Canvas API)
- Brightness: -100 a +100
- Contrast: -100 a +100  
- Saturation: 0 a 200
- Hue rotation: 0 a 360
- Vibrance: ajuste seletivo de saturação
- Temperature: warm/cool
- Tint: green/magenta shift

#### Ajustes de Nitidez
- Sharpen: 0 a 100 (unsharp mask)
- Blur: 0 a 20px (gaussian)
- Noise reduction: 0 a 100

#### Efeitos Artísticos
- Grayscale (B&W)
- Sepia
- Invert colors
- Posterize (redução de cores)
- Vignette (escurecer bordas)
- Border/frame customizável

#### Correção de Perspectiva
- Endireitar horizontes
- Corrigir distorção de lente
- Ajuste de perspectiva 4-point

### COMPOSIÇÃO E LAYOUT

#### Canvas/Background Customizável
- Adicionar canvas ao redor da imagem
- Cor de fundo sólida/gradiente
- Padding configurável (top, right, bottom, left)
- Útil para posts padronizados de rede social

#### Overlay de Elementos
- Adicionar texto customizável (múltiplos layers)
- Formas básicas: retângulo, círculo, linha
- Ícones/stickers (biblioteca local)
- Posicionamento livre ou grid snap

#### Collage/Grid Layout
- Combinar múltiplas imagens em 1
- Layouts: 2x1, 2x2, 3x3, livre
- Espaçamento entre imagens
- Background do grid

### OTIMIZAÇÃO

#### Compressão Inteligente
- Análise de complexidade da imagem
- Sugestão automática de qualidade ideal
- Comparação visual de diferentes níveis
- Batch com qualidade variável (por tamanho ou conteúdo)

#### Redimensionamento Inteligente
- Content-aware resize (seam carving)
- Upscale com algoritmos melhores (bicubic, lanczos)
- Downscale com anti-aliasing
- Manter aspect ratio vs forçar dimensões

#### Otimização de Metadados
- Remover todos EXIF (reduz tamanho)
- Preservar apenas essenciais (copyright, autor)
- Adicionar metadados customizados em lote
- Editor de EXIF completo

### ANÁLISE E INFORMAÇÃO

#### Histogram
- RGB histogram de cada imagem
- Detector de clipping (sombras/highlights)
- Análise de exposure
- Comparação antes/depois via histogram

#### Info Detalhada
- Dimensões, formato, tamanho
- Color space, bit depth
- EXIF completo (câmera, ISO, exposição, GPS)
- Color palette dominante (5-10 cores principais)

#### Validação de Qualidade
- Detector de blur (imagem tremida)
- Detector de over/under exposure
- Checagem de resolução mínima
- Alertas de qualidade antes de exportar

### ORGANIZAÇÃO

#### Tags e Categorias
- Sistema de tags local (localStorage)
- Filtrar por tags
- Busca por nome de arquivo
- Ordenação: nome, data, tamanho, dimensões

#### Coleções/Projetos
- Agrupar conjuntos de imagens
- Salvar configurações por projeto
- Export/import de projetos
- Histórico de projetos recentes

#### Duplicatas e Similaridade
- Detector de imagens duplicadas (hash comparison)
- Agrupamento de similares
- Comparação side-by-side
- Deletar duplicatas em batch

### AUTOMAÇÃO

#### Ações em Sequência
- Criar workflow: Rotate → Resize → Compress → Watermark
- Salvar workflow como preset
- Aplicar workflow em ordem específica
- Condicional: "SE largura > 2000px ENTÃO resize 50%"

#### Batch Condicional
- Aplicar configurações diferentes baseado em:
  - Orientação (portrait/landscape)
  - Dimensões (< 1000px diferente de > 1000px)
  - Tamanho de arquivo (> 5MB comprime mais)
  - Formato original

#### Templates de Processamento
- Criar templates para casos de uso:
  - "Otimizar para Web"
  - "Preparar para Impressão"
  - "Post Instagram"
  - "Thumbnail YouTube"
- Cada template = conjunto de configurações

### EXPORTAÇÃO AVANÇADA

#### Naming Avançado
- Variáveis: {original}, {num}, {date}, {time}, {width}, {height}, {format}
- Operações: uppercase, lowercase, replace
- Prefix/suffix customizável
- Preview de todos os nomes antes de aplicar

#### Estrutura de Pastas no ZIP
- Organizar por: data, dimensões, orientação, tags
- Criar subpastas customizáveis
- Nomear pastas dinamicamente
- Manter estrutura original do upload

#### PDF Avançado
- Layout por página: 1, 2, 4, 6, 9 imagens
- Margens configuráveis
- Header/footer customizável
- Numeração de páginas
- Índice com miniaturas
- Compressão de imagens no PDF

#### Multi-formato Export
- Exportar mesma imagem em múltiplos formatos de uma vez
- Ex: original.jpg + original.webp + original@2x.jpg
- Configurações diferentes por formato
- Útil para web responsivo

### PERFORMANCE E CACHE

#### Preview Cache
- Cachear previews em IndexedDB
- Não recalcular se settings não mudaram
- LRU eviction quando cache cheio
- Limpar cache manualmente

#### Processamento Incremental
- Mostrar progresso imagem por imagem
- Permitir cancelar processamento
- Pausar/resumir batch processing
- Priorizar imagens visíveis na tela

#### Memory Management
- Liberar memória de imagens processadas antigas
- Limitar número de imagens em memória simultâneas
- Aviso quando memória > 80% usada
- Modo "Low Memory" (processa 1 por vez)

---

## 🎨 MELHORIAS DE USABILIDADE

### Interface

#### Workspace Customizável
- Redimensionar painel de settings
- Collapsible sections (accordion)
- Reordenar seções de settings (drag)
- Esconder features não usadas
- Layout presets: Compact, Standard, Detailed

#### Preview Melhorado
- Zoom in/out na preview (mouse wheel)
- Pan/drag na preview (para zoom > 100%)
- Fullscreen preview (modal)
- Comparação A/B com slider arrastável
- Grid de múltiplas previews (2x2, 3x3)

#### Grid de Imagens
- Tamanho de thumbnail ajustável (slider)
- View modes: grid, list, compact
- Ordenação arrastar/soltar
- Multi-seleção com Shift/Ctrl
- Select by: tipo, tamanho, dimensões
- Grupo de ações: rotate all, delete selected, etc

#### Indicadores Visuais
- Badge de status: pending, processing, done, error
- Progress bar individual por imagem
- Ícone se settings mudaram após processar
- Color coding: verde (ok), amarelo (warning), vermelho (erro)
- Tooltip com info detalhada ao hover

### Interação

#### Keyboard Shortcuts
- Ctrl+A: select all
- Ctrl+D: deselect all  
- Ctrl+Enter: processar selecionadas
- Delete: remover selecionadas
- Space: toggle preview
- ←/→: navegar entre imagens
- +/-: zoom in/out
- R: rotate 90°
- Ctrl+Z: undo settings
- Ctrl+Shift+Z: redo settings
- ?: mostrar lista de shortcuts

#### Drag & Drop Avançado
- Arrastar imagens para reordenar
- Arrastar múltiplas selecionadas juntas
- Drop zones: delete, rotate, priority
- Visual feedback durante drag
- Snap to grid ao soltar

#### Context Menu
- Right-click no card: opções rápidas
- Remove, rotate, process only this, preview, info
- Copy settings from this image
- Set as reference for comparison

#### Bulk Actions Bar
- Aparece quando 2+ imagens selecionadas
- Ações rápidas: Process, Download, Delete, Rotate, Tag
- "Apply to selected" para qualquer setting
- "Copy settings to selected"

### Feedback e Ajuda

#### Onboarding
- Tutorial interativo de 5 passos na primeira vez
- Pode pular ou fazer depois
- Highlights em features principais
- Tooltips contextuais em features novas

#### Tooltips Informativos
- Explicação breve de cada setting
- "?" icon ao lado de opções complexas
- Exemplos visuais quando relevante
- Links para docs/FAQ

#### Empty States
- Mensagem amigável quando sem imagens
- Sugestões de ação (upload, arrastar, colar)
- Imagens de exemplo para testar
- Tips de uso

#### Error Handling
- Mensagens de erro claras e acionáveis
- Sugestão de como resolver
- Botão de retry automático
- Log de erros acessível

#### Progress Feedback
- Barra de progresso global (X/Y imagens)
- Tempo estimado restante
- Velocidade de processamento (img/s)
- Botão cancelar sempre visível
- Notificação quando concluído (se aba inativa)

### Configurações e Presets

#### Preset Manager Melhorado
- Organizar presets em categorias/folders
- Buscar presets por nome
- Presets favoritos (star)
- Duplicar preset para editar
- Import/export preset como JSON
- Preset thumbnail (preview visual)

#### Settings History
- Histórico de últimas 20 configurações
- Voltar para configuração anterior (undo)
- Comparar duas configurações
- Salvar do histórico como preset

#### Quick Settings
- Botões rápidos para tarefas comuns:
  - "Otimizar para Web"
  - "Converter para PNG"
  - "Reduzir 50%"
  - "Adicionar Watermark"
- Customizar quick settings favoritos

#### Smart Defaults
- Lembrar última configuração usada
- Sugerir settings baseado no tipo de imagem
- Adaptar defaults por contexto
- Reset to defaults sempre disponível

---

## 🔧 MELHORIAS TÉCNICAS

### Performance
- Web Workers para não travar UI
- OffscreenCanvas para processamento paralelo
- Lazy loading de thumbnails (IntersectionObserver)
- Virtual scrolling para 500+ imagens
- Debounce em settings que trigam preview
- Memoização de cálculos repetidos

### Storage
- IndexedDB para cache de previews
- LocalStorage para settings/presets
- Auto-save a cada ação importante
- Auto-restore ao reabrir (crash recovery)
- Limpar cache old (> 7 dias)

### Responsividade
- Mobile drawer para settings
- Touch gestures: pinch zoom, swipe
- Floating action button sempre acessível
- Adaptar grid columns por viewport
- Mobile-specific keyboard (numpad para quality)

### Acessibilidade
- Navegação completa por teclado
- Screen reader friendly (ARIA)
- Focus indicators claros
- High contrast mode
- Respeitar prefers-reduced-motion

---

## ✅ PRIORIZAÇÃO

### MUST HAVE (Fazer Agora)
1. Crop/corte em lote com aspect ratios
2. Filtros de cor básicos (brightness, contrast, saturation)
3. Batch rename avançado com variáveis
4. Comparação interativa com slider
5. Keyboard shortcuts essenciais
6. Mobile responsivo completo
7. Auto-apply com debounce
8. Indicadores de estado visual nos cards

### SHOULD HAVE (Próximas 4 semanas)
1. Canvas/background customizável
2. Overlay de texto múltiplo
3. Smart compression com sugestões
4. Info detalhada + histogram
5. Detector de duplicatas
6. Estrutura de pastas no ZIP export
7. PDF avançado (múltiplas imagens/página)
8. Workspace customizável

### COULD HAVE (Backlog)
1. Content-aware resize
2. Correção de perspectiva
3. Collage/grid layout
4. Ações em sequência (workflows)
5. Tags e categorias locais
6. Batch condicional
7. Color palette extractor
8. Validação de qualidade automática

### WON'T HAVE (Explicitamente NÃO fazer)
- Nada que precise internet/servidor
- Nada com IA que precise modelo externo
- Cloud storage/sync
- Colaboração em tempo real
- Video processing