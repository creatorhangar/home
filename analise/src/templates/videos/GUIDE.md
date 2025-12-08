# GUIA DEFINITIVO DE TEMPLATES DE VÍDEO PARA SHOWCASE ETSY

## VÍDEOS ESTÁTICOS COM MOVIMENTO SUTIL (5-15 segundos)

### Parallax Drift (4-12 imagens)
- **Imagens**: 3 camadas de profundidade
- **Movimento**: Parallax sutil via transform: translateX
- **Zoom**: Suave de 100% → 105% (6s)
- **Peso**: 🟢 LEVE - CSS transforms apenas
- **Técnica**: Layers com translate3d diferentes
- **Duração**: 8-10 segundos
- **Uso ideal**: Digital papers, patterns

### Floating Gallery (6-15 imagens)
- **Movimento**: Imagens flutuam com transform: translateY
- **Oscilação**: -10px a +10px (3s loop)
- **Rotação micro**: -2° a +2° (4s loop)
- **Peso**: 🟢 LEVE - CSS keyframes
- **Técnica**: animation com ease-in-out
- **Duração**: 10-12 segundos loop
- **Uso ideal**: Clipart, stickers, ilustrações

### Breathing Grid (8-20 imagens)
- **Grid**: Escala 98% → 102% → 98%
- **Efeito wave**: Delay incremental (0.1s entre itens)
- **Peso**: 🟢 LEVE - CSS scale transform
- **Técnica**: animation-delay em cada item
- **Duração**: 6-8 segundos loop
- **Uso ideal**: Bundles, coleções grandes

---

## VÍDEOS COM TRANSIÇÕES DINÂMICAS (10-25 segundos)

### Cascade Reveal (6-20 imagens)
- **Efeito**: Opacity 0→1 + translateY(-30px → 0)
- **Timing**: 0.4s entre cada imagem
- **Peso**: 🟢 LEVE - CSS transitions
- **Duração**: 15-20 segundos
- **Uso ideal**: Mostrar quantidade/variedade

### Carousel 3D (4-12 imagens)
- **Three.js**: Carrossel circular 3D real
- **Rotação**: Suave do grupo ao redor do eixo Y
- **Peso**: 🟡 MÉDIO - Three.js + texturas
- **Duração**: 12-18 segundos
- **Uso ideal**: Produtos premium, variações

### Grid Shuffle (8-16 imagens)
- **Movimento**: Imagens trocam de posição suavemente
- **Peso**: 🟢 LEVE - Trocar positions via CSS
- **Duração**: 12-15 segundos
- **Uso ideal**: Mostrar aleatoriedade/diversidade

### Mosaic Build (10-20 imagens)
- **Efeito**: Scale(0) → scale(1) com bounce
- **Final**: Zoom out suave 105% → 100%
- **Peso**: 🟢 LEVE - CSS scale + timing
- **Duração**: 15-20 segundos
- **Uso ideal**: Grandes bundles

---

## VÍDEOS COM STORYTELLING (15-25 segundos)

### Pan Journey (6-15 imagens)
- **Movimento**: Câmera faz pan horizontal suave
- **Peso**: 🟢 LEVE - Single translateX
- **Duração**: 20-25 segundos
- **Uso ideal**: Coleções temáticas

### Color Journey (8-12 imagens)
- **Efeito**: Background muda de cor gradualmente
- **Peso**: 🟢 LEVE - CSS transitions
- **Duração**: 20-25 segundos
- **Uso ideal**: Produtos sazonais, temas

### Split Reveal (4-10 imagens)
- **Efeito**: Clip-path 50% → 100%
- **Peso**: 🟡 MÉDIO - clip-path animation
- **Duração**: 12-18 segundos
- **Uso ideal**: Before/after, comparações

---

## VÍDEOS ESTILO RÁPIDO/DINÂMICO (5-12 segundos)

### Quick Flash Grid (12-20 imagens)
- **Efeito**: Brightness(100% → 150% → 100%)
- **Peso**: 🟢 LEVE - CSS filter brightness
- **Duração**: 5-8 segundos
- **Uso ideal**: Energia, promoções

### Slide Show (6-12 imagens)
- **Transição**: Slide left (translateX)
- **Peso**: 🟢 LEVE - CSS translateX
- **Duração**: 8-12 segundos
- **Uso ideal**: Destaque individual de cada item

### Zoom Sequence (6-10 imagens)
- **Scale**: 80% → 120% em 1s
- **Peso**: 🟢 LEVE - CSS scale + opacity
- **Duração**: 8-12 segundos
- **Uso ideal**: Impacto visual rápido

---

## VÍDEOS COM ELEMENTOS DECORATIVOS (12-20 segundos)

### Cork Board Digital (8-15 imagens)
- **Background**: Textura de cortiça
- **Peso**: 🟢 LEVE - Elementos CSS simples
- **Duração**: 15-18 segundos
- **Uso ideal**: Mood boards, inspiration

### Polaroid Stack Animation (6-12 imagens)
- **Estilo**: Polaroids empilhadas com rotações variadas
- **Peso**: 🟢 LEVE - CSS styling
- **Duração**: 12-16 segundos
- **Uso ideal**: Nostalgia, vintage

### Washi Tape Gallery (6-12 imagens)
- **Estilo**: Fotos "coladas" com fitas
- **Peso**: 🟢 LEVE - CSS shapes + rotate
- **Duração**: 15-18 segundos
- **Uso ideal**: Artesanal, DIY, handmade

