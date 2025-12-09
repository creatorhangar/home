## Objetivo
Executar localmente a app no Trae terminal, rodar testes (unit/integr., E2E) e gerar relatórios Lighthouse.

## Passos
1) Preparar ambiente
- Confirmar diretório do projeto.
- Instalar dependências incluindo dev (`npm install` ou `npm ci`).
- Garantir browsers do Playwright (`npx --yes playwright install`).

2) Subir servidor
- Dev: `npm run dev` (porta 3000 conforme `vite.config.ts`).
- Alternativa: `npm run preview` após `npm run build`.

3) Testes
- Unit/integração: `npm run test -- --run`.
- Cobertura: `npm run test:coverage`.
- E2E: `npm run test:e2e` (usa webServer configurado).

4) Lighthouse
- Com servidor no ar: desktop e mobile usando configs existentes; salvar relatórios em `reports/`.

5) Entregáveis
- Link do preview local (`http://localhost:3000`).
- Saída dos testes e artefatos relevantes.
- Relatórios Lighthouse HTML em `reports/`.

Se aprovado, executo imediatamente os comandos e deixo o servidor rodando para você validar.