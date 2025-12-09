## Diagnóstico rápido
- Erro 310 do React normalmente indica duas cópias do React rodando simultaneamente (duplicidade), o que quebra hooks.
- O projeto tinha um importmap carregando React via CDN no `index.html` e também via `node_modules` pelo Vite. Isso causa duplicidade. Já removi o importmap, mas ainda vemos erro; vamos garantir que o bundler dedupe e zerar qualquer cache/artefato.

## Plano de Correção
### 1) Garantir ambiente de desenvolvimento “não-minificado”
- Parar qualquer servidor em execução.
- Apagar `dist/` para evitar servir assets de build antigo.
- Subir `npm run dev` e acessar `http://localhost:3002/` para ver erros legíveis.

### 2) Verificar duplicidade de React
- Rodar `npm ls react react-dom` para checar múltiplas versões.
- Se houver mais de uma versão, alinhar ambas para a mesma (a atual é 19.x). Caso necessário, travar versões (ex.: `react@19.1.1` e `react-dom@19.1.1`).

### 3) Forçar dedupe/alias no Vite
- Ajustar `vite.config.ts` para dedupar React:
  - `resolve: { dedupe: ['react', 'react-dom'] }`.
  - (Opcional de hardening) alias explícitos para `react` e `react-dom` apontando para `node_modules`.

### 4) Limpar instalação e reconstruir
- `rm -rf node_modules` e `npm ci` para garantir instalação limpa.
- Subir `npm run dev` e validar se a página abre sem erro.

### 5) Fallback (se necessário)
- Se o erro persistir, baixar temporariamente para React 18 estável (`react@18.x`, `react-dom@18.x`) e `@vitejs/plugin-react` compatível, testar novamente.

### 6) Verificação final e Preview
- Rodar testes (`npm run test`) para garantir sanidade.
- Rodar `npm run preview` para validar build de produção em `http://localhost:3000`.

## Entregáveis
- Ajuste no `vite.config.ts` com dedupe.
- Logs de `npm ls react react-dom` com verificação.
- Aplicação abrindo no dev (`localhost:3002`) sem erro 310.
- Build de produção funcional (`localhost:3000`) com preview e Lighthouse no CI.

Confirma que aplico essas mudanças agora?