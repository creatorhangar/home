export type StickerItem = { id: string; label: string; icon: string }
export type StickerPack = { id: string; name: string; items: StickerItem[] }

export const STICKER_PACKS: StickerPack[] = [
  {
    id: 'wellness',
    name: 'Wellness',
    items: [
      { id: 'water', label: 'Água', icon: 'GlassWater' },
      { id: 'yoga', label: 'Yoga', icon: 'Heart' },
      { id: 'sleep', label: 'Sono', icon: 'Moon' },
      { id: 'meal', label: 'Refeições', icon: 'Utensils' },
    ],
  },
  {
    id: 'productivity',
    name: 'Produtividade',
    items: [
      { id: 'focus', label: 'Foco', icon: 'Star' },
      { id: 'pomodoro', label: 'Pomodoro', icon: 'Timer' },
      { id: 'calendar', label: 'Calendário', icon: 'Calendar' },
      { id: 'ideas', label: 'Ideias', icon: 'Lightbulb' },
    ],
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    items: [
      { id: 'camera', label: 'Foto', icon: 'Camera' },
      { id: 'cake', label: 'Festa', icon: 'Cake' },
      { id: 'film', label: 'Cinema', icon: 'Film' },
      { id: 'car', label: 'Carro', icon: 'Car' },
    ],
  },
  {
    id: 'finance',
    name: 'Finanças',
    items: [
      { id: 'piggy', label: 'Poupança', icon: 'PiggyBank' },
      { id: 'shopping', label: 'Compras', icon: 'ShoppingCart' },
      { id: 'book', label: 'Livro', icon: 'Book' },
      { id: 'flag', label: 'Meta', icon: 'Flag' },
    ],
  },
]