## Visão Geral

* Integrar fundos coloridos (sólido e paletas personalizadas) e exportação em lote com dimensões, padding e modos de encaixe, preservando a qualidade e sem distorção por padrão.

* Aproveitar imagens já processadas (`processedURL`) e compor em um novo `canvas` por imagem para exportação com fundo, dimensões e fit.

## Onde Integrar no Código

* Painel/ações: acrescentar botão “Exportar Imagens” em `App.tsx:415–430`.

* Novo modal de exportação: componente `ExportModal` (seguindo padrões de `PreviewModal.tsx` e `GalleryModal.tsx`).

* Lógica de exportação em lote: nova função no hook `hooks/useImageProcessor.ts` ao lado de `downloadAllAsZip` para compor e zipar imagens com `ConfiguraçãoExportação`.

* Tipos: adicionar interface `ConfiguraçãoExportação` em `types.ts` e reutilizar em UI e hook.

* Localização: incluir chaves em `utils/localization.ts` para rótulos, mensagens e presets (usa-se o mesmo padrão de `t('...')` já presente, por exemplo `utils/localization.ts:184` para erros de ZIP).

## UI – Fundos Coloridos

* Na UI do modal:

  * Seletor “Visualizar Resultado” com opções: `Quadriculado`, `Branco`, `Preto`, `Cor Sólida`, `Exportar Colorido*`.

  * Regra de exportação: quando `Quadriculado/Branco/Preto` estiver selecionado, a exportação sai com fundo transparente; para `Cor Sólida/Cores Personalizadas`, exporta com a(s) cor(es) escolhida(s). Mostrar texto informativo.

* “Cor Sólida”: abrir color picker, aplicar a mesma cor a todas as imagens, preview em tempo real.

* “Cores Personalizadas \[use Download Colorido, é mais facil de entender]”:

  * Modos: `Sequencial` e `Aleatório`.

  * Paletas prontas:

    * Tons Neutros: `['#F5F5F0','#E8DCC4','#C9B8A0','#A69885','#8B8378','#5C5751','#3D3935','#FFFFFF']`.

    * Tons Suaves: `['#F7E7DC','#E8D5C4','#D4C5B9','#C5B8AA','#B8A99A','#E0D5C7','#D9C6B0','#F2EAE1']`.

  * Lista de cores personalizadas com `[+ Adicionar Cor]` e `[Limpar Todas]` e contagem.

  * Lista de atribuição por imagem com indicação sequencial/aleatória.

  * é opcional mudar a cor individualmente dentro do modal ou até com uma 'bolinha' com corntorno e solbra com a cor do fundo dentro da imagem pra opcao de subsitiruir cor, será que fica sobrecarregado? nao quero sobrecarregar ou pesar o aplicativo com essas ferramentas que nao sao o pricipal, veja e valide se é viavel deixar no card da imagem, ou só 'escondido' ou outra forma de mudar individualmente.

## UI – Exportação com Dimensões

* Seção “Dimensões”: `Original`, `Preset` e `Personalizado`.

* Presets populares:

  * 1:1 1080×1080, 4:5 1080×1350, 16:9 1920×1080, 9:16 1080×1920, 3:4 1080×1440, 4:3 1440×1080, 2:3 1000×1500, 21:9 2560×1080, 1.91:1 1200×628, 16:9, REDONDO\CIRCULAR, com opção de acicionar borda colorida, estilo 'instagram, quando a pessoa posta um strory, mas nao use nenhum nome desses no app,' será que é possivel adicionar essa borda tbm de forma elegante .

* Personalizado: largura/altura numéricas com limites; opção de proporção X:Y.

* Ajustes: `Manter proporção do objeto`, `Centralizar`, `Padding` (slider 0–50, padrão 10), `Encaixe`: `Ajustar (contain)` padrão, `Preencher (cover)`, `Cobrir (fill)`.

## Lógica de Exportação em Lote

