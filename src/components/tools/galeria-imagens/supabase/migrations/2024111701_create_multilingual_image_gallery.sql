-- Migration: 2024111701_create_multilingual_image_gallery.sql
-- Descrição: Cria estrutura escalável multi-idiomas para galeria de imagens

-- 1. Tabela de Categorias (Conceitos)
CREATE TABLE IF NOT EXISTS categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identificador_unico TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Tags (Conceitos)
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identificador_unico TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Traduções de Categorias
CREATE TABLE IF NOT EXISTS categoria_traducoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria_id UUID REFERENCES categorias(id) ON DELETE CASCADE,
    codigo_idioma TEXT NOT NULL,
    nome_traduzido TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(categoria_id, codigo_idioma)
);

-- 4. Tabela de Traduções de Tags
CREATE TABLE IF NOT EXISTS tag_traducoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    codigo_idioma TEXT NOT NULL,
    nome_traduzido TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tag_id, codigo_idioma)
);

-- 5. Tabela de Imagens (Dados Principais)
CREATE TABLE IF NOT EXISTS imagens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria_id UUID REFERENCES categorias(id),
    destacado BOOLEAN DEFAULT FALSE,
    url_publica TEXT NOT NULL,
    cor_dominante TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabela de Junção (Relacionamento Muitos-para-Muitos)