---

## VÍDEOS COM EFEITOS VISUAIS (10-18 segundos)

### Stardust Gather (8-16 imagens)
- **Three.js**: Partículas esféricas pequenas
- **Peso**: 🟡 MÉDIO - Three.js + partículas controladas
- **Duração**: 15-18 segundos
- **Uso ideal**: Mágico, especial, digital

### Depth Field Carousel (6-12 imagens)
- **Three.js**: Imagens em círculo 3D com blur
- **Peso**: 🟡 MÉDIO - Three.js + shader blur
- **Duração**: 12-16 segundos
- **Uso ideal**: Fotográfico, profissional

### Floating Cards 3D (8-14 imagens)
- **Three.js**: Cards flutuando em espaço 3D
- **Peso**: 🟡 MÉDIO - Three.js + iluminação
- **Duração**: 15-20 segundos
- **Uso ideal**: Moderno, tech, premium

### Color Shift (8-16 imagens)
- **Efeito**: Grayscale → Color
- **Peso**: 🟢 LEVE - CSS filter
- **Duração**: 12-18 segundos
- **Uso ideal**: Revelar cores, produtos coloridos

### Glow Pulse (8-16 imagens)
- **Efeito**: Borda neon animada
- **Peso**: 🟢 LEVE - CSS box-shadow + filter
- **Duração**: 10-15 segundos loop
- **Uso ideal**: Moderno, tech, digital

---

## VÍDEOS MINIMALISTAS (8-15 segundos)

### Clean Fade (4-10 imagens)
- **Estilo**: Fundo branco limpo, fade in/out
- **Peso**: 🟢 LEVE - Opacity apenas
- **Duração**: 8-12 segundos
- **Uso ideal**: Elegância, simplicidade

### Grid Pop (9-16 imagens)
- **Efeito**: Cada célula faz "pop" único
- **Peso**: 🟢 LEVE - CSS scale
- **Duração**: 6-10 segundos
- **Uso ideal**: Rápido, eficiente

### Single Row Slide (6-10 imagens)
- **Movimento**: Desliza da direita para esquerda suavemente
- **Peso**: 🟢 LEVE - TranslateX contínuo
- **Duração**: 10-15 segundos loop
- **Uso ideal**: Carrossel simples

---

## VÍDEOS THREE.JS ESPECIAIS (12-25 segundos)

### Spiral Galaxy (10-20 imagens)
- **Three.js**: Imagens dispostas em espiral 3D
- **Peso**: 🟡 MÉDIO - Three.js + partículas leves
- **Duração**: 18-25 segundos
- **Uso ideal**: Cosmic, mágico, expansivo

### Cube Morph (6 imagens)
- **Three.js**: Cubo com 6 faces
- **Peso**: 🟡 MÉDIO - Three.js geometria simples
- **Duração**: 12-15 segundos
- **Uso ideal**: 6 itens exatos, moderno

### Wave Plane (8-16 imagens)
- **Three.js**: Plane com displacement wave
- **Peso**: 🟡 MÉDIO - Three.js + shader simples
- **Duração**: 15-20 segundos
- **Uso ideal**: Fluido, orgânico, têxtil

### Orbit Ring (8-15 imagens)
- **Three.js**: Imagens em anel orbital
- **Peso**: 🟡 MÉDIO - Three.js + partículas
- **Duração**: 15-20 segundos loop
- **Uso ideal**: Cíclico, contínuo, harmônico

### Exploding Grid (12-20 imagens)
- **Three.js**: Grid plano que explode em 3D
- **Peso**: 🟡 MÉDIO - Three.js geometria múltipla
- **Duração**: 12-18 segundos
- **Uso ideal**: Dramático, impactante

---

## VÍDEOS COM PARTÍCULAS CONTROLADAS (12-20 segundos)

### Particle Shimmer (8-16 imagens)
- **Canvas 2D**: Partículas orbitam ao redor de cada imagem
- **Peso**: 🟢 LEVE - Canvas 2D otimizado
- **Duração**: 12-16 segundos
- **Uso ideal**: Mágico, delicado

### Confetti Rain (6-12 imagens)
- **Canvas 2D**: Partículas caem com gravidade
- **Peso**: 🟢 LEVE - Canvas 2D física simples
- **Duração**: 10-15 segundos
- **Uso ideal**: Celebração, alegre, festivo

### Aurora Flow (8-14 imagens)
- **Three.js**: Partículas em fluxo ondulatório
- **Peso**: 🟡 MÉDIO - Three.js + noise
- **Duração**: 15-20 segundos
- **Uso ideal**: Etéreo, sonhador, místico

---

## TEMPLATES ADICIONAIS - FOCO VISUAL TDAH

### Candy Melt Morph (8-16 imagens)
- **Three.js**: Transição líquida suave entre imagens
- **Cores**: Pastéis candy (rosa, azul, lavanda)
- **Efeito**: Derretimento suave + partículas
- **Peso**: 🟡 MÉDIO - Three.js + shader
- **Duração**: 15-18 segundos
- **Uso ideal**: Produtos femininos, infantis, soft aesthetic

### Kaleidoscope Flow (10-20 imagens)
- **Three.js**: Efeito caleidoscópio suave
- **Movimento**: Rotação hipnótica lenta
- **Peso**: 🟡 MÉDIO - Three.js + shader
- **Duração**: 12-16 segundos loop
- **Uso ideal**: Arte digital, patterns, psicodélico suave
