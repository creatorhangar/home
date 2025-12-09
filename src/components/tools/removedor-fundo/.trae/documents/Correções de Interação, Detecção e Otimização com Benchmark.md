## Objetivos Mensuráveis
- Fundo branco/claro: remover ≥95% do fundo sem halos perceptíveis.
- Tempo de prévia: ≤1,5s em HD; ≤4s em 4K em máquinas típicas.
- Tempo total por imagem: redução de 20–40% vs. atual em 4K.
- UI: todos os botões e controles clicáveis, sem áreas bloqueadas.

## Entregas
- Interação: desbloquear cliques/seleções nos cartões da grade e no modal.
- Copywriting: textos PT-BR mais diretos no uploader, painel e modal.
- Detecção: heurísticas para escolher modo ideal e melhorar fundos claros.
- Performance: downscale para prévia, Web Workers em etapas pesadas, concorrência ajustada.
- Benchmark: painel com métricas por etapa e tempo total.

## Implementação Técnica
### Interação
- Ajustar overlays de ações na grade com `pointer-events` condicionais para não bloquear cliques.
- Garantir que elementos do modal (sliders, botões, toggles) sempre recebam eventos.
- Reset do input de arquivo após upload para permitir reenvio do mesmo arquivo.

### Copywriting
- Atualizar textos PT-BR: mensagens curtas, focadas na ação (“Enviar”, “Editar”, “Aplicar”, “Baixar tudo”).
- Manter chaves de tradução e fallback para outros idiomas.

### Detecção e Modos
- Amostragem de cantos/bordas ignorando alfa baixo para detectar cor dominante.
- Heurística automática:
  - Fundo muito claro e de baixa variância luminosa → `floodfill`.
  - Proporção de “verde” alta (UV) → `chroma`.
  - Paleta interna reduzida → `silhouette`.
  - Caso contrário → `grabcut`.
- `floodfill` adaptativo:
  - Tolerância baseada em distância LAB/luminância.
  - Inicialização por bordas com tolerância mais permissiva para brancos.
- Refinos da máscara:
  - `opening/closing` morfológico quando houver ruído/buracos.
  - `edgeRefinement` negativo leve para remover halos.
  - `colorDecontamination` nas bordas semitransparentes.

### Performance
- Prévia rápida com downscale automático (512–1024px na menor dimensão).
- Web Workers para morfologia e bilateral em imagens ≥4K.
- Concorrência dinâmica no processamento em lote (baseada em `hardwareConcurrency`).
- Cancelamento de prévias longas quando o usuário move sliders.

### Métricas e Benchmark
- Instrumentar `performance.now()` por etapa: `graphcut`, `morph`, `bilateral`, `contour_smoothing`, `edge_blur`, `edge_refinement`, `compose` e `total`.
- Painel “Benchmark”: HD/4K/8K com relatório por etapa e total.
- Exportar resultados (copiar para clipboard) para comparar com concorrentes.

## Teste com Seu Upload
- Cenário 1 (fundo branco): enviar imagem; manter “Automático”; se sobrar fundo, adicionar um pin no fundo e aumentar “Tolerância”. Esperado: remoção completa sem halos.
- Cenário 2 (produto complexo): usar `GrabCut`, definir retângulo de área e marcar FG/BG nas bordas confusas; clicar em “Refinar”. Esperado: recorte preciso com tempo dentro das metas.
- Validar tempo no painel “Benchmark” e observar métricas exibidas.

## Cronograma
- Fase 1 (Interação + Copy): desbloqueios de clique e revisão de textos.
- Fase 2 (Detecção + Auto Mode): heurísticas e ajustes de `floodfill`/refinos.
- Fase 3 (Performance + Benchmark): downscale, workers, métricas e painel.

## Segurança e Privacidade
- Todo processamento local no navegador; sem envio de arquivos.

## Rollback
- Feature flags por etapa (heurística auto, workers, benchmark). Caso haja regressão, desativar o flag e voltar ao comportamento anterior.

Confirma que seguimos com este plano?