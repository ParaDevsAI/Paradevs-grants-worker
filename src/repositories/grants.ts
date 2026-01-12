import { supabase } from '../db/supabase'
import { RelevantGrant } from '../filters/relevance'

export interface GrantRecord {
  tweet_id: string
  source: string
  title: string
  protocol: string | null
  amount: string | null
  deadline: string | null
  confidence: number
  raw_tweet: string
  created_at: string
}

export class GrantRepository {
  static async exists(id: string): Promise<boolean> {
    const { data } = await supabase
      .from('grants')
      .select('tweet_id')
      .eq('tweet_id', id)
      .limit(1)

    return !!data && data.length > 0
  }

  static async save(grant: RelevantGrant): Promise<void> {
    await supabase.from('grants').insert({
      tweet_id: grant.id,
      source: grant.source,
      title: grant.text.slice(0, 120),
      protocol: grant.author,
      amount: null,
      deadline: null,
      confidence: grant.score,
      raw_tweet: grant.text
    })
  }

  static async findLast60Days(): Promise<GrantRecord[]> {
    const from = new Date()
    from.setDate(from.getDate() - 60)

    const { data } = await supabase
      .from('grants')
      .select('*')
      .gte('created_at', from.toISOString())
      .order('created_at', { ascending: false })

    return data ?? []
  }
}
