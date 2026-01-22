import { GrantCategory } from '../sources/twitter'
import { GrantItem, hasApplyAction } from '../types/grant'

export type GrantStatus = 'actionable' | 'discoverable' | 'weak'

export interface RelevantGrant {
  id: string
  author: string
  text: string
  category: GrantCategory
  score: number
  status: GrantStatus
  createdAt: string
  source: 'twitter' | 'web'
  
  // Action fields
  apply_url?: string | undefined
  info_url?: string | undefined
  apply_instructions?: string | undefined
  
  // Additional metadata
  amount?: string | undefined
  deadline?: string | undefined
  
  // AI Cache fields
  ai_analyzed?: boolean
  ai_apply?: boolean
  ai_confidence?: number
  ai_summary?: string | undefined
  ai_category?: string | undefined
  ai_model?: string | undefined
  ai_analyzed_at?: Date
}

function classifyStatus(grant: GrantItem): GrantStatus {
  if (grant.apply_url) return 'actionable'
  if (grant.info_url || grant.apply_instructions) return 'discoverable'
  return 'weak'
}

function calculateScore(grant: GrantItem): number {
  let score = 0

  // 1️⃣ Aplicabilidade (modula sem penalizar forte)
  const status = classifyStatus(grant)
  if (status === 'actionable') score += 12
  else if (status === 'discoverable') score += 6
  else score += 2 // weak

  if (grant.source === 'web') score += 6
  else if (grant.source === 'twitter') score += 3

  const text = `${grant.title} ${grant.description}`.toLowerCase()
  
  const keywordWeights: Record<string, number> = {
    grant: 3,
    grants: 3,
    funding: 3,
    open: 2,
    applications: 2,
    developers: 2,
    builders: 2,
    community: 2,
    ecosystem: 1,
    infra: 1,
    research: 1,
    program: 2,
    round: 2
  }

  let keywordScore = 0
  for (const [word, weight] of Object.entries(keywordWeights)) {
    if (text.includes(word)) keywordScore += weight
  }
  score += Math.min(keywordScore, 6) 

  const authority = grant.author.toLowerCase()
  if (['ethereum', 'arbitrum', 'optimism', 'optimismfnd'].includes(authority)) {
    score += 3
  } else if (['gitcoin', 'stellar', 'stellarorg', 'aave'].includes(authority)) {
    score += 2
  } else {
    score += 1
  }

  return score
}

function determineCategory(grant: GrantItem): GrantCategory {
  const text = `${grant.title} ${grant.description}`.toLowerCase()
  
  if (text.includes('research')) return 'research'
  if (text.includes('developer') || text.includes('builder')) return 'dev-tools'
  if (text.includes('infrastructure') || text.includes('infra')) return 'infrastructure'
  if (text.includes('defi') || text.includes('finance')) return 'defi'
  if (text.includes('dao') || text.includes('governance')) return 'dao'
  if (text.includes('ai') || text.includes('artificial intelligence')) return 'ai'
  if (text.includes('ecosystem') || text.includes('community')) return 'ecosystem'
  
  return grant.source === 'web' ? 'ecosystem' : 'unknown'
}

export function filterRelevantGrants(
  grants: GrantItem[],
  threshold = 10 
): RelevantGrant[] {
  return grants
    .filter((grant) => {
      if (!hasApplyAction(grant)) {
        console.log(`[Filter] Skipping grant without apply action: ${grant.id}`)
        return false
      }
      return true
    })
    .map((grant) => {
      const score = calculateScore(grant)
      const category = determineCategory(grant)
      const status = classifyStatus(grant)

      return {
        id: grant.id,
        author: grant.author,
        text: grant.description,
        category,
        score,
        status,
        createdAt: grant.createdAt,
        source: grant.source,
        apply_url: grant.apply_url,
        info_url: grant.info_url,
        apply_instructions: grant.apply_instructions,
        amount: grant.amount,
        deadline: grant.deadline
      }
    })
    .filter((grant) => grant.score >= threshold)
}