* Nova função `exportarLote(images, config)` no hook:

  * Para cada imagem `done` com `processedURL`:

    1. Criar `canvas` com `dimensões.width/height` (ou do preset).
    2. Definir fundo:

       * `quadriculado/branco/preto` → `transparent` (não pintar background; exporta PNG com alpha).

       * `cor-solida/cores-personalizadas` → `ctx.fillStyle = cor` e `fillRect`.

       * Em `cores-personalizadas`: obter cor via `sequencial` ou `aleatorio` do array.
    3. Calcular encaixe com padding e `fitMode`:

       * `contain`: `scale = min((W-2p)/imgW, (H-2p)/imgH)`.

       * `cover`: `scale = max(W/imgW, H/imgH)`; pode cortar.

       * `fill`: `scaleX=W/imgW`, `scaleY=H/imgH`; pode distorcer.
    4. Desenhar o sujeito centralizado via `drawImage` usando URL do PNG com transparência.
    5. Exportar:

       * `formato.tipo === 'png'` → `canvas.toBlob('image/png')`.

       * `formato.tipo === 'jpg'` → fundo sempre opaco; `toBlob('image/jpeg', qualidade/100)`.
    6. Nomear como `imagem_{index+1}.png/jpg` ou derivado do original.

  * Gerar ZIP com `JSZip` (já carregado em `index.html:12`).

## Preview em Tempo Real

* Dentro do `ExportModal`, mostrar preview da primeira imagem e navegação `← Anterior | Próxima →`.

* Renderizar preview em `canvas` pequeno com a mesma lógica de fundo/encaixe.

* Lista “Cores Aplicadas” indicando mapeamento por imagem e botões `[Editar Cores]` e `[Randomizar]`.

## Validações e Mensagens

* Validações ao exportar:

  * Pelo menos 1 cor em “Cores Personalizadas”.

  * Dimensões: min 100×100, max 10000×10000.

  * `padding ≤ 50`.

* Mensagens (localização):

  * "Selecione pelo menos 1 cor para continuar"

  * "Dimensões muito pequenas. Mínimo: 100×100px"

  * "Dimensões muito grandes. Máximo: 10000×10000px"

  * "Padding não pode exceder 50px"

## Integração com Estado Existente

* Reutilizar `images` e status do `useImageProcessor`.

* Não reprocessar fundo; usar `processedURL` e compor no `canvas` de exportação.

* Manter compatibilidade com `App.tsx` preview global: `dark | light | checkerboard` já existe (`App.tsx:405–410`).

## Alterações Pontuais (Referências)

* `App.tsx:405–410`: seletor de fundo de prévia.

* `App.tsx:418–430`: adicionar botão “Exportar Imagens” abrindo `ExportModal`.

* `hooks/useImageProcessor.ts:244–271`: referência ao padrão de ZIP para implementar `exportarLote(config)`.

* `utils/imageProcessor.ts:1–26`: `RemovalOptions` já prevê `background.output/color`; manter para processamento, mas export usa `ConfiguraçãoExportação` própria.

* `index.html:45–49`: classe `checkerboard-bg` já existente para UI.

## Tipos

```ts
interface ConfiguracaoExportacao {
  fundos: {
    tipo: 'quadriculado' | 'branco' | 'preto' | 'cor-solida' | 'cores-personalizadas';
    corSolida?: string;
    coresPersonalizadas?: string[];
    modoAplicacao?: 'sequencial' | 'aleatorio';
    paletaSelecionada?: 'neutros' | 'suaves' | null;
  };
  dimensoes: {
    modo: 'original' | 'preset' | 'personalizado';
    preset?: '1:1' | '4:5' | '16:9' | '9:16' | '3:4' | '4:3' | '2:3' | '21:9' | '1.91:1';
    custom?: { width: number; height: number; };
  };
  ajustes: {
    padding: number;
    fitMode: 'contain' | 'cover' | 'fill';
    centralizar: boolean;
    manterProporcao: boolean;
  };
  formato: {
    tipo: 'png' | 'jpg';
    qualidade?: number;
  };
}
```

## Fluxo do Usuário

1. Remover fundo das imagens normalmente.
2. Abrir “Exportar Imagens”.
3. Escolher fundo: `Cor Sólida` ou `Cores Personalizadas` para exportar colorido; `Quadriculado/Branco/Preto` apenas pré-visualiza, exporta transparente.
4. Definir dimensões (preset ou custom), padding e encaixe.
5. Visualizar preview e navegar entre as imagens.
6. Exportar todas (ZIP) ou individual.

## Testes e Verificação

* Testar com 30 imagens: `Sequencial` e `Aleatório` com paletas, `contain` e `cover`.

* Validar limites de dimensões e padding e mensagens locais.

* Conferir que PNG mantém transparência quando fundo não colorido.

## Entregáveis (Faseadas)

* Fase 1: Fundos coloridos (sólido/múltiplas cores, paletas, preview, modo sequencial/aleatório).

* Fase 2: Exportação (dimensões, presets, padding, fit modes, formato, ZIP).

* Fase 3: UX (preview em tempo real, navegação, lista de cores, progresso de exportação).

