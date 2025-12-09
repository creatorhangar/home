## Objetivo
Garantir que os testes E2E executem com sucesso e coletar novas métricas de desempenho com Lighthouse após a correção do preview.

## Passo 1 — Servidor de Preview
- Encerrar qualquer preview ativo
- Subir `vite preview` em `http://localhost:3000`
- Confirmar acesso e ausência de erros em runtime

## Passo 2 — Testes E2E (Playwright)
- Executar os testes apontando para `/?e2e=1` (pular tela de carregamento e limpar IndexedDB)
- Ajustar esperas explícitas:
  - Aguardar `h1` visível (ou título do header visível)
  - Aguardar `input#file-upload` ou `#file-upload-compact` antes de `setInputFiles`
- Ajustar tempo de espera quando necessário:
  - `expect.setDefaultTimeout(15000)` ou aumentar timeout apenas nas esperas críticas
  - Garantir `webServer` com `baseURL: http://localhost:3000` e `reuseExistingServer: true`
- Registrar resultados por navegador (Chromium, Firefox, WebKit, Mobile emulados) e armazenar vídeos/screenshots

## Passo 3 — Lighthouse (Desktop e Mobile)
- Executar Lighthouse com flags apropriadas para Windows:
  - `--chrome-flags="--headless=new --user-data-dir=./.tmp/chrome"`
  - Se houver bloqueio, usar Chrome DevTools → Lighthouse como alternativa
- Gerar relatórios JSON: `lighthouse-desktop.json` e `lighthouse-mobile.json`
- Extrair notas (Performance, Accessibility, Best Practices, SEO) e comparar com as anteriores; foco em Performance mobile

## Passo 4 — Entrega
- Relatório E2E: status por navegador, causas de falhas (se houver) e ajustes aplicados
- Relatório Lighthouse: notas e recomendações rápidas (lazy extra, split de código adicional, fontes)
- Próximos microajustes: tempos de espera finais, eventuais otimizações adicionais em imagens/canvas/fontes

## Critérios de sucesso
- Preview estável em `http://localhost:3000`
- E2E rodando, com sincronização corrigida (tests “verdes” ou com falhas documentadas e correções propostas)
- Relatórios Lighthouse gerados e interpretados, com notas comparadas (principalmente Performance mobile)

Posso executar agora?