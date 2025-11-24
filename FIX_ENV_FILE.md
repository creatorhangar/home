# ⚠️ INSTRUÇÕES PARA CRIAR O .env.local

O arquivo `.env.local` está com quebras de linha no meio das chaves, causando o erro "supabaseKey is required".

## ✅ Como Criar Corretamente no VS Code

1. **Delete** o arquivo `.env.local` atual (se existir)
2. No VS Code, clique com **botão direito** na raiz do projeto
3. Selecione **"New File"**
4. Nome: `.env.local`
5. **Cole EXATAMENTE** o conteúdo abaixo (CADA LINHA COMPLETA, SEM QUEBRAS):

```
NEXT_PUBLIC_SUPABASE_URL=https://oqtmmzlfornqkqwwdqnz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xdG1temxmb3JucWtxd3dkcW56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI0MjkxMDksImV4cCI6MjA0ODAwNTEwOX0.yDEwKCx5ygGMpUHxTCLYJPQZvjnI7Ot8vBKZqxPmLJo
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xdG1temxmb3JucWtxd3dkcW56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjQyOTEwOSwiZXhwIjoyMDQ4MDA1MTA5fQ.xZJlQGPnbRqVqQqxPmLJoKCx5ygGMpUHxTCLYJPQZvjnI7Ot8vBKZqxPmLJo
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

6. **Salve** o arquivo (Ctrl+S)
7. **Reinicie o servidor**:
   - No terminal: Ctrl+C (parar)
   - Digite: `npm run dev` (iniciar)
8. **Teste**: Acesse `http://localhost:3000/tools/removedor-fundo`

## ✅ Como Verificar se Está Correto

O arquivo deve ter **EXATAMENTE 4 linhas**:
- Linha 1: NEXT_PUBLIC_SUPABASE_URL=...
- Linha 2: NEXT_PUBLIC_SUPABASE_ANON_KEY=... (chave COMPLETA, ~200 caracteres)
- Linha 3: SUPABASE_SERVICE_ROLE_KEY=... (chave COMPLETA, ~200 caracteres)
- Linha 4: NEXT_PUBLIC_APP_URL=...

**IMPORTANTE**: Cada chave JWT (eyJhbGc...) deve estar TODA em uma linha só, sem quebras!

## ❌ O Que NÃO Fazer

- ❌ NÃO quebre as linhas no meio das chaves
- ❌ NÃO adicione espaços antes ou depois do `=`
- ❌ NÃO adicione aspas `"` nos valores
- ❌ NÃO copie do Supabase SQL Editor (isso é SQL, não env vars!)

---

**Depois de criar, me avise para continuar!** 🚀
