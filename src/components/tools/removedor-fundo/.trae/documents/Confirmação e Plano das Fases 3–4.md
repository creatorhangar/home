## Verificação da Fase 1

- Estrutura de submodos: presente e funcional no seletor de "Modo de Remoção" com opções `floodfill`, `grabcut`, `chroma`, `silhouette` e presets por tipo (Retrato/Produto/Logo/Green/Fundo sólido) em components/PreviewModal.tsx:1174–1207, 1189–1198, 1201–1207.
- SimpleControls: sliders reutilizáveis e claros (`SliderControl`, `ColorControl`) com descrições e ranges seguros em components/PreviewModal.tsx:26–52, 1211–1222.
- Conclusão: Fase 1 OK. Submodos e controles simples implementados corretamente.

## Verificação da Fase 2

- Ajustes rápidos por heurística: 
  - Auto-tolerance e calibração rápida para chroma em components/PreviewModal.tsx:1213–1215, 1259–1261.
  - Uniformidade/Histograma HSV para guiar ajustes em tempo real em components/PreviewModal.tsx:146–171, 165–190, 1265–1271.
  - Heurísticas robustas no pipeline para escolher modo e limitar expansão (LAB/gradiente) em utils/imageProcessor.ts:1208–1252, 752–856.
- Comparação antes/depois:
  - Overlay do original com toggle em components/PreviewModal.tsx:1048–1052, 1134–1138.
  - Histórico com Undo/Redo e reaplicação em components/PreviewModal.tsx:112–116, 235–248, 267–283.
- Conclusão: Fase 2 OK. Ajustes heurísticos e comparação antes/depois estão ativos.

## Próximos Passos para Fase 3

- Reorganização avançada por objetivos:
  1) Presets guiados: transformar o seletor de "Tipo" em cards com descrição visual e aplicar conjunto de parâmetros por objetivo (Retrato/Produto/Logo/Green/Fundo Sólido). 
  2) UI dinâmica: exibir controles pertinentes por objetivo (ex.: Retrato: refino de borda, bilateral; Produto/Fundo sólido: tolerância HSV, uniformidade; Green: escolher HSV vs YUV e auto-tolerance).
  3) Fluxo assistido: destacar sequência "Definir área → Marcar FG/BG → Refinar" quando `GrabCut` estiver ativo, com microdicas.
- Revisão completa de i18n:
  - Adicionar chaves ausentes usadas no UI (ex.: `previewModal.modeFloodfill`, `modeGrabcut`, `modeChroma`, `modeSilhouette`, `presetHelp`, `nextStep`, `defineArea`, `markFG`, `markBG`, `refine`, `iterations`, `lambda`, etc.). 
  - Revisar consistência de descrições (`toleranceDesc`, `edgeSoftnessDesc`, etc.) e cobrir idiomas existentes em utils/localization.ts.
- Usabilidade e clareza:
  - Ajustar ranges padrões (evitar valores inválidos como `edgeRefinement -1` exibido), tooltips curtos em linguagem cotidiana, e debounce de 300ms já em uso.

## Preparação para Fase 4

- Casos de teste (conjunto de imagens de validação):
  - Retratos humanos (cabelos, bordas finas), Produtos (bordas definidas), Fundos sólidos (branco/preto/azul), Green screen.
- Critérios de qualidade:
  - Fundos sólidos: acerto ≥99% medido por baixa opacidade nas bordas (`borderAlphaMean`) e inspeção visual.
  - Remoção excessiva: redução ≥80% monitorando máscaras quase vazias/cheias (>95%/<5%).
  - Preservação de detalhes: melhoria ≥80% por interseção com mapa de bordas (Sobel) e exemplos de cabelo.
  - Tempo: <5s para imagens simples; mover heavy para Worker acima de 1MP.

## Implementação Proposta (Fase 3)

1) UI por objetivos: componentes de cards, aplicação de presets e condicionais de exibição nos controles.
2) i18n: adicionar as chaves faltantes e rever traduções em todos os idiomas já presentes.
3) Microdicas e tooltips: linguagem acessível, explicando cada passo.

Ao confirmar, implemento a reorganização por objetivos, completo as chaves i18n em todas as línguas e entrego uma versão com UX aprimorada para você testar. Depois estruturamos os testes da Fase 4 com as imagens exemplo e relatórios das métricas.