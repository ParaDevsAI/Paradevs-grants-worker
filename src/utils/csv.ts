import { GrantRecord } from '../repositories/grants'

export function grantsToCSV(grants: GrantRecord[]): string {
  const header = [
    'tweet_id',
    'source',
    'protocol',
    'title',
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
    g.amount ?? '',
    g.deadline ?? '',
    g.confidence,
    g.created_at
  ])

  return [header.join(','), ...rows.map((r) => r.join(','))].join('\n')
}
