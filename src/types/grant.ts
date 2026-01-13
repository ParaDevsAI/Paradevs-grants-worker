export interface GrantItem {
  id: string
  source: 'twitter' | 'web'
  origin: string
  title: string
  description: string
  url?: string // deprecated - usar apply_url ou info_url
  author: string
  createdAt: string
  
  // Action fields - pelo menos UM deve existir
  apply_url?: string | undefined        // link direto para aplicar
  info_url?: string | undefined         // página com detalhes do grant
  apply_instructions?: string | undefined // fallback textual (ex: "Apply via forum X")
}

/**
 * Valida se o grant tem pelo menos uma forma de aplicação
 * Princípio: Grant sem "como aplicar" NÃO é grant
 */
export function hasApplyAction(grant: GrantItem): boolean {
  return !!(grant.apply_url || grant.info_url || grant.apply_instructions)
}
