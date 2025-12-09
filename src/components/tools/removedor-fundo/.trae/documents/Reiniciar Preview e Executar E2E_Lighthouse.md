## Objetivo
Reiniciar o servidor de preview e rodar os testes E2E e a auditoria Lighthouse, entregando resultados e artefatos.

## Passos
1. **Reiniciar servidor**
- Encerrar o processo atual do preview
- Subir novamente `vite preview` em `http://localhost:3000`

2. **Executar E2E (Playwright)**
- Rodar `npm run test:e2e -s` com o servidor ativo
- Garantir navegação para `/?e2e=1` nos testes (já configurado)
- Aguardar explicitamente: `h1` visível e `input#file-upload`/`#file-upload-compact`
- Coletar resultados, vídeos e screenshots das execuções

3. **Auditar com Lighthouse**
- Rodar Lighthouse desktop e mobile contra `http://localhost:3000`
- Gerar relatórios (`lighthouse-desktop.json`, `lighthouse-mobile.json`)
- Resumir notas (Performance, Accessibility, Best Practices, SEO)

4. **Entrega**
- Apresentar status dos E2E (pass/fail por navegador) e apontar qualquer falha remanescente
- Apresentar resumo das notas Lighthouse e recomendações rápidas

## Critérios de sucesso
- Preview reiniciado e acessível
- E2E executados com pelo menos um conjunto “verde”; se houver falhas, relatados com causa provável e fix sugerido
- Relatórios Lighthouse gerados e interpretados

Confirma que posso executar agora?