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
  
  apply_url: string | null
  info_url: string | null
  apply_instructions: string | null
  
  ai_analyzed: boolean | null
  ai_apply: boolean | null
  ai_confidence: number | null
  ai_summary: string | null
  ai_category: string | null
  ai_model: string | null
  ai_analyzed_at: string | null
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
    if (!grant.apply_url && !grant.info_url && !grant.apply_instructions) {
      console.log('[Repository] Skip: grant without apply action')
      return
    }

    await supabase.from('grants').insert({
      tweet_id: grant.id,
      source: grant.source,
      title: grant.text.slice(0, 120),
      protocol: grant.author,
      amount: null,
      deadline: null,
      confidence: grant.score,
      raw_tweet: grant.text,
      apply_url: grant.apply_url || null,
      info_url: grant.info_url || null,
      apply_instructions: grant.apply_instructions || null,
      // AI Cache fields
      ai_analyzed: grant.ai_analyzed || false,
      ai_apply: grant.ai_apply || null,
      ai_confidence: grant.ai_confidence || null,
      ai_summary: grant.ai_summary || null,
      ai_category: grant.ai_category || null,
      ai_model: grant.ai_model || null,
      ai_analyzed_at: grant.ai_analyzed_at?.toISOString() || null
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
