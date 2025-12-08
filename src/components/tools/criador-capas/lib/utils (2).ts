import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatImageUrl(url: string, width?: number, format: 'webp' | 'jpg' = 'webp') {
  if (!width) return url
  return `${url}?width=${width}&format=${format}`
}

export function detectImageCategory(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop()
  if (ext === 'png') return 'cat_png_sticker'
  if (['jpg', 'jpeg', 'webp'].includes(ext || '')) return 'cat_wallpaper'
  return 'cat_texture'
}

export function getImagePlaceholderColor(corDominante?: string | null): string {
  return corDominante || '#e5e7eb'
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}