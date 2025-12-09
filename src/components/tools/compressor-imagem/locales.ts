export const availableLanguages: Record<string, string> = {
  'en': 'English',
  'pt-BR': 'Português (Brasil)',
  'es': 'Español',
  'fr': 'Français',
  'de': 'Deutsch',
};

export const translations: Record<string, any> = {
  'en': {
    "header": {
      "title": "Image Compressor & Converter",
      "subtitle": "Reduce file sizes and change formats, fast and private.",
      "offline_badge": "100% Offline",
      "offline_message": "— Your files never leave your device",
      "theme_toggle_light": "Switch to light mode",
      "theme_toggle_dark": "Switch to dark mode",
      "logo_alt": "App Logo",
      "info_button_label": "How to use & FAQ"
    },
    "add_files_confirmation": {
      "title": "Files Already Exist",
      "message": "Do you want to add the new files to the current list or replace everything?",
      "replace_button": "Replace All",
      "add_button": "Add to List"
    },
    "rename_modal": {
      "title": "Rename Selected Files",
      "apply_rename": "Apply Names",
      "text_pattern": "Text Pattern",
      "text_pattern_placeholder": "e.g., Summer-Trip-{num}",
      "start_number": "Start Number",
      "preview": "Preview:",
      "preview_filename": "Summer-Trip-1.jpg"
    },
    "file_upload": {
      "drag_and_drop": "Drag and drop your images here",
      "or": "or",
      "or_paste": "or paste from clipboard (Ctrl+V)",
      "browse_files": "Browse Files",
      "supports": "Supports: {formats}"
    },
    "image_list": {
      "title": "Editor in Batch",
      "select_all": "Select All",
      "add_more": "Add More"
    },
    "image_card": {
      "before": "BEFORE",
      "after": "AFTER",
      "savings": "Saved {bytes}",
      "increase": "Increased {bytes}",
      "error_label": "Error",
      "byte_units": ["Bytes", "KB", "MB", "GB"],
      "no_preview": "Preview unavailable",
      "details_format": "{format} • {width}x{height}",
      "delete_file": "Delete file"
    },
    "settings_panel": {
        "live_preview": "Live Preview",
        "live_preview_placeholder": "Select a single image to see a live preview of your edits.",
        "presets_section_title": "Configuration Presets",
        "presets": "Presets",
        "preset_select": "Load a preset...",
        "preset_save": "Save current settings as a new preset",
        "preset_delete": "Delete selected preset",
        "preset_prompt_name": "Enter a name for this preset:",
        "preset_confirm_delete": "Are you sure you want to delete this preset?",
        "pdf_page_size": "Page Size",
        "pdf_orientation": "Orientation",
        "pdf_portrait": "Portrait",
        "pdf_landscape": "Landscape",
        "pdf_image_fit": "Image Fit",
        "pdf_fit_contain": "Contain",
        "pdf_fit_stretch": "Stretch"
    },
    "action_bar": {
      "settings_title": "Batch Editor",
      "section_compress": "Compress & Format",
      "section_resize": "Resize",
      "section_rotate": "Rotate",
      "section_watermark": "Watermark",
      "output_format": "Output Format",
      "quality": "Quality",
      "apply_edits": "Apply Edits",
      "apply_edits_count": {
        "one": "Apply to 1 image",
        "other": "Apply to {count} images"
      },
      "processing": "Processing...",
      "download_selected": "Download",
      "rename_selected": "Rename",
      "download_individual": "Download Individually",
      "download_zip": "Download as ZIP",
      "create_pdf_selected": {
        "one": "Create PDF (1)",
        "other": "Create PDF ({count})"
      },
      "delete_selected": "Delete",
      "resize_image": "Resize",
      "rotate": "Rotate",
      "pixels": "Pixels",
      "percentage": "Percentage",
      "width": "Width",
      "height": "Height",
      "fit_mode_contain": "Contain",
      "fit_mode_cover": "Cover",
      "fit_mode_fill": "Fill",
      "fit_mode_smart_fill": "Smart Fill",
      "watermark_text": "Text",
      "watermark_image": "Image",
      "watermark_size_perc": "Size",
      "watermark_opacity": "Opacity",
      "watermark_position": "Position",
      "watermark_enable": "Enable Watermark",
      "mosaic": "Mosaic",
      "angle": "Angle",
      "offset_x": "Offset X",
      "offset_y": "Offset Y",
      "upload_image": "Upload Image",
      "joystick_title": "Fine-tune Position"
    },
    "notifications": {
      "process_stalled": "The process stalled or took too long.",
      "tiff_error": "Failed to create TIFF. Your browser's privacy settings may be blocking this operation.",
      "files_too_large": {
          "title": "Some files were too large",
          "message": "The following files exceeded the 20MB limit and were not added:"
      },
      "heic_conversion": {
        "title": "HEIC File Detected",
        "message": "Your HEIC/HEIF file has been automatically converted to JPEG to proceed."
      },
      "heic_error": {
        "title": "HEIC Conversion Failed",
        "message": "Could not convert the following HEIC/HEIF file. It may be corrupted or in an unsupported format."
      }
    },
    "footer": {
      "made_by": "Made by"
    },
    "info_modal": {
      "title": "How to Use & FAQ",
      "how_to_title": "How to Use",
      "how_to_steps": [],
      "faq_title": "Frequently Asked Questions",
      "faq_items": []
    }
  },
  'pt-BR': {
    "header": {
      "title": "Compressor e Conversor de Imagens",
      "subtitle": "Reduza o tamanho dos arquivos e troque de formato, de forma rápida e privada.",
      "offline_badge": "100% Offline",
      "offline_message": "— Seus arquivos não saem do seu dispositivo",
      "theme_toggle_light": "Mudar para modo claro",
      "theme_toggle_dark": "Mudar para modo escuro",
      "logo_alt": "Logo do App",
      "info_button_label": "Como usar & FAQ"
    },
    "add_files_confirmation": {
      "title": "Arquivos já existem",
      "message": "Você deseja adicionar os novos arquivos à lista atual ou substituir tudo?",
      "replace_button": "Substituir Tudo",
      "add_button": "Adicionar à Lista"
    },
     "rename_modal": {
      "title": "Renomear Arquivos Selecionados",
      "apply_rename": "Aplicar Nomes",
      "text_pattern": "Padrão de Texto",
      "text_pattern_placeholder": "ex: Viagem-Verão-{num}",
      "start_number": "Número Inicial",
      "preview": "Prévia:",
      "preview_filename": "Viagem-Verão-1.jpg"
    },
    "file_upload": {
      "drag_and_drop": "Arraste e solte suas imagens aqui",
      "or": "ou",
      "or_paste": "ou cole da área de transferência (Ctrl+V)",
      "browse_files": "Procurar Arquivos",
      "supports": "Suporta: {formats}"
    },
    "image_list": {
      "title": "Editor em Lote",
      "select_all": "Selecionar Tudo",
      "add_more": "Adicionar Mais"
    },
    "image_card": {
      "before": "ANTES",
      "after": "DEPOIS",
      "savings": "Economia de {bytes}",
      "increase": "Aumento de {bytes}",
      "error_label": "Erro",
      "byte_units": ["Bytes", "KB", "MB", "GB"],
      "no_preview": "Visualização indisponível",
      "details_format": "{format} • {width}x{height}",
      "delete_file": "Excluir arquivo"
    },
     "settings_panel": {
        "live_preview": "Pré-visualização ao Vivo",
        "live_preview_placeholder": "Selecione uma única imagem para ver uma pré-visualização das suas edições.",
        "presets_section_title": "Perfis de Configuração",
        "presets": "Perfis",
        "preset_select": "Carregar um perfil...",
        "preset_save": "Salvar configurações atuais como novo perfil",
        "preset_delete": "Excluir perfil selecionado",
        "preset_prompt_name": "Digite um nome para este perfil:",
        "preset_confirm_delete": "Você tem certeza que deseja excluir este perfil?",
        "pdf_page_size": "Tamanho da Página",
        "pdf_orientation": "Orientação",
        "pdf_portrait": "Retrato",
        "pdf_landscape": "Paisagem",
        "pdf_image_fit": "Ajuste da Imagem",
        "pdf_fit_contain": "Conter",
        "pdf_fit_stretch": "Esticar"
    },
    "action_bar": {
      "settings_title": "Editor em Lote",
      "section_compress": "Comprimir & Formato",
      "section_resize": "Redimensionar",
      "section_rotate": "Rotacionar",
      "section_watermark": "Marca D'água",
      "output_format": "Formato de Saída",
      "quality": "Qualidade",
      "apply_edits": "Aplicar Edições",
      "apply_edits_count": {
        "one": "Aplicar em 1 imagem",
        "other": "Aplicar em {count} imagens"
      },
      "processing": "Processando...",
      "download_selected": "Baixar",
      "rename_selected": "Renomear",
      "download_individual": "Baixar Individualmente",
      "download_zip": "Baixar como ZIP",
      "create_pdf_selected": {
        "one": "Criar PDF (1)",
        "other": "Criar PDF ({count})"
      },
      "delete_selected": "Excluir",
      "resize_image": "Redimensionar",
      "rotate": "Girar",
      "pixels": "Pixels",
      "percentage": "Porcentagem",
      "width": "Largura",
      "height": "Altura",
      "fit_mode_contain": "Conter",
      "fit_mode_cover": "Preencher",
      "fit_mode_fill": "Esticar",
      "fit_mode_smart_fill": "Preenchimento Inteligente",
      "watermark_text": "Texto",
      "watermark_image": "Imagem",
      "watermark_size_perc": "Tamanho",
      "watermark_opacity": "Opacidade",
      "watermark_position": "Posição",
      "watermark_enable": "Ativar Marca D'água",
      "mosaic": "Mosaico",
      "angle": "Ângulo",
      "offset_x": "Desloc. X",
      "offset_y": "Desloc. Y",
      "upload_image": "Carregar Imagem",
      "joystick_title": "Ajuste Fino da Posição"
    },
    "notifications": {
      "process_stalled": "O processo travou ou demorou demais.",
      "tiff_error": "Falha ao criar TIFF. As configurações de privacidade do seu navegador podem estar bloqueando esta operação.",
      "files_too_large": {
          "title": "Alguns arquivos eram grandes demais",
          "message": "Os seguintes arquivos excederam o limite de 20MB e não foram adicionados:"
      },
      "heic_conversion": {
        "title": "Arquivo HEIC Detectado",
        "message": "Seu arquivo HEIC/HEIF foi convertido automaticamente para JPEG para prosseguir."
      },
      "heic_error": {
        "title": "Falha na Conversão do HEIC",
        "message": "Não foi possível converter o seguinte arquivo HEIC/HEIF. Ele pode estar corrompido ou em um formato não suportado."
      }
    },
    "footer": {
      "made_by": "Feito pela"
    },
     "info_modal": {
      "title": "Como Usar & FAQ",
      "how_to_title": "Como Usar",
      "how_to_steps": [],
      "faq_title": "Perguntas Frequentes",
      "faq_items": []
    }
  },
  'es': {
    "header": {
      "title": "Compresor y Convertidor de Imágenes"
    },
    "image_card": { "before": "ANTES", "after": "DESPUÉS" },
    "action_bar": {
        "settings_title": "Editor por Lotes",
        "section_compress": "Comprimir",
        "section_resize": "Redimensionar",
        "section_watermark": "Marca de Agua",
        "apply_edits": "Aplicar Ediciones"
    }
  },
  'fr': {
    "header": {
      "title": "Compresseur et Convertisseur d'Images"
    },
    "image_card": { "before": "AVANT", "after": "APRÈS" },
    "action_bar": {
        "settings_title": "Éditeur par lots",
        "section_compress": "Compresser",
        "section_resize": "Redimensionner",
        "section_watermark": "Filigrane",
        "apply_edits": "Appliquer les modifications"
    }
  },
  'de': {
    "header": {
      "title": "Bildkompressor & Konverter"
    },
    "image_card": { "before": "VORHER", "after": "NACHHER" },
    "action_bar": {
        "settings_title": "Stapel-Editor",
        "section_compress": "Komprimieren",
        "section_resize": "Größe ändern",
        "section_watermark": "Wasserzeichen",
        "apply_edits": "Änderungen anwenden"
    }
  }
};