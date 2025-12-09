## Análise de concorrência
- Apps como Canva, Figma, Milanote/Miro oferecem: upload de imagens (PNG/JPG/SVG), aplicação em plano de fundo de página e por elemento, modos de preenchimento (cover/contain/center/tile), rotação e reposicionamento com controles visuais, escala/zoom, múltiplas camadas com ordenação e opacidade, blend modes, biblioteca de texturas/padrões, pré-visualização em tempo real, persistência no projeto e exportação.
- No nosso app, já existem padrões programáticos (linhas, grid, pontilhado) nos widgets de nota, mas faltam: upload de textura, aplicação por página vs por widget, modos de preenchimento e edição completa (rotação, posição, escala), camadas com sobreposição e persistência unificada.

## Objetivo
Implementar um sistema de texturas com upload (PNG/JPG/SVG) e edição para dois escopos: fundo da folha (canvas) e fundo do widget (card), com modos de preenchimento, rotação, posição e escala, preview em tempo real, camadas e persistência.

## Arquitetura e Modelo de Dados
- Tipos
  - `TextureLayer`: `{ id, src, name, scope: 'page'|'widget', fill: 'esticar'|'repetir'|'centralizar', angle: number, posX: number, posY: number, scale: number, opacity?: number, zIndex: number }`.
  - `TextureState`: `{ pageLayers: TextureLayer[], widgetLayersById: Record<string, TextureLayer[]> }`.
- Integração
  - Por widget: ampliar `WidgetEntry.style` para incluir `textureLayers?: TextureLayer[]`.
  - Por página: adicionar `canvasTextureLayers: TextureLayer[]` ao estado de tema/canvas em `App.tsx`.
- Persistência
  - Incluir `canvasTextureLayers` e `textureLayers` dos widgets no objeto de template salvo/exportado.
  - `localStorage` para auto-salvar e restaurar.

## Estratégia de Renderização
- Página (canvas): renderizar um contêiner overlay absoluto dentro do canvas (`position: absolute; inset: 0; pointer-events: none;`) para cada `TextureLayer` de página.
- Widget: dentro do `WidgetRenderer`, renderizar uma camada overlay atrás do conteúdo do widget para cada `TextureLayer` do widget.
- Mapeamento de controles → CSS
  - `fill: esticar` → `background-size: cover; background-repeat: no-repeat;`
  - `fill: centralizar` → `background-size: auto; background-repeat: no-repeat; background-position: center;`
  - `fill: repetir` → `background-repeat: repeat; background-size` derivada de `scale`.
  - `angle` → aplicar `transform: rotate(angle) scale(scale)` na camada overlay (em vez de tentar rotacionar `background-image`).
  - `posX/posY` → `transform: translate(posX, posY)` ou ajustar `background-position` quando fizer sentido.
  - `opacity` → via `opacity` no overlay.
  - `zIndex` → ordenar camadas.
- Vídeo/Desempenho: usar `URL.createObjectURL(file)` para `src`; revogar em remoção; throttling leve nas mudanças de slider.

## UI/Controles
- Menu de configurações: criar seção "Texturas" com dois subpainéis:
  - "Fundo da folha": upload/gerenciamento de camadas, controles de fill/rotação/posição/escala/ordem/visibilidade.
  - "Fundo do widget": idêntico, operando sobre o widget selecionado.
- Indicadores visuais: destacar o alvo atual (borda/realce no canvas ou no card do widget) e etiqueta no painel.
- Upload: input com `accept="image/png,image/jpeg,image/svg+xml"`, limite de tamanho configurável (ex.: 5–10 MB) com validação e mensagem.

## Pré-visualização em tempo real
- Atualizar estilos imediatamente ao mover sliders; aplicar debounce curto (p.ex. 50–100 ms) para suavizar.

## Sistema de Camadas
- Operações: adicionar/remover, mover acima/abaixo, alternar visibilidade, ajustar opacidade.
- Renderização: cada layer é um `div` overlay independente para permitir rotação e repetição.

## Persistência
- `localStorage`: salvar e restaurar `TextureState` junto ao template.
- Exportar/Importar: incluir as texturas no JSON de template; migração segura quando ausente.

## Testes e Validação
- Resoluções: validar em breakpoints de canvas e redimensionamento do navegador.
- Performance: testar com múltiplas texturas (p.ex., 5–10 camadas) e medir FPS/interações.
- Persistência: garantir que configurações permanecem após fechar/reabrir (recarregar).
- Arquivos: verificar limites e formatos rejeitados com mensagens adequadas.

## Dependências e Conformidade
- Reutilizar React + Tailwind existentes; sem novas libs obrigatórias.
- Corrigir bloqueios atuais de build antes de codar texturas:
  - Duplicatas `WidgetNoteLined`/`WidgetNoteCornell` em `src/widgets.tsx` (unificar nomes/exports).
  - Classe Tailwind inexistente `border-ui.border` em `src/index.css` (substituir por utilitário padrão como `border-gray-200` ou ajustar tema).

## Passos de Implementação (arquivos alvo)
1. `src/App.tsx`: adicionar estado `canvasTextureLayers`; conectar ao painel de configurações; renderizar overlay de página no canvas.
2. `src/widgets.tsx`: estender `WidgetRenderer` para camadas de textura por widget; aplicar mapping CSS acima.
3. `src/templates.ts`: incluir campos de textura ao salvar/exportar/importar templates.
4. `src/index.css`: utilitário `.texture-overlay` com posicionamento absoluto e isolamento.
5. Painel UI: acrescentar seção "Texturas" em Configurações (reutilizando o padrão atual de Tabs/Controls).
6. Validação: utilitário para validar upload (formatos/tamanho) e criar Object URLs com revogação.
7. Ajustes de build: remover duplicatas e corrigir classe Tailwind.

## Critérios de Aceite
- Upload de PNG/JPG/SVG com validação de tamanho e preview.
- Aplicação por página e por widget com controles: fill, rotação, posição, escala.
- Múltiplas camadas com ordem e opacidade.
- Pré-visualização em tempo real e persistência em export/import e `localStorage`.
- Performance aceitável com várias texturas.

Confirme para eu iniciar a implementação, corrigir os erros de build apontados e entregar os recursos acima com testes.