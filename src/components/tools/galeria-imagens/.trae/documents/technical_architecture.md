# SaaS de Galeria de Imagens - Documentação Técnica

## Stack Tecnológica
- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Backend**: Supabase (BaaS)
  - PostgreSQL (Banco de dados)
  - Storage (Armazenamento de arquivos)
  - Auth (Autenticação)
- **Bibliotecas Essenciais**:
  - `@supabase/supabase-js` - Cliente Supabase
  - `react-dropzone` - Upload com drag & drop
  - `color-thief-react` - Detecção de cor dominante
  - `react-image-crop` - Ferramenta de corte
  - `react-infinite-scroll-component` - Scroll infinito
  - `react-masonry-css` - Layout masonry (opcional)

## Arquitetura do Banco de Dados

### Estrutura de 6 Tabelas (Escalável Multi-idiomas)

#### Tabelas de Conceito (O que algo "é")

**1. categorias** - Armazena o conceito da categoria
```sql
CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identificador_unico TEXT UNIQUE NOT NULL -- Ex: "cat_wallpaper", "cat_texture"
);
```

**2. tags** - Armazena o conceito da tag
```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identificador_unico TEXT UNIQUE NOT NULL -- Ex: "tag_natal", "tag_papel_vintage"
);
```

#### Tabelas de Tradução (Como algo "é chamado")

**3. categoria_traducoes** - Dicionário de categorias
```sql
CREATE TABLE categoria_traducoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria_id UUID REFERENCES categorias(id) ON DELETE CASCADE,
  codigo_idioma TEXT NOT NULL, -- Ex: "pt", "en", "es", "fr", "ja"
  nome_traduzido TEXT NOT NULL, -- Ex: "Fundo de Tela", "Wallpaper"
  UNIQUE(categoria_id, codigo_idioma)
);
```

**4. tag_traducoes** - Dicionário de tags
```sql
CREATE TABLE tag_traducoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  codigo_idioma TEXT NOT NULL, -- Ex: "pt", "en", "es", "fr"
  nome_traduzido TEXT NOT NULL, -- Ex: "Natal", "Christmas", "Noël"
  UNIQUE(tag_id, codigo_idioma)
);
```

#### Tabelas de Dados (Onde as coisas "estão")

