# Galeria Vitrine - SaaS de Galeria de Imagens Multi-idiomas

Um sistema de galeria de imagens escalável construído com Next.js, TypeScript, Tailwind CSS e Supabase, suportando múltiplos idiomas através de uma arquitetura inovadora de conceitos e traduções.

## 🚀 Características

### Painel Administrativo
- ✅ Gerenciamento de conceitos (categorias e tags) com traduções
- ✅ Upload de imagens com arrastar e soltar
- ✅ Processamento em lote com aplicação de tags
- ✅ Interface intuitiva baseada em conceitos

### Galeria Pública
- ✅ Visualização com scroll infinito
- ✅ Filtros por categoria e tags multi-idiomas
- ✅ Layout masonry responsivo
- ✅ Busca inteligente através de funções RPC do Supabase

### Editor de Imagens
- ✅ Recorte com proporções fixas e livres
- ✅ Rotação de imagens
- ✅ Download instantâneo client-side
- ✅ Processamento no navegador (privacidade total)

### Arquitetura Multi-idiomas
- ✅ Suporte a 5 idiomas: Português, English, Español, Français, 日本語
- ✅ Sistema escalável de conceitos e traduções
- ✅ Adição de novos idiomas sem alterar código

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Storage, Auth)
- **Bibliotecas Essenciais**:
  - `@supabase/supabase-js` - Cliente Supabase
  - `react-dropzone` - Upload com drag & drop
  - `react-image-crop` - Ferramenta de corte
  - `react-infinite-scroll-component` - Scroll infinito
  - `react-masonry-css` - Layout masonry
  - `react-hot-toast` - Notificações
  - `lucide-react` - Ícones

## 📦 Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/galeria-vitrine.git
cd galeria-vitrine
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o Supabase**
- Crie um projeto no [Supabase](https://supabase.com)
- Configure o storage bucket `galeria-uploads`
- Execute a migration do banco de dados

4. **Configure as variáveis de ambiente**
Copie `.env.local.example` para `.env.local` e configure:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

5. **Execute a migration do banco de dados**
```bash
# Aplique a migration no Supabase
```

6. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas de Conceito
- `categorias` - Armazena os conceitos de categorias
- `tags` - Armazena os conceitos de tags

### Tabelas de Tradução
- `categoria_traducoes` - Traduções das categorias por idioma
- `tag_traducoes` - Traduções das tags por idioma

### Tabelas de Dados
- `imagens` - Metadados das imagens
- `imagem_tags_join` - Relacionamento muitos-para-muitos

### Funções RPC
- `search_images()` - Busca multi-idiomas com filtros
- `get_categoria_traducoes()` - Obtém traduções de categorias
- `get_tag_traducoes()` - Obtém traduções de tags

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # Rotas administrativas
│   ├── galeria/           # Galeria pública
│   └── layout.tsx         # Layout principal
├── components/            # Componentes React
│   ├── admin/            # Componentes administrativos
│   ├── gallery/          # Componentes da galeria
│   ├── editor/           # Editor de imagens
│   └── home/             # Componentes da homepage
├── hooks/                # Hooks customizados
├── lib/                  # Utilitários e configurações
└── types/                # Tipos TypeScript

supabase/
└── migrations/           # Migrations do banco de dados
```

## 🎯 Funcionalidades Detalhadas

### Admin Panel
- **Gerenciar Conceitos**: CRUD completo para categorias e tags com traduções
- **Upload de Imagens**: Interface drag-and-drop com preview
- **Processamento em Lote**: Aplicar tags e configurações a múltiplas imagens
- **Organização**: Sistema de categorização flexível

### Galeria Pública
- **Visualização**: Grid responsivo com layout masonry
- **Filtros**: Por categoria, tags, e busca textual
- **Performance**: Infinite scroll com lazy loading
- **Multi-idioma**: Conteúdo adaptado ao idioma do usuário

### Editor de Imagens
- **Recorte**: Múltiplas proporções (1:1, 16:9, 4:3, livre)
- **Rotação**: 90° increments
- **Download**: Processamento client-side em WebP
- **Privacidade**: Nenhum dado enviado ao servidor

## 🔧 Configuração do Supabase

### Storage
- Criar bucket `galeria-uploads`
- Configurar políticas de acesso (leitura pública, escrita admin)
- Habilitar transformações de imagem

### Auth
- Configurar autenticação para admin
- Criar políticas RLS apropriadas
- Configurar rotas protegidas

### Database
- Executar migration SQL
- Configurar índices para performance
- Criar funções RPC para busca

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático com cada push

### Outros provedores
- Configure Node.js 18+
- Configure as variáveis de ambiente
- Execute `npm run build` e `npm start`

## 📝 Comandos Disponíveis

```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Inicia servidor de produção
npm run lint         # Executa ESLint
npm run type-check   # Verifica tipos TypeScript
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 🐛 Reportando Bugs

Reporte bugs através das [Issues](https://github.com/seu-usuario/galeria-vitrine/issues)

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🙏 Agradecimentos

- [Next.js](https://nextjs.org/) - Framework React
- [Supabase](https://supabase.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Lucide React](https://lucide.dev/) - Ícones

## 📞 Suporte

Para suporte, envie um email para seu-email@example.com ou entre em contato através das issues do projeto.