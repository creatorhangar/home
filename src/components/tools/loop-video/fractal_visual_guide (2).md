# 🌈✨ DIRETRIZES VISUAIS: APP DE FRACTAIS HIPNÓTICOS

## 🎯 Visão Criativa: "Visual Candy que Derrete o Cérebro"

> **Objetivo**: Criar uma experiência visual VICIANTE que faça as pessoas pararem o scroll. Pense: "Se Cyberpunk 2077 e caleidoscópio tivessem um filho digital"

---

## 🎨 PALETA DE CORES: Explosão de Dopamina

### Esquemas Principais (15+ variações)

#### 🌊 **Oceano Neon** (Synthwave Vibes)
```css
--neon-pink: #FF006E
--electric-blue: #00F5FF
--cyber-purple: #8B00FF
--sunset-orange: #FF4500
```
**Uso**: Túneis espirais, ondas pulsantes

#### 🔥 **Fogo Holográfico**
```css
--hot-magenta: #FF1493
--gold-shine: #FFD700
--lava-red: #FF4444
--white-core: #FFFFFF
```
**Uso**: Mandalas explosivas, núcleos brilhantes

#### 🌌 **Galáxia Ácida**
```css
--deep-space: #0A0E27
--nebula-purple: #9D4EDD
--star-cyan: #06FFA5
--cosmic-pink: #F72585
```
**Uso**: Backgrounds, partículas espaciais

#### 💎 **Cristal Arco-Íris**
```css
--emerald: #00FF88
--sapphire: #0080FF
--amethyst: #CC00FF
--topaz: #FFAA00
```
**Uso**: Reflexos, prismas, refrações

#### 🍬 **Candy Dream**
```css
--bubblegum: #FF69B4
--mint: #00FFB3
--lemon: #FFFF00
--grape: #DA70D6
```
**Uso**: UI playful, transições suaves

#### ⚡ **Energia Pura**
```css
--lightning-white: #FFFFFF
--volt-yellow: #FFFF00
--plasma-blue: #00FFFF
--shock-pink: #FF00FF
```
**Uso**: Raios, explosões, highlights

---

## 🌟 EFEITOS VISUAIS OBRIGATÓRIOS

### 1. 💫 **Bloom & Glow** (ESSENCIAL!)
**Biblioteca**: Three.js UnrealBloomPass

```typescript
// Configuração agressiva de bloom
bloomPass.threshold = 0.2;  // Mais sensível
bloomPass.strength = 2.5;    // Super intenso
bloomPass.radius = 1.0;      // Glow expandido
```

**Onde aplicar**:
- ✅ Núcleos de fractais (brilho central)
- ✅ Bordas de espirais
- ✅ Partículas em movimento
- ✅ Transições entre loops

**Efeito visual**: Tudo parece "vivo" e "energizado"

---

### 2. 🌈 **Aberração Cromática** (Efeito Glitch Chique)
**O que é**: Separar RGB criando "fantasmas" de cor

```glsl
// Shader GLSL simplificado
vec2 offset = vec2(0.003 * sin(time), 0);
vec3 color;
color.r = texture2D(tex, uv + offset).r;
color.g = texture2D(tex, uv).g;
color.b = texture2D(tex, uv - offset).b;
```

**Uso**:
- Bordas de objetos em alta velocidade
- Transições entre fractais
- Efeito "distorção temporal"

**Resultado**: Visual "trippy" de videoclipe dos anos 80

---

### 3. ✨ **Sistema de Partículas Inteligente**

**3 Tipos de Partículas**:

#### A) **Partículas Brilhantes** (Fireflies)
```typescript
particles: {
  count: 5000,
  size: 0.02 - 0.08,
  speed: 0.5,
  color: HSL rotation automática,
  behavior: "orbit" // Orbitam o fractal
}
```

#### B) **Rastros de Luz** (Trails)
```typescript
trails: {
  count: 200,
  length: 50 segments,
  fade: exponential,
  color: gradiente dinâmico
}
```

#### C) **Explosões Radiais** (Bursts)
```typescript
bursts: {
  trigger: "beat" ou "loop-end",
  particles: 1000,
  lifespan: 2s,
  expansion: exponencial
}
```

**Bibliotecas**:
- Three.js Points
- InstancedMesh para performance

---

### 4. 🎭 **Texturas Procedurais & Noise**

**Perlin/Simplex Noise** para:
- Superfícies "vivas" que respiram
- Distorções orgânicas
- Variação não-repetitiva

**Voronoi Patterns** para:
- Células cristalinas
- Padrões de vidro quebrado
- Tesselações dinâmicas

**Fresnel Effect** para:
- Bordas brilhantes (rim lighting)
- Efeito "bolha de sabão"
- Halos angelicais

