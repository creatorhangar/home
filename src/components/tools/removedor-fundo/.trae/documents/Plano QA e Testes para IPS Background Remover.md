## Objetivos
- Cobrir fluxos críticos de uso (upload → processamento → prévia → exportação/baixa).
- Validar responsividade, performance, acessibilidade e segurança.
- Implantar testes unitários, de integração e E2E com relatórios de métricas e monitoramento contínuo.

## Stack de Testes
- Unit/Integration: Vitest + React Testing Library + user-event.
- E2E: Playwright (com `@axe-core/playwright` para acessibilidade).
- Performance: Lighthouse (CLI) + Web Vitals + medições internas (hooks/canvas).
- Qualidade estática: ESLint + TypeScript strict + Prettier.

## Mapeamento de Funcionalidades
- Upload/drag-and-drop: `components/ImageUploader.tsx` (eventos de drag/drop e input).
- Processamento: `hooks/useImageProcessor.ts` (`processPendingImages`, `processImageById`).
- Exportação/Download: `hooks/useImageProcessor.ts` (`downloadImage`: 242–249; `downloadAllAsZip`: 265–290) e `components/ExportModal.tsx`.
- Persistência: `utils/idb.ts` (IndexedDB get/save/clear).
- Processamento de imagem: `utils/imageProcessor.ts` (múltiplos modos e refinamentos + Web Workers em `workers/grabcutWorker.ts`).
- Localização/UI: `utils/localization.ts` (chaves de i18n usadas pela UI).

## 1) Testes de Funcionalidade (E2E + Integração)
- Upload de arquivos válidos (PNG/JPG/WEBP) e rejeição de inválidos, com toast: `ImageUploader` + `toastEventManager`.
- Drag-and-drop com estados visuais: highlight, erro breve.
- Processar imagens pendentes: botão “Remover fundo” atualiza `status`/barra de progresso; conclui com toasts.
- Abrir `PreviewModal` e aplicar ajustes (tolerância, suavização de borda, refinamento, decontaminação, filtros) e persistir em `localStorage` e `IndexedDB`.
- Exportar em lote e unidade no `ExportModal` com presets, padding, modos de fit e opção circular.
- Baixar imagem individual: aguardar evento de download e validar nome gerado.
- Reverter todas/limpar todas: estados e limpeza no IndexedDB.
- Colagem via clipboard: cria arquivos e emite toast.

## 2) Testes de Responsividade
- Viewports: 360×640 (mobile), 768×1024 (tablet), 1440×900 e 1920×1080 (desktop).
- Validar grid de imagens, painéis, modais e controles (usabilidade, leitura de textos, botões clicáveis, foco navegável).
- Emular dispositivos em Playwright (iPhone 12, Pixel 7, iPad).

## 3) Testes de Performance
- Build de produção: medir TTI, LCP, CLS com Lighthouse.
- Web Vitals em runtime e coleta (console/endpoint futuro).
- Medir tempos internos por estágio usando `onMetrics` em `removeBackgroundClientSide` (compose, morph, bilateral, total) e registrar por tamanhos de imagem: 1K, 2K, 4K.
- Testes sob redes: offline/slow 3G/4G, validar fallback de toasts (ex.: JSZip ausente) e UX.
- Verificar concorrência dinâmica (`navigator.hardwareConcurrency` → workers paralelos) e impacto.

## 4) Validações de Qualidade
- Erros: simular CORS, IndexedDB indisponível, JSZip ausente; garantir mensagens e recuperação (toasts/estados).
- Unit tests
  - `utils/idb.ts`: salvar, listar, limpar (mock de IndexedDB).
  - `utils/fileUtils.ts`: base64 de arquivo e eventos de toast.
  - `utils/imageProcessor.ts`: funções puras (HSV/YUV, histograma, blur, morfologia) com dados sintéticos.
  - `workers/grabcutWorker.ts`: rotinas determinísticas com buffers pequenos.
- Integração
  - `useImageProcessor`: fluxo completo de estados, progressos, downloads zip (mock JSZip).
  - `ExportModal`: presets, cores, padding, círculo, JPG qualidade.
- Acessibilidade (WCAG)
  - Semântica: roles, labels, foco e navegação por teclado em modais e botões.
  - Auditoria com `@axe-core/playwright` por página/modal.
  - Contrastes básicos e textos alternativos (ver chaves como `previewAlt`, `processedAlt`).
- Segurança
  - Chaves/API: `services/geminiService.ts` não referenciado; confirmar não bundlar em client.
  - Downloads: nomes sanitizados; sem XSS em toasts; `dangerouslySetInnerHTML` apenas para texto controlado de i18n.
  - IndexedDB/localStorage: limites e limpeza; sem vazamento de blobs.

## 5) Processo de Revisão e Monitoramento
- Relatórios: gerar HTML/JSON de testes (Vitest coverage, Playwright report, Lighthouse report).
- Métricas: armazenar Web Vitals e `onMetrics` em logs; preparar endpoint opcional.
- Plano de correção: triagem por severidade (funcional > acessibilidade > performance), backlog com tarefas e SLAs.
- Monitoramento contínuo: execução em CI (build + test + e2e + lighthouse); alertas básicos em falhas de regressão.

## Entregáveis
- Configuração de testes e scripts (`test`, `test:e2e`, `lint`, `format`, `perf`).
- Suite unitária e de integração com cobertura.
- Suite E2E cobrindo fluxos principais e responsividade.
- Auditorias de acessibilidade e segurança, com ações recomendadas.
- Relatórios de performance e métricas internas por estágio.

## Fases de Implementação
1. Setup base: adicionar ferramentas, scripts e configurações; fixtures de imagens.
2. Unit/integração: utils, hooks e componentes chave; mocks (JSZip, IndexedDB, Workers).
3. E2E funcional: upload → process → preview → export/download; toasts e persistência.
4. Responsividade: cenários de dispositivos/viewports e ajustes identificados.
5. Performance: Lighthouse + Web Vitals + medições internas por tamanho de imagem e rede.
6. Acessibilidade: auditoria axe e correções (labels, foco, roles, contraste).
7. Segurança: verificação de bundling de libs não usadas, sanitização e cabeçalhos recomendados.
8. CI/Monitoramento: relatórios, thresholds e execução automatizada.

## Critérios de Aceite
- 95%+ de cobertura nas unidades de utilitários críticos; E2E passam em 3 navegadores.
- Lighthouse: LCP ≤ 2.5s em desktop e ≤ 4s em mobile no build de produção.
- Sem violações axe críticas em páginas principais.
- Nenhum bundle contendo segredos; gemini service não presente no client.

Confirma seguir com esta implementação e criar a infraestrutura de testes/métricas descrita?