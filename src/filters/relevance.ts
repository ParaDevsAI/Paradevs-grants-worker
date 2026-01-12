import { TWITTER_RADAR, GrantCategory } from '../sources/twitter'
import { GrantItem } from '../types/grant'

export interface RelevantGrant {
  id: string
  author: string
  text: string
  category: GrantCategory
  score: number
  createdAt: string
  source: 'twitter' | 'web'
}

export function filterRelevantGrants(
  grants: GrantItem[],
  threshold = 5
): RelevantGrant[] {
  return grants
    .map((grant) => {
      let score = 0
      let category: GrantCategory = 'unknown'

      // Web grants start with higher base score
      if (grant.source === 'web') {
        score = 10
        category = 'ecosystem'
      }

      const source = TWITTER_RADAR.accounts.find(
        (a) => a.account.toLowerCase() === grant.author.toLowerCase()
      )

      if (source) {
        score += source.weight
        category = source.category
      }

      const text = grant.description.toLowerCase()
      for (const keyword of TWITTER_RADAR.keywords) {
        if (text.includes(keyword.term.toLowerCase())) {
          score += keyword.weight
          category = category === 'unknown' ? keyword.category : category
        }
      }

      return {
        id: grant.id,
        author: grant.author,
        text: grant.description,
        category,
        score,
        createdAt: grant.createdAt,
        source: grant.source
      }
    })
    .filter((grant) => grant.score >= threshold)
}
