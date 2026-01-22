import { GrantRecord } from '../repositories/grants'

function extractExternalLink(text?: string | null): string | null {
  if (!text) return null

  const regex = /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s)"]*)?/g
  
  const matches = text.match(regex)
  if (!matches) return null

  const external = matches.find(
    url => !url.includes('twitter.com') && !url.includes('x.com')
  )

  if (!external) return null

  return external.startsWith('http')
    ? external
    : `https://${external}`
}

function resolveApplyLink(grant: GrantRecord): string {
  if (grant.apply_url && !grant.apply_url.includes('twitter.com') && !grant.apply_url.includes('x.com')) {
    return grant.apply_url
  }

  const extracted =
    extractExternalLink(grant.ai_summary) ||
    extractExternalLink(grant.raw_tweet)

  if (extracted) return extracted

  if (grant.info_url && !grant.info_url.includes('twitter.com') && !grant.info_url.includes('x.com')) {
    return grant.info_url
  }

  if (grant.apply_url) return grant.apply_url
  if (grant.info_url) return grant.info_url
  return 'See grant page for application details'
}

function formatDateBR(dateString: string): string {
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

export function grantsToCSV(grants: GrantRecord[]): string {
  const header = [
    'tweet_id',
    'source',
    'protocol',
    'title',
    'apply_link',
    'amount',
    'deadline',
    'confidence',
    'created_at'
  ]

  const rows = grants.map((g) => [
    g.tweet_id,
    g.source,
    g.protocol ?? '',
    `"${(g.title || '').replace(/"/g, '""')}"`,
    resolveApplyLink(g),
    g.amount ?? '',
    g.deadline ?? '',
    g.confidence,
    formatDateBR(g.created_at)
  ])

  return [header.join(','), ...rows.map((r) => r.join(','))].join('\n')
}