```glsl
// Shader Fresnel
float fresnel = pow(1.0 - dot(normal, viewDir), 3.0);
color += fresnel * glowColor;
```

---

### 5. 🌀 **Distorção Temporal & Space-Time**

**Efeitos de dobra**:
- Ripple waves (ondas concêntricas)
- Twist/spiral distortion
- Fish-eye lens effect
- Kaleidoscope rotation

```glsl
// Distorção radial
float dist = length(uv - 0.5);
float angle = atan(uv.y - 0.5, uv.x - 0.5);
angle += sin(dist * 10.0 - time) * 0.3;
uv = vec2(cos(angle), sin(angle)) * dist + 0.5;
```

---

### 6. 💎 **Reflexos & Refrações**

**Environment Mapping**:
- CubeCamera para reflexos em tempo real
- Metalness + Roughness dinâmicos
- Faux glass shader

**Dica de performance**:
```typescript
// Atualizar reflexos a cada N frames
if (frame % 3 === 0) {
  cubeCamera.update(renderer, scene);
}
```

---

### 7. ⚡ **Post-Processing Stack** (Ordem importa!)

```typescript
// Pipeline de efeitos (ordem otimizada)
1. UnrealBloomPass      // Glow base
2. ChromaticAberration  // Distorção RGB
3. FilmPass             // Grain (sutil)
4. VignettePass         // Escurecer bordas
5. ColorCorrectionPass  // Grading final
6. FXAAPass             // Anti-aliasing
```

**Configuração Bloom Turbo**:
```typescript
bloomPass.threshold = 0.1;   // Quase tudo brilha
bloomPass.strength = 3.0;    // ULTRA brilho
bloomPass.radius = 1.2;      // Halo grande
```

---

## 🎬 ANIMAÇÕES & TRANSIÇÕES

### Movimentos Hipnóticos

#### 🌀 **Rotações Compostas**
```typescript
// Múltiplos eixos, velocidades diferentes
rotation.x = time * 0.5;
rotation.y = time * 0.3 + Math.sin(time * 0.2);
rotation.z = Math.cos(time * 0.15) * 0.5;
```

#### 🌊 **Ondas & Pulsações**
```typescript
// Scale breathing
scale = 1.0 + Math.sin(time * 2.0) * 0.2;

// Wave propagation
for (let i = 0; i < segments; i++) {
  offset = Math.sin(time * 3 + i * 0.5) * amplitude;
}
```

#### 💫 **Morphing Entre Formas**
```typescript
// Smooth transition entre fractais
const mixRatio = smoothstep(transitionStart, transitionEnd, time);
const geometry = lerp(spiralGeo, mandalaGeo, mixRatio);
```

---

### Transições entre Loops (CRÍTICO!)

**3 Técnicas Pro**:

1. **Camera Dive** (Túnel infinito)
```typescript
camera.position.z -= speed;
if (camera.position.z < -threshold) {
  camera.position.z += resetDistance; // Teleport invisível
}
```

2. **Explosão → Implosão**
```typescript
// Final do loop
scale *= 1.5; // Expand
opacity -= 0.02;
// Quando opacity = 0, reset tudo
```

3. **Whiteout Flash**
```typescript
// Fade to white + particle burst
flash.opacity = Math.min(1, flash.opacity + 0.05);
if (flash.opacity >= 1) {
  swapFractal();
  flash.opacity = 0;
}
```

---

## 🎨 BIBLIOTECAS & RECURSOS VISUAIS

### Shaders Prontos (Copiar & Adaptar)

**ShaderToy** (shadertoy.com):
- "Fractal Pyramid" - por IQ
- "Kaleidoscope" - por Various
- "Neon Tunnel" - por BigWIngs

**Converter GLSL para Three.js**:
```typescript
const material = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0 },
    resolution: { value: new THREE.Vector2() }
  },
  vertexShader: vertexCode,
  fragmentShader: fragmentCode
});
```

### Generators & Tools

1. **Coolors.co** - Paletas de cores automáticas
2. **Gradient Hunt** - Gradientes prontos
3. **Three.js Editor** - Testar materiais
4. **GLSL Sandbox** - Testar shaders

---

## 🚀 PERFORMANCE vs BELEZA

### Técnicas de Otimização SEM Perder Visual

#### ✅ **Usar LOD (Level of Detail)**
```typescript
// Menos polígonos longe da câmera
const lod = new THREE.LOD();
lod.addLevel(highPolyMesh, 0);    // Perto
lod.addLevel(mediumPolyMesh, 50); // Médio
lod.addLevel(lowPolyMesh, 100);   // Longe
```

#### ✅ **Instancing Massivo**
```typescript
// 10,000 objetos = 1 draw call
const instancedMesh = new THREE.InstancedMesh(
  geometry,
  material,
  10000
);
```