CREATE TABLE IF NOT EXISTS imagem_tags_join (
    imagem_id UUID REFERENCES imagens(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (imagem_id, tag_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_categoria_traducoes_idioma ON categoria_traducoes(codigo_idioma);
CREATE INDEX IF NOT EXISTS idx_categoria_traducoes_nome ON categoria_traducoes(nome_traduzido);
CREATE INDEX IF NOT EXISTS idx_tag_traducoes_idioma ON tag_traducoes(codigo_idioma);
CREATE INDEX IF NOT EXISTS idx_tag_traducoes_nome ON tag_traducoes(nome_traduzido);
CREATE INDEX IF NOT EXISTS idx_imagens_categoria ON imagens(categoria_id);
CREATE INDEX IF NOT EXISTS idx_imagens_destacado ON imagens(destacado);
CREATE INDEX IF NOT EXISTS idx_imagens_created_at ON imagens(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_imagem_tags_imagem ON imagem_tags_join(imagem_id);
CREATE INDEX IF NOT EXISTS idx_imagem_tags_tag ON imagem_tags_join(tag_id);

-- Função RPC para busca multi-idiomas
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
    -- Busca por tag
    IF tag_busca IS NOT NULL THEN
        RETURN QUERY
        SELECT DISTINCT i.id, i.categoria_id, i.destacado, i.url_publica, i.cor_dominante, i.created_at
        FROM imagens i
        INNER JOIN imagem_tags_join itj ON i.id = itj.imagem_id
        INNER JOIN tag_traducoes tt ON itj.tag_id = tt.tag_id
        WHERE tt.codigo_idioma = idioma_busca AND tt.nome_traduzido = tag_busca
        ORDER BY i.created_at DESC
        LIMIT limite OFFSET offset_val;
    
    -- Busca por categoria
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

-- Função auxiliar para obter traduções de uma categoria
CREATE OR REPLACE FUNCTION get_categoria_traducoes(categoria_id UUID)
RETURNS TABLE (
    codigo_idioma TEXT,
    nome_traduzido TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT ct.codigo_idioma, ct.nome_traduzido
    FROM categoria_traducoes ct
    WHERE ct.categoria_id = $1
    ORDER BY ct.codigo_idioma;
END;
$$ LANGUAGE plpgsql;

-- Função auxiliar para obter traduções de uma tag
CREATE OR REPLACE FUNCTION get_tag_traducoes(tag_id UUID)
RETURNS TABLE (
    codigo_idioma TEXT,
    nome_traduzido TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT tt.codigo_idioma, tt.nome_traduzido
    FROM tag_traducoes tt
    WHERE tt.tag_id = $1
    ORDER BY tt.codigo_idioma;
END;
$$ LANGUAGE plpgsql;

-- Função para obter imagens com suas tags
CREATE OR REPLACE FUNCTION get_imagem_com_tags(imagem_id UUID, idioma TEXT DEFAULT 'pt')
RETURNS TABLE (
    id UUID,
    categoria_id UUID,
    categoria_nome TEXT,
    destacado BOOLEAN,
    url_publica TEXT,
    cor_dominante TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    tags TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.categoria_id,
        ct.nome_traduzido as categoria_nome,
        i.destacado,
        i.url_publica,
        i.cor_dominante,
        i.created_at,
        ARRAY_AGG(tt.nome_traduzido) as tags
    FROM imagens i
    LEFT JOIN categoria_traducoes ct ON i.categoria_id = ct.categoria_id AND ct.codigo_idioma = idioma
    LEFT JOIN imagem_tags_join itj ON i.id = itj.imagem_id
    LEFT JOIN tag_traducoes tt ON itj.tag_id = tt.tag_id AND tt.codigo_idioma = idioma
    WHERE i.id = imagem_id
    GROUP BY i.id, i.categoria_id, ct.nome_traduzido, i.destacado, i.url_publica, i.cor_dominante, i.created_at;
END;
$$ LANGUAGE plpgsql;

-- Dados iniciais de exemplo
INSERT INTO categorias (identificador_unico) VALUES 
    ('cat_wallpaper'),
    ('cat_texture'),
    ('cat_png_sticker'),
    ('cat_junk_journal'),
    ('cat_wedding')
ON CONFLICT (identificador_unico) DO NOTHING;

INSERT INTO tags (identificador_unico) VALUES 
    ('tag_natal'),
    ('tag_dourado'),
    ('tag_papel'),
    ('tag_vintage'),
    ('tag_floral'),
    ('tag_minimalista'),
    ('tag_colorido'),
    ('tag_preto_branco')
ON CONFLICT (identificador_unico) DO NOTHING;

-- Traduções iniciais
INSERT INTO categoria_traducoes (categoria_id, codigo_idioma, nome_traduzido) VALUES
    ((SELECT id FROM categorias WHERE identificador_unico = 'cat_wallpaper'), 'pt', 'Wallpapers'),
    ((SELECT id FROM categorias WHERE identificador_unico = 'cat_wallpaper'), 'en', 'Wallpapers'),
    ((SELECT id FROM categorias WHERE identificador_unico = 'cat_wallpaper'), 'es', 'Fondos de Pantalla'),
    ((SELECT id FROM categorias WHERE identificador_unico = 'cat_wallpaper'), 'fr', 'Fonds d\'Écran'),
    ((SELECT id FROM categorias WHERE identificador_unico = 'cat_texture'), 'pt', 'Texturas'),
    ((SELECT id FROM categorias WHERE identificador_unico = 'cat_texture'), 'en', 'Textures'),
    ((SELECT id FROM categorias WHERE identificador_unico = 'cat_texture'), 'es', 'Texturas'),
    ((SELECT id FROM categorias WHERE identificador_unico = 'cat_texture'), 'fr', 'Textures'),
    ((SELECT id FROM categorias WHERE identificador_unico = 'cat_png_sticker'), 'pt', 'PNG Stickers'),
    ((SELECT id FROM categorias WHERE identificador_unico = 'cat_png_sticker'), 'en', 'PNG Stickers'),
    ((SELECT id FROM categorias WHERE identificador_unico = 'cat_junk_journal'), 'pt', 'Junk Journal'),
    ((SELECT id FROM categorias WHERE identificador_unico = 'cat_junk_journal'), 'en', 'Junk Journal'),
    ((SELECT id FROM categorias WHERE identificador_unico = 'cat_wedding'), 'pt', 'Casamento'),
    ((SELECT id FROM categorias WHERE identificador_unico = 'cat_wedding'), 'en', 'Wedding'),
    ((SELECT id FROM categorias WHERE identificador_unico = 'cat_wedding'), 'es', 'Boda'),
    ((SELECT id FROM categorias WHERE identificador_unico = 'cat_wedding'), 'fr', 'Mariage')
ON CONFLICT (categoria_id, codigo_idioma) DO NOTHING;

INSERT INTO tag_traducoes (tag_id, codigo_idioma, nome_traduzido) VALUES
    ((SELECT id FROM tags WHERE identificador_unico = 'tag_natal'), 'pt', 'Natal'),
    ((SELECT id FROM tags WHERE identificador_unico = 'tag_natal'), 'en', 'Christmas'),
    ((SELECT id FROM tags WHERE identificador_unico = 'tag_natal'), 'es', 'Navidad'),
    ((SELECT id FROM tags WHERE identificador_unico = 'tag_natal'), 'fr', 'Noël'),
    ((SELECT id FROM tags WHERE identificador_unico = 'tag_dourado'), 'pt', 'Dourado'),
    ((SELECT id FROM tags WHERE identificador_unico = 'tag_dourado'), 'en', 'Gold'),
    ((SELECT id FROM tags WHERE identificador_unico = 'tag_dourado'), 'es', 'Dorado'),
    ((SELECT id FROM tags WHERE identificador_unico = 'tag_dourado'), 'fr', 'Or'),
    ((SELECT id FROM tags WHERE identificador_unico = 'tag_papel'), 'pt', 'Papel'),
    ((SELECT id FROM tags WHERE identificador_unico = 'tag_papel'), 'en', 'Paper'),
    ((SELECT id FROM tags WHERE identificador_unico = 'tag_vintage'), 'pt', 'Vintage'),
    ((SELECT id FROM tags WHERE identificador_unico = 'tag_vintage'), 'en', 'Vintage'),
    ((SELECT id FROM tags WHERE identificador_unico = 'tag_floral'), 'pt', 'Floral'),
    ((SELECT id FROM tags WHERE identificador_unico = 'tag_floral'), 'en', 'Floral'),
    ((SELECT id FROM tags WHERE identificador_unico = 'tag_minimalista'), 'pt', 'Minimalista'),
    ((SELECT id FROM tags WHERE identificador_unico = 'tag_minimalista'), 'en', 'Minimalist'),
    ((SELECT id FROM tags WHERE identificador_unico = 'tag_colorido'), 'pt', 'Colorido'),
    ((SELECT id FROM tags WHERE identificador_unico = 'tag_colorido'), 'en', 'Colorful'),
    ((SELECT id FROM tags WHERE identificador_unico = 'tag_preto_branco'), 'pt', 'Preto e Branco'),
    ((SELECT id FROM tags WHERE identificador_unico = 'tag_preto_branco'), 'en', 'Black and White')
ON CONFLICT (tag_id, codigo_idioma) DO NOTHING;

-- Habilitar RLS (Row Level Security)
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE categoria_traducoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tag_traducoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE imagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE imagem_tags_join ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança básicas
CREATE POLICY "Categorias podem ser lidas por todos" ON categorias FOR SELECT USING (true);
CREATE POLICY "Tags podem ser lidas por todos" ON tags FOR SELECT USING (true);
CREATE POLICY "Traduções de categorias podem ser lidas por todos" ON categoria_traducoes FOR SELECT USING (true);
CREATE POLICY "Traduções de tags podem ser lidas por todos" ON tag_traducoes FOR SELECT USING (true);
CREATE POLICY "Imagens podem ser lidas por todos" ON imagens FOR SELECT USING (true);
CREATE POLICY "Junções podem ser lidas por todos" ON imagem_tags_join FOR SELECT USING (true);

-- Políticas para admin (serão ajustadas conforme necessário)
CREATE POLICY "Apenas admins podem criar categorias" ON categorias FOR INSERT WITH CHECK (false);
CREATE POLICY "Apenas admins podem criar tags" ON tags FOR INSERT WITH CHECK (false);
CREATE POLICY "Apenas admins podem criar imagens" ON imagens FOR INSERT WITH CHECK (false);
CREATE POLICY "Apenas admins podem criar junções" ON imagem_tags_join FOR INSERT WITH CHECK (false);