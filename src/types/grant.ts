export interface GrantItem {
  id: string
  source: 'twitter' | 'web'
  origin: string
  title: string
  description: string
  url?: string
  author: string
  createdAt: string
}