#### ✅ **Bloom Seletivo**
```typescript
// Só aplicar bloom em objetos específicos
object.layers.enable(1); // Bloom layer
bloomPass.layers = new THREE.Layers();
bloomPass.layers.set(1);
```

#### ✅ **Reduzir Resolução de Efeitos**
```typescript
// Bloom em resolução menor (invisível, 2x performance)
bloomPass.resolution = new THREE.Vector2(
  window.innerWidth / 2,
  window.innerHeight / 2
);
```

---

## 🎯 FRACTAIS ESPECÍFICOS: Receitas Completas

### 🌀 TIPO 1: "Cyber Spiral Tunnel"

**Ingredientes**:
```typescript
geometry: Cilindro com 8 lados
segments: 200 ao longo do Z
rotation: 0.02 rad/frame
colors: Gradiente neon (roxo → amarelo)
particles: 3000 fireflies orbitando
bloom: Strength 2.5
chromatic: 0.005 offset
```

**Shader Special**:
```glsl
// Stripe pattern que pulsa
float stripe = sin(vUv.y * 50.0 + time * 5.0);
stripe = smoothstep(0.3, 0.7, stripe);
color *= (0.7 + stripe * 0.3);
```

**Movimento**:
- Rotação horária nas paredes
- Camera avança no Z
- Ondas de luz viajam pelo túnel

---

### 🌸 TIPO 2: "Mandala Flower Explosion"

**Ingredientes**:
```typescript
layers: 12 camadas concêntricas
petals: 24 por camada (múltiplo de 6)
material: MeshStandardMaterial + Fresnel
metalness: 0.8
roughness: 0.2
envMap: Cube Camera
bloom: Strength 2.0
particles: 5000 ao redor
```

**Animações**:
```typescript
// Cada camada pulsa em fase diferente
layer.scale = 1 + Math.sin(time * 2 + layerIndex * 0.5) * 0.3;

// Rotação contra-rotativa
evenLayers.rotation.z = time * 0.5;
oddLayers.rotation.z = -time * 0.5;

// Color shift automático
hue = (time * 0.1 + layerIndex * 0.08) % 1.0;
```

**Cores Dinâmicas**:
```typescript
// HSL color wheel rotation
setInterval(() => {
  material.color.setHSL(
    (hue + time * 0.001) % 1.0,
    1.0,  // Saturação máxima
    0.6   // Luminosidade média
  );
}, 16);
```

---

### 💫 TIPO 3: "Kaleidoscope Dreams" (NOVO!)

**Conceito**: Espelho infinito com simetria radial

**Implementação**:
```typescript
symmetry: 6 ou 8 eixos
mirrors: Reflexão em tempo real
center: Fractal pequeno
edges: Blur + chromatic aberration
rotation: Lenta e hipnótica (0.005 rad/frame)
```

**Shader Core**:
```glsl
// Criar simetria radial
float angle = atan(uv.y, uv.x);
float radius = length(uv);
angle = mod(angle, PI / symmetry) - PI / (symmetry * 2.0);
vec2 symmetricUV = vec2(cos(angle), sin(angle)) * radius;
```

---

### 🌊 TIPO 4: "Ocean Wave Fractals" (NOVO!)

**Conceito**: Ondas que formam padrões fractais

```typescript
waves: {
  count: 50,
  amplitude: Decresce por camada,
  frequency: Aumenta por camada,
  speed: Variável por onda,
  color: Azul → Ciano → Branco (espuma)
}
```

**Visual**:
- Ondas translúcidas sobrepostas
- Brilho nas cristas (fresnel)
- Partículas de espuma
- Reflexo do "céu" (gradient map)

---

### 🔥 TIPO 5: "Fire Mandala Vortex" (NOVO!)

**Conceito**: Mandala + partículas de fogo

```typescript
core: Mandala rotativa
particles: 10,000 fire particles
behavior: Spiral outward + fade
colors: Vermelho → Laranja → Amarelo → Branco
distortion: Heat haze shader
```

**Shader de Calor**:
```glsl
// Distorção por calor (heat haze)
vec2 distortion = vec2(
  sin(uv.y * 20.0 + time * 3.0) * 0.01,
  cos(uv.x * 20.0 + time * 2.0) * 0.01
);
vec2 distortedUV = uv + distortion;
```

---

## 🎮 UI/UX: Controles Visuais

### Design Cyberpunk Minimalista

**Elementos**:
```
┌─────────────────────────────────────┐
│  ● ▶ ⏸ ⏭   [━━━●━━━━━━━] 1.5x      │ ← Play bar
│                                      │
│  🌀 Spiral | 🌸 Mandala | 🌊 Waves  │ ← Seletores
│                                      │
│  🎨 [Neon] [Fire] [Ocean] [Random]  │ ← Paletas
│                                      │
│  ⚡ Bloom: ████████░░ 80%            │ ← Sliders
│  🌈 Chroma: ████░░░░░░ 40%           │
│  ✨ Particles: ██████░░░░ 60%        │
└─────────────────────────────────────┘
```

**Estilo CSS**:
```css
.controls {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 255, 255, 0.3);
}

.button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.button:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 0 30px rgba(102, 126, 234, 0.8);
}
```

---

## 📊 PRESETS PRÉ-CONFIGURADOS

### Preset 1: "Rave Mode" 🎉
```json
{
  "fractal": "spiral",
  "colors": ["#FF00FF", "#00FFFF", "#FFFF00"],
  "bloom": 3.0,
  "chromatic": 0.008,
  "particles": 8000,
  "speed": 2.0,
  "strobe": true
}
```

### Preset 2: "Meditation" 🧘
```json
{
  "fractal": "mandala",
  "colors": ["#4A90E2", "#50C878", "#9B59B6"],
  "bloom": 1.5,
  "chromatic": 0.002,
  "particles": 2000,
  "speed": 0.5,
  "smooth": true
}
```

### Preset 3: "Cyberpunk" 🤖
```json
{
  "fractal": "tunnel",
  "colors": ["#FF006E", "#00F5FF", "#8B00FF"],
  "bloom": 2.5,
  "chromatic": 0.006,
  "particles": 5000,
  "speed": 1.5,
  "glitch": true
}
```

### Preset 4: "Aurora" 🌌
```json
{
  "fractal": "waves",
  "colors": ["#00FF88", "#0080FF", "#CC00FF"],
  "bloom": 2.0,
  "chromatic": 0.003,
  "particles": 6000,
  "speed": 0.8,
  "shimmer": true
}
```

---

## 🎯 CHECKLIST VISUAL (Não Entregar Sem!)

### Obrigatórios ✅

- [ ] **Bloom funcional** com intensity > 2.0
- [ ] **3+ paletas de cores** totalmente diferentes
- [ ] **Partículas** (mínimo 2000) animadas
- [ ] **Loop suave** sem "corte" visível
- [ ] **Chromatic aberration** nas bordas
- [ ] **60 FPS** constante (desktop)
- [ ] **Transições suaves** entre fractais (<2s)
- [ ] **Color shifting** automático (opcional manual)

### Extras que Impressionam 🌟

- [ ] **Environment mapping** (reflexos realistas)
- [ ] **Heat haze** ou distortion shader
- [ ] **Trail effects** em objetos móveis
- [ ] **Burst explosions** em momentos-chave
- [ ] **Audio-reactive** (Tone.js + FFT)
- [ ] **VR Mode** (WebXR) - futuro
- [ ] **Screenshot/GIF export** - compartilhar
- [ ] **Modo "screensaver"** infinito

---

## 🚨 ARMADILHAS COMUNS (Evite!)

### ❌ Erros de Iniciante

1. **Bloom demais = Performance ruim**
   - Solução: Bloom em resolução menor (renderTarget)

2. **Partículas sem culling**
   - Solução: Frustum culling + distance fade

3. **Cores saturadas demais = "cafonagem"**
   - Solução: Misturar com branco/preto (20-30%)

4. **Movimento linear = entediante**
   - Solução: Easing functions (ease-in-out)

5. **Loop com "salto" perceptível**
   - Solução: Testar no frame 0 e frame_max

### ⚠️ Performance Killers

```typescript
// ❌ NÃO FAÇA
for (let i = 0; i < 10000; i++) {
  scene.add(new THREE.Mesh(geo, mat)); // 10k draw calls!
}

// ✅ FAÇA
const instancedMesh = new THREE.InstancedMesh(geo, mat, 10000);
scene.add(instancedMesh); // 1 draw call!
```

---

## 🎬 INSPIRAÇÕES & REFERÊNCIAS

### Artistas para Estudar

1. **Beeple** - Direção de arte cyberpunk
2. **Android Jones** - Fractais psicodélicos
3. **Refik Anadol** - Data visualization artística
4. **Amon Tobin (ISAM)** - Visual mapping

### Projetos Open Source

- **Three.js Examples** - threejs.org/examples
- **GLSL Sandbox** - glslsandbox.com
- **Shadertoy** - shadertoy.com (conversor necessário)
- **WebGL Fundamentals** - webglfundamentals.org

### Música para Programar Isto

- Synthwave playlists (energia matching)
- Ambient electronic (flow state)
- Psytrance (velocidade ideal)

---

## 📱 RESPONSIVIDADE & ADAPTAÇÃO

### Mobile (Compromissos Necessários)

```typescript
const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

if (isMobile) {
  // Reduzir qualidade
  particles.count = 1000;      // vs 5000 desktop
  bloomPass.strength = 1.5;    // vs 2.5
  segments = 100;          