**5. imagens** - Metadados principais das imagens
```sql
CREATE TABLE imagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria_id UUID REFERENCES categorias(id),
  destacado BOOLEAN DEFAULT FALSE,
  url_publica TEXT NOT NULL, -- URL completa do Supabase Storage
  cor_dominante TEXT, -- Código HEX da cor dominante
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**6. imagem_tags_join** - Relacionamento muitos-para-muitos
```sql
CREATE TABLE imagem_tags_join (
  imagem_id UUID REFERENCES imagens(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (imagem_id, tag_id)
);
```

### Função RPC para Busca Multi-idiomas

```sql
CREATE OR REPLACE FUNCTION search_images(
  idioma_busca TEXT DEFAULT 'pt',
  tag_busca TEXT DEFAULT NULL,
  categoria_busca TEXT DEFAULT NULL,
  limite INTEGER DEFAULT 50,
  offset_val INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  categoria_id UUID,
  destacado BOOLEAN,
  url_publica TEXT,
  cor_dominante TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  -- Se houver busca por tag
  IF tag_busca IS NOT NULL THEN
    RETURN QUERY
    SELECT DISTINCT i.id, i.categoria_id, i.destacado, i.url_publica, i.cor_dominante, i.created_at
    FROM imagens i
    INNER JOIN imagem_tags_join itj ON i.id = itj.imagem_id
    INNER JOIN tag_traducoes tt ON itj.tag_id = tt.tag_id
    WHERE tt.codigo_idioma = idioma_busca AND tt.nome_traduzido = tag_busca
    ORDER BY i.created_at DESC
    LIMIT limite OFFSET offset_val;
  
  -- Se houver busca por categoria
  ELSIF categoria_busca IS NOT NULL THEN
    RETURN QUERY
    SELECT i.id, i.categoria_id, i.destacado, i.url_publica, i.cor_dominante, i.created_at
    FROM imagens i
    INNER JOIN categoria_traducoes ct ON i.categoria_id = ct.categoria_id
    WHERE ct.codigo_idioma = idioma_busca AND ct.nome_traduzido = categoria_busca
    ORDER BY i.created_at DESC
    LIMIT limite OFFSET offset_val;
  
  -- Busca geral (mais recentes)
  ELSE
    RETURN QUERY
    SELECT i.id, i.categoria_id, i.destacado, i.url_publica, i.cor_dominante, i.created_at
    FROM imagens i
    ORDER BY i.created_at DESC
    LIMIT limite OFFSET offset_val;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

## Configuração do Supabase

### Storage
- **Bucket**: `galeria-uploads`
- **Permissões**: Leitura pública, escrita apenas para admin
- **Transformações de imagem**: Suporte para `?width=400&format=webp`

### Auth
- **Rota de login admin**: `/admin-login`
- **Políticas RLS**: Configurar permissões apropriadas para cada tabela

## Estrutura do Projeto Next.js

```
src/
├── app/
│   ├── admin/
│   │   ├── gerenciar-conceitos/    # CRUD de categorias/tags
│   │   ├── upload/                 # Interface de upload
│   │   └── login/                  # Login de admin
│   ├── galeria/
│   │   └── [search]/               # Página de resultados de busca
│   ├── api/
│   │   └── upload/                 # Endpoint de upload
│   ├── components/
│   │   ├── admin/
│   │   │   ├── ConceptManager.tsx  # Gerenciador de conceitos
│   │   │   ├── ImageUploader.tsx     # Upload de imagens
│   │   │   └── BatchProcessor.tsx    # Processamento em lote
│   │   ├── gallery/
│   │   │   ├── ImageCard.tsx         # Card de imagem
│   │   │   ├── MasonryGrid.tsx       # Grid masonry
│   │   │   └── SearchBar.tsx         # Barra de busca
│   │   ├── editor/
│   │   │   ├── ImageEditor.tsx       # Editor de imagens
│   │   │   └── CropTool.tsx          # Ferramenta de corte
│   │   └── home/
│   │       ├── HeroSection.tsx       # Seção hero
│   │       ├── FeaturesSection.tsx   # Seção de recursos
│   │       ├── CategoryBlocks.tsx    # Blocos de categoria
│   │       └── RecentGallery.tsx     # Galeria recente
│   ├── lib/
│   │   ├── supabase.ts              # Cliente Supabase
│   │   ├── types.ts                 # Tipos TypeScript
│   │   └── utils.ts                 # Utilitários
│   └── hooks/
│       ├── useConcepts.ts           # Hook para conceitos
│       ├── useImages.ts             # Hook para imagens
│       └── useImageEditor.ts        # Hook para editor
```

## Fluxos de Dados Principais

### 1. Upload de Imagens (Admin)
1. Admin seleciona categoria e tags
2. Arrasta imagens para o dropzone
3. Sistema detecta cor dominante
4. Processamento em lote:
   - Upload para Supabase Storage
   - Inserção na tabela `imagens`
   - Criação de registros em `imagem_tags_join`

### 2. Busca de Imagens (Público)
1. Usuário busca por termo em seu idioma
2. Sistema chama função RPC `search_images`
3. Função faz JOINs e retorna resultados
4. Galeria atualiza com infinite scroll

### 3. Edição de Imagens
1. Usuário clica em imagem
2. Modal abre com editor
3. Aplicações de crop/rotate no client-side
4. Download da imagem processada

## Performance e Escalabilidade

### Otimizações
- **Thumbnails**: Usar transformações do Supabase Storage
- **Infinite Scroll**: Carregar 50 imagens por vez
- **Masonry Layout**: CSS Grid ou react-masonry-css
- **Lazy Loading**: Imagens carregam sob demanda

### Cache
- Implementar cache de conceitos (categorias/tags)
- Cache de resultados de busca frequentes
- Considerar CDN para imagens

## Segurança

### Supabase RLS Policies
```sql
-- Exemplo de política para imagens (leitura pública)
CREATE POLICY "Imagens podem ser lidas por todos" ON imagens
  FOR SELECT USING (true);

-- Exemplo de política para upload (apenas admin)
CREATE POLICY "Apenas admins podem fazer upload" ON imagens
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
```

### Validações
- Validar tipos de arquivo (apenas imagens)
- Limitar tamanho de upload
- Sanitizar nomes de arquivo
- Validar dados de entrada no frontend

## Testes

### Testes Unitários
- Funções de utilitário
- Hooks customizados
- Componentes React

### Testes de Integração
- Fluxo completo de upload
- Busca multi-idiomas
- Editor de imagens

### Testes de Performance
- Carga da galeria com muitas imagens
- Tempo de resposta da busca
- Performance do infinite scroll