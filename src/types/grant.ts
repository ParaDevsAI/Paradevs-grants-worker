export interface GrantItem {
  id: string
  source: 'twitter' | 'web'
  origin: string
  title: string
  description: string
  url?: string 
  author: string
  createdAt: string
  
  apply_url?: string | undefined        
  info_url?: string | undefined         
  apply_instructions?: string | undefined 
  
  amount?: string | undefined           
  deadline?: string | undefined         
}

export function hasApplyAction(grant: GrantItem): boolean {
  return !!(grant.apply_url || grant.info_url || grant.apply_instructions)
}
