## Contexto Atual
- `npm run build`, `npm run preview`, `npm run test`, `npm run test:coverage`, `npm run test:e2e`, `npm run lint` já existem em `package.json`.
- Playwright está configurado para subir `npm run preview` em `http://localhost:3000` (playwright.config.ts).
- Há `lighthouse-desktop.json` e `lighthouse-mobile.json` na raiz.
- O processamento é client-side; o serviço Gemini não está referenciado em runtime. Mantemos qualquer `API_KEY` fora do cliente.

## Provedor e Disparo
- Provedor: GitHub Actions.
- Workflow `ci.yml` com gatilhos em `push` e `pull_request` para `main` e branches.
- Concurrency para evitar execuções paralelas redundantes por branch.

## Estratégia de Jobs
- Sistema: `ubuntu-latest`, Node `20.x` (ou LTS), `CI=true`.
- Cache: `actions/setup-node@v4` com `cache: npm`.

## Jobs e Comandos
- Lint:
  - `npm ci`
  - `npm run lint`
- Unit/integração + cobertura:
  - `npm ci`
  - `npm run test -- --run`
  - `npm run test:coverage`
  - Artefato: `coverage/` (HTML + texto)
- Build:
  - `npm ci`
  - `npm run build`
  - Artefato: `dist/`
- E2E (Playwright):
  - `npm ci`
  - `npx playwright install --with-deps`
  - `npm run build` (garante `dist` para o preview)
  - `npm run test:e2e`
  - Artefatos: pasta `test-results/` (vídeos, screenshots, traces)
- Lighthouse (desktop + mobile):
  - Baixa artefato `dist/` do job Build
  - Sobe `npm run preview` em background e aguarda `http://localhost:3000`
  - Executa `npx lighthouse http://localhost:3000 --quiet --config-path lighthouse-desktop.json --output html --output-path reports/lh-desktop.html`
  - Executa `npx lighthouse http://localhost:3000 --quiet --config-path lighthouse-mobile.json --output html --output-path reports/lh-mobile.html`
  - Artefatos: `reports/` com HTMLs de Lighthouse

## Políticas e Segurança
- Não executa chamadas ao Gemini em CI.
- Nenhum segredo exposto; se futuramente houver backend, secrets ficam em `Actions secrets` e consumidos apenas em jobs server-side.

## Otimizações
- Matriz opcional de Node (`18`, `20`) para `lint` e `vitest`.
- Fail-fast: `needs` encadeado; se `lint` ou `vitest` falhar, jobs seguintes não rodam.
- Upload de artefatos apenas em falha para `test-results/` (reduz custo), manter sempre para `coverage` e `dist`.

## Publicação (estático)
- Artefato `dist/` é o produto para deploy.
- Netlify/Vercel: apontar para `npm run build` e servir `dist/`.
- S3+CloudFront: sync `dist/` para bucket; invalidar CloudFront.

## Próximo Passo
- Adicionar `.github/workflows/ci.yml` com os jobs acima, incluindo cache, needs, artefatos e comandos exatamente como listados.
- Opcional: adicionar `npm run test:e2e:ci` com subset de projetos para reduzir tempo em PRs.

Confirma que preparo e abro o PR com o workflow?