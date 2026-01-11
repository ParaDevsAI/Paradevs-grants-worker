import { supabase } from '../db/supabase'
import { RelevantTweet } from '../filters/relevance'

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

/**
 * GrantRepository
 *
 * Responsável por:
 * - deduplicação
 * - persistência
 * - queries básicas
 */
export class GrantRepository {
  static async exists(tweetId: string): Promise<boolean> {
    const { data } = await supabase
      .from('grants')
      .select('tweet_id')
      .eq('tweet_id', tweetId)
      .limit(1)

    return !!data && data.length > 0
  }

  static async save(tweet: RelevantTweet): Promise<void> {
    await supabase.from('grants').insert({
      tweet_id: tweet.tweetId,
      source: 'twitter',
      title: tweet.text.slice(0, 120),
      protocol: tweet.author,
      amount: null,
      deadline: null,
      confidence: tweet.score,
      raw_tweet: tweet.text
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
