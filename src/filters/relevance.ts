import { TWITTER_RADAR, GrantCategory } from '../sources/twitter'
import { MockTweet } from '../collectors/twitter'

export interface RelevantTweet {
  tweetId: string
  author: string
  text: string
  category: GrantCategory
  score: number
  createdAt: string
}

/**
 * Filtro de relevância
 *
 * Estratégia:
 * + score por conta confiável
 * + score por palavra-chave
 * threshold simples
 */
export function filterRelevantTweets(
  tweets: MockTweet[],
  threshold = 5
): RelevantTweet[] {
  return tweets
    .map((tweet) => {
      let score = 0
      let category: GrantCategory = 'unknown'

      const source = TWITTER_RADAR.accounts.find(
        (a) => a.account.toLowerCase() === tweet.author.toLowerCase()
      )

      if (source) {
        score += source.weight
        category = source.category
      }

      for (const keyword of TWITTER_RADAR.keywords) {
        if (tweet.text.toLowerCase().includes(keyword.term.toLowerCase())) {
          score += keyword.weight
          category = category === 'unknown' ? keyword.category : category
        }
      }

      return {
        tweetId: tweet.id,
        author: tweet.author,
        text: tweet.text,
        category,
        score,
        createdAt: tweet.createdAt
      }
    })
    .filter((tweet) => tweet.score >= threshold)
}
