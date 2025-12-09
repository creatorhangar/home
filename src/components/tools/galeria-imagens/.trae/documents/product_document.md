# SaaS de Galeria de Imagens - Documentação de Produto

## Visão Geral
Sistema de galeria de imagens escalável multi-idiomas com painel administrativo e interface pública, construído com Next.js e Supabase.

## Objetivos do Produto
- Permitir upload e gerenciamento de imagens por administradores
- Oferecer galeria pública com filtros e busca multi-idiomas
- Fornecer editor de imagens client-side
- Suportar múltiplos idiomas sem alterações de código

## Funcionalidades Principais

### Painel Administrativo
- Gerenciamento de conceitos (categorias e tags) com traduções
- Upload de imagens com arrastar e soltar
- Processamento em lote com aplicação de tags
- Sistema de categorização baseado em conceitos

### Galeria Pública
- Visualização com scroll infinito
- Filtros por categoria e tags
- Busca multi-idiomas
- Layout masonry responsivo

### Editor de Imagens
- Recorte com proporções fixas e livres
- Rotação de imagens
- Download instantâneo
- Processamento client-side

## Arquitetura Multi-idiomas
O sistema utiliza uma arquitetura de conceitos onde:
- **Conceitos**: São as categorias e tags (o que algo "é")
- **Traduções**: São os nomes em diferentes idiomas (como algo "é chamado")
- **Dados**: As imagens e suas associações (onde as coisas "estão")

Esta abordagem permite adicionar novos idiomas sem modificar código ou estrutura do banco.

## Público-alvo
- Designers e criativos procurando recursos visuais
- Administradores de conteúdo visual
- Usuários finais buscando imagens para projetos criativos

## Requisitos de Negócio
- Suporte a múltiplos idiomas (PT, EN, ES, FR, JA)
- Upload de imagens em lote
- Sistema de busca eficiente
- Editor de imagens integrado
- Interface responsiva e moderna