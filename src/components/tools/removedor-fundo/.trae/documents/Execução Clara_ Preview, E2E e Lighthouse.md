## Objetivo
Rodar preview, testes E2E e auditoria Lighthouse com feedback direto e resultados objetivos.

## Passo 1 — Preview
- Encerrar qualquer preview anterior
- Iniciar `npm run preview` (porta `http://localhost:3000`)
- Verificar que a home abre sem erros

## Passo 2 — E2E (Playwright)
- Executar `npm run test:e2e -s`
- Garantias já aplicadas no teste:
  - Navegar para `/?e2e=1` (pula tela de carregamento)
  - Aguardar `h1` visível
  - Aguardar `input#file-upload` ou `#file-upload-compact`
- Se algum navegador demorar:
  - Aumentar espera pontual (10–15s) para `h1` e `input`
- Entregar: lista de navegadores com PASS/FAIL e links para screenshots/vídeos

## Passo 3 — Lighthouse (Desktop e Mobile)
- Executar:
  - `npx lighthouse http://localhost:3000 --quiet --preset=desktop --chrome-flags="--headless=new --user-data-dir=./.tmp/chrome" --output=json --output-path=./lighthouse-desktop.json`
  - `npx lighthouse http://localhost:3000 --quiet --preset=mobile --chrome-flags="--headless=new --user-data-dir=./.tmp/chrome" --output=json --output-path=./lighthouse-mobile.json`
- Se houver bloqueio no Windows, usar Chrome DevTools → Lighthouse
- Entregar: notas (Performance, Accessibility, Best Practices, SEO) e comparação com a medição anterior

## Critérios de Sucesso
- Preview estável acessível
- E2E com pelo menos uma bateria verde; falhas restantes documentadas com causa provável
- Relatórios Lighthouse gerados e conclusões claras

## Entregáveis
- Resumo curto: status por navegador, problemas e correções
- Tabela simples das notas Lighthouse (desktop/mobile)
- Ações rápidas sugeridas (se necessário)

Posso executar agora